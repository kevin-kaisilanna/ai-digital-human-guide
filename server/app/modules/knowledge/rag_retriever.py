"""RAG 检索器 —— 关键词 + 中文分词检索
数据源策略: SQLite 与 JSON 合并去重，确保知识全覆盖。
管理后台的知识更新对数字人回答即时生效。
"""

import json
import re
from pathlib import Path
from app.models.knowledge import KnowledgeEntry
from app.db.database import SessionLocal

# 数据文件路径
ROOT = Path(__file__).resolve().parent.parent.parent.parent.parent
DATA_DIR = ROOT / "src" / "data"


# ── 中文分词（轻量级，零依赖）─────────────────────────────────
# 不含 jieba 依赖时，使用正则 + 字符级 bigram 策略
def _tokenize(text: str) -> list[str]:
    """中文混合分词：按标点切分 + 2-4 字滑动窗口生成 tokens"""
    tokens = set()
    # 1. 按标点和空格切分成片段
    segments = re.split(r"[，。！？、：；\s,.\!\?:;]+", text)
    for seg in segments:
        seg = seg.strip()
        if not seg:
            continue
        # 2. 2-gram / 3-gram 滑动窗口（覆盖中文多字词）
        for n in (2, 3, 4):
            if len(seg) >= n:
                for i in range(len(seg) - n + 1):
                    tokens.add(seg[i:i + n])
        # 3. 整个片段也作为一个 token
        tokens.add(seg)
    return list(tokens)


def _load_from_db() -> list[dict]:
    """从 SQLite 数据库加载所有知识条目"""
    db = SessionLocal()
    try:
        entries = db.query(KnowledgeEntry).all()
        if not entries:
            return []
        result = []
        for e in entries:
            # 过滤掉明显编码损坏的条目
            content = e.content or ""
            title = e.title or ""
            if _is_garbled(title) or _is_garbled(content):
                continue
            category = e.category.value if e.category else "history"
            tags = e.tags or []
            result.append({
                "title": title,
                "content": content,
                "category": category,
                "tags": tags,
                "source": e.source.value if e.source else "manual",
                "source_file": e.source_file or "",
            })
        return result
    except Exception:
        return []
    finally:
        db.close()


def _is_garbled(text: str) -> bool:
    """检测文本是否编码损坏（含大量乱码字符）"""
    if not text:
        return False
    # 统计可疑字符比例：连续非中英文数字标点超过 30% 判定为乱码
    valid = len(re.findall(r"[一-鿿　-〿＀-￯a-zA-Z0-9\s,.!?，。！？；：、（）()【】「」\-—]", text))
    return valid < len(text) * 0.5


def _load_from_json() -> list[dict]:
    """从 JSON 文件加载知识条目"""
    all_entries = []
    json_files = [
        "knowledge-spots.json",
        "knowledge-guide.json",
        "knowledge-faq.json",
        "knowledge-history.json",
        "knowledge-routes.json",
    ]
    for filename in json_files:
        filepath = DATA_DIR / filename
        if not filepath.exists():
            continue
        try:
            with open(filepath, "r", encoding="utf-8") as f:
                data = json.load(f)
            for entry in data:
                content = entry.get("content", "")
                title = entry.get("title", "")
                if not content and not title:
                    continue
                # FAQ 格式：question/answer
                if "question" in entry and "answer" in entry:
                    title = entry.get("question", title)
                    content = entry.get("answer", content)
                all_entries.append({
                    "title": title,
                    "content": content,
                    "category": entry.get("category", "history"),
                    "tags": entry.get("keywords", entry.get("tags", [])),
                    "source": entry.get("source", "import"),
                    "source_file": entry.get("source_file", filename),
                })
        except (json.JSONDecodeError, OSError):
            continue
    return all_entries


