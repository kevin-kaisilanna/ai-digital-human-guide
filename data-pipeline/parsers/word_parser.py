"""Word (.docx) 解析器 —— 提取段落文本和表格为结构化数据"""

from pathlib import Path
from docx import Document


def parse_docx(filepath: str) -> list[dict]:
    """
    解析 Word 文档。优先从表格提取，无表格则按段落拆分。
    返回: [{index, title, content, category, source_file}]
    """
    doc = Document(filepath)

    # 先尝试表格解析
    if doc.tables:
        table_entries = _parse_tables(doc, filepath)
        if len(table_entries) >= 3:
            return table_entries

    # 否则按段落解析
    return _parse_paragraphs(doc, filepath)


def _parse_paragraphs(doc: Document, filepath: str) -> list[dict]:
    """按段落拆分文档"""
    results = []
    current_title = Path(filepath).stem
    current_content = []
    index = 0

    for para in doc.paragraphs:
        text = para.text.strip()
        if not text:
            if current_content:
                full_text = "".join(current_content)
                results.append({
                    "index": index,
                    "title": current_title,
                    "content": full_text,
                    "category": _guess_category(full_text),
                    "source_file": Path(filepath).name,
                })
                index += 1
                current_content = []
                current_title = Path(filepath).stem
            continue

        if para.runs and para.runs[0].bold and len(text) < 50:
            if current_content:
                full_text = "".join(current_content)
                results.append({
                    "index": index,
                    "title": current_title,
                    "content": full_text,
                    "category": _guess_category(full_text),
                    "source_file": Path(filepath).name,
                })
                index += 1
                current_content = []
            current_title = text
        else:
            current_content.append(text)

    if current_content:
        full_text = "".join(current_content)
        results.append({
            "index": index,
            "title": current_title,
            "content": full_text,
            "category": _guess_category(full_text),
            "source_file": Path(filepath).name,
        })

    return results


def _parse_tables(doc: Document, filepath: str) -> list[dict]:
    """从表格中提取结构化数据，每个表格第一行作为列名"""
    results = []

    for table_idx, table in enumerate(doc.tables):
        rows = table.rows
        if len(rows) < 2:
            continue

        # 第一行作为列名
        header_cells = [cell.text.strip() for cell in rows[0].cells]
        headers = [h if h else f"col_{i}" for i, h in enumerate(header_cells)]

        # 如果第一行看起来不是表头（没有标准列名），跳过
        if not _looks_like_header(headers):
            continue

        for row in rows[1:]:
            cells = [cell.text.strip() for cell in row.cells]
            if all(not c for c in cells):
                continue

            record = {}
            for i, cell_text in enumerate(cells):
                if i < len(headers):
                    record[headers[i]] = cell_text

            # 用第一列或第二列作为标题
            title = record.get(headers[0], "") or record.get(headers[1], "") or f"entry_{table_idx}"

            # 构建 content：把所有非空字段拼接
            content_parts = []
            for k, v in record.items():
                if v and k != headers[0]:
                    content_parts.append(f"{k}：{v}")
            content = "；".join(content_parts)

            results.append({
                "index": len(results),
                "title": title[:80],
                "content": content,
                "fields": record,
                "category": _guess_category(content),
                "source_file": Path(filepath).name,
            })

    return results


def _looks_like_header(headers: list[str]) -> bool:
    """判断是否是数据表头（含典型列名）"""
    typical = {"名称", "位置", "参数", "功能", "文化", "介绍", "ID", "景点", "景区"}
    matched = sum(1 for h in headers if any(t in h for t in typical))
    return matched >= 2


def _guess_category(text: str) -> str:
    """根据内容关键词猜测分类"""
    keywords = {
        "history": ["年", "代", "建于", "修建", "唐代", "宋代", "明代", "清代", "乾隆", "康熙", "历史", "玄奘", "千年"],
        "spots": ["米", "高", "宽", "面积", "平方米", "建筑", "塔", "寺", "宫", "佛", "殿", "广场", "桥", "门", "坛"],
        "facility": ["卫生间", "餐厅", "入口", "出口", "停车场", "服务", "开放时间", "票价", "门票"],
        "events": ["活动", "节", "表演", "演出", "时间表", "演艺", "场次"],
    }
    scores = {cat: sum(1 for kw in kws if kw in text) for cat, kws in keywords.items()}
    if max(scores.values()) == 0:
        return "history"
    return max(scores, key=scores.get)
