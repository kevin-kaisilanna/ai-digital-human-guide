"""种子数据脚本 —— 将 data-pipeline 解析的 JSON 导入 SQLite"""

import json
import sys
from pathlib import Path

# 项目根目录
ROOT = Path(__file__).resolve().parent.parent.parent.parent

# 添加 server 到 sys.path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent.parent))

from app.db.database import SessionLocal, init_db
from app.models.knowledge import KnowledgeEntry, KnowledgeCategory, KnowledgeSource


def seed():
    """导入所有解析后的知识数据"""
    data_dir = ROOT / "src" / "data"

    data_files = [
        "knowledge-spots.json",
        "knowledge-guide.json",
        "knowledge-history.json",
        "knowledge-routes.json",
        "knowledge-faq.json",
    ]

    init_db()  # 确保表已创建
    db = SessionLocal()

    total = 0
    for filename in data_files:
        filepath = data_dir / filename
        if not filepath.exists():
            print(f"  跳过: {filename} (文件不存在)")
            continue

        with open(filepath, "r", encoding="utf-8") as f:
            entries = json.load(f)

        inserted = 0
        for entry in entries:
            # 提取标题：spots/guide 用 title，faq 用 question，history/routes 用 title
            title = entry.get("title") or entry.get("question") or ""
            if not title:
                continue

            # 提取内容：spots/guide/history/routes 用 content，faq 用 answer
            content = entry.get("content") or entry.get("answer") or ""

            # 映射分类 — 保留原始分类，不过度收拢
            cat_str = entry.get("category", "history")
            try:
                category = KnowledgeCategory[cat_str]
            except KeyError:
                category = KnowledgeCategory.history

            # 构建标签
            tags = []
            # 从结构化字段提取标签
            fields = entry.get("fields", {})
            if fields:
                spot_name = fields.get("景点名称", "")
                if spot_name:
                    tags.append(spot_name)
            # 从 keywords 字段提取标签（用于 FAQ）
            keywords = entry.get("keywords", [])
            if keywords:
                tags.extend(keywords[:5])

            # 检查是否已存在（按 title + content 前100字去重）
            content_prefix = content[:100] if content else ""
            existing = db.query(KnowledgeEntry).filter(
                KnowledgeEntry.title == title[:200],
                KnowledgeEntry.content.startswith(content_prefix)
            ).first()
            if existing:
                continue

            # 确定来源类型
            source_str = entry.get("source", "")
            if source_str == "manual":
                source = KnowledgeSource.manual
            else:
                source = KnowledgeSource.import_

            record = KnowledgeEntry(
                title=title[:200],
                content=content,
                category=category,
                tags=tags,
                source=source,
                source_file=entry.get("source_file", filename),
            )
            db.add(record)
            inserted += 1

        db.commit()
        total += inserted
        print(f"  {filename}: 新增 {inserted} 条")

    # 最终统计
    count = db.query(KnowledgeEntry).count()
    print(f"\n  知识库总计: {count} 条")
    db.close()


if __name__ == "__main__":
    print("导入种子数据...")
    seed()
    print("完成。")