def _load_knowledge() -> list[dict]:
    """加载知识库：合并 DB 和 JSON，按 (title, content[:80]) 去重"""
    # 先加载 JSON（基础数据），再加载 DB（管理后台增补数据）
    entries = _load_from_json()
    seen = set()
    deduped = []
    for e in entries:
        key = (e["title"], e["content"][:80])
        if key not in seen:
            seen.add(key)
            deduped.append(e)

    # 合并 DB 条目（管理后台手动新增/修改的知识）
    db_entries = _load_from_db()
    for e in db_entries:
        key = (e["title"], e["content"][:80])
        if key not in seen:
            seen.add(key)
            deduped.append(e)
    return deduped


def retrieve(query: str, top_k: int = 5) -> list[dict]:
    """
    检索与查询最相关的知识条目。
    使用中文分词 + 关键词 tf 评分，不依赖外部 NLP 库。
    """
    entries = _load_knowledge()
    if not entries:
        return []

    # 对查询分词
    query_tokens = _tokenize(query)
    if not query_tokens:
        return []

    scored = []
    for entry in entries:
        content = entry.get("content", "")
        title = entry.get("title", "")
        tags = entry.get("tags", [])

        score = 0

        # 标题精确匹配加权（最高优先级）
        if title and title in query:
            score += 15

        # 标签命中加权
        for tag in tags:
            if tag and tag in query:
                score += 10
            # 部分匹配
            for qt in query_tokens:
                if tag and qt in tag:
                    score += 5

        # 对内容做分词，计算 token 命中率
        if content:
            content_lower = content.lower()
            for qt in query_tokens:
                if qt in content_lower:
                    score += 2  # 内容命中
                if qt in title:
                    score += 4  # 标题命中

        # 标签命中加权（细粒度）
        for tag in tags:
            if tag:
                for qt in query_tokens:
                    if qt in tag:
                        score += 3

        if score > 0:
            scored.append((score, entry))

    # 按分数降序排序
    scored.sort(key=lambda x: x[0], reverse=True)

    result = []
    for score, entry in scored[:top_k]:
        result.append({
            "title": entry.get("title", ""),
            "content": entry.get("content", ""),
            "category": entry.get("category", "history"),
        })

    return result


def retrieve_faq(query: str, top_k: int = 5) -> list[dict]:
    """专门检索 FAQ 类型的知识条目"""
    entries = _load_knowledge()
    faq_entries = [e for e in entries if e.get("category") == "faq"]

    if not faq_entries:
        return retrieve(query, top_k)

    query_tokens = _tokenize(query)
    scored = []
    for entry in faq_entries:
        content = entry.get("content", "")
        title = entry.get("title", "")
        tags = entry.get("tags", [])

        score = 0
        for tag in tags:
            if tag and tag in query:
                score += 10
        for qt in query_tokens:
            if qt in content:
                score += 2
            if qt in title:
                score += 3
            for tag in tags:
                if tag and qt in tag:
                    score += 5

        if score > 0:
            scored.append((score, entry))

    scored.sort(key=lambda x: x[0], reverse=True)
    return [
        {"title": e.get("title", ""), "content": e.get("content", ""), "category": "faq"}
        for _, e in scored[:top_k]
    ]


def get_all_spots() -> list[dict]:
    """获取所有景点列表"""
    entries = _load_knowledge()
    spots = [e for e in entries if e.get("category") == "spots"]
    if not spots:
        spots = [e for e in entries if e.get("category") != "faq"]

    result = []
    for spot in spots:
        content = spot.get("content", "")
        result.append({
            "id": spot.get("title", ""),
            "name": spot.get("title", ""),
            "description": content[:200] if content else "",
        })
    return result


def get_categories() -> list[dict]:
    """获取知识库分类统计"""
    entries = _load_knowledge()
    cat_count = {}
    for e in entries:
        cat = e.get("category", "history")
        cat_count[cat] = cat_count.get(cat, 0) + 1

    return [
        {"category": cat, "count": count, "label": _cat_label(cat)}
        for cat, count in sorted(cat_count.items())
    ]


def _cat_label(cat: str) -> str:
    labels = {
        "history": "历史文化",
        "spots": "景点介绍",
        "facility": "设施服务",
        "events": "活动资讯",
        "faq": "常见问题",
        "guide": "游览指南",
    }
    return labels.get(cat, cat)
