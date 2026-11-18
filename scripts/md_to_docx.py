"""
将产品总体设计文档 Markdown 转换为专业排版 Word 文档 (.docx)。

排版规范：
  - 正文：宋体小四（12pt），1.5 倍行距，首行缩进 2 字符
  - 标题：黑体（Heading 1 小三/Heading 2 四号/Heading 3 小四），使用 Word 内置标题样式
         标题样式可在 Word 导航窗格中显示，可基于标题样式生成目录
  - 代码块：Consolas 9pt，浅灰背景
  - 表格：宋体五号（10.5pt），表头黑体加粗浅灰底
  - 目录：在封面后自动生成，基于标题样式
  - 页边距：上下 2.54cm，左右 3.17cm
  - 取消所有段落下边框线（无灰线）

清理规则：
  - 有序列表和无序列表转为连贯段落（分号分隔）
  - 英文括号 () 在中文上下文中替换为中文括号（）
  - 代码块保留等宽字体
  - Markdown 粗体/斜体标记去除
"""

import re
from pathlib import Path
from docx import Document
from docx.shared import Pt, Cm, RGBColor, Inches
from docx.enum.text import WD_ALIGN_PARAGRAPH, WD_LINE_SPACING
from docx.enum.style import WD_STYLE_TYPE
from docx.oxml.ns import qn
from docx.oxml import OxmlElement

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "submit" / "03-产品总体设计文档" / "总体设计文档.md"
DST = ROOT / "submit" / "03-产品总体设计文档" / "灵境智游-产品总体设计文档.docx"


# ═══════════════════════════════════════════════
# 样式工具
# ═══════════════════════════════════════════════

def _set_run_font(run, cn_name, en_name, size_pt, bold=False, color=None):
    run.font.size = Pt(size_pt)
    run.font.bold = bold
    run.font.name = en_name
    rPr = run._element.get_or_add_rPr()
    rFonts = OxmlElement('w:rFonts')
    rFonts.set(qn('w:eastAsia'), cn_name)
    rFonts.set(qn('w:ascii'), en_name)
    rFonts.set(qn('w:hAnsi'), en_name)
    rPr.insert(0, rFonts)
    if color:
        run.font.color.rgb = RGBColor(*color)


def _set_para_spacing(para, before_pt=0, after_pt=0, line_spacing=1.5, first_indent_chars=0):
    pf = para.paragraph_format
    pf.space_before = Pt(before_pt)
    pf.space_after = Pt(after_pt)
    pf.line_spacing = line_spacing
    if first_indent_chars > 0:
        pf.first_line_indent = Pt(12 * first_indent_chars)


def _add_para_shading(para, color_hex="F2F2F2"):
    pPr = para._element.get_or_add_pPr()
    shd = OxmlElement('w:shd')
    shd.set(qn('w:val'), 'clear')
    shd.set(qn('w:color'), 'auto')
    shd.set(qn('w:fill'), color_hex)
    pPr.append(shd)


def _remove_borders(para):
    """移除段落的所有边框（去掉灰线）"""
    pPr = para._element.get_or_add_pPr()
    pBdr = pPr.find(qn('w:pBdr'))
    if pBdr is not None:
        pPr.remove(pBdr)


# ═══════════════════════════════════════════════
# 文本清洗
# ═══════════════════════════════════════════════

def clean_mixed_parens(text):
    text = re.sub(r'([一-鿿　-〿＀-￯])\s*\(', r'\1（', text)
    text = re.sub(r'\)\s*([一-鿿　-〿＀-￯])', r'）\1', text)
    text = re.sub(r'\(([一-鿿][^)]{0,40})\)', r'（\1）', text)
    return text


def strip_markdown_format(text):
    text = re.sub(r'\*\*(.+?)\*\*', r'\1', text)
    text = re.sub(r'(?<!\*)\*(?!\*)(.+?)(?<!\*)\*(?!\*)', r'\1', text)
    text = re.sub(r'`([^`]+)`', r'\1', text)
    text = re.sub(r'\[([^\]]+)\]\([^)]+\)', r'\1', text)
    text = re.sub(r'!\[([^\]]*)\]\([^)]+\)', r'\1', text)
    return text


def convert_lists_to_prose(text):
    """将连续的列表项合并为连贯段落。"""
    lines = text.split('\n')
    result = []
    i = 0
    while i < len(lines):
        line = lines[i]
        stripped = line.strip()
        ul_m = re.match(r'^(\s*)[-*]\s+(.+)$', stripped)
        ol_m = re.match(r'^(\s*)(\d+)[.)]\s+(.+)$', stripped)

        if ul_m or ol_m:
            items = []
            indent_len = len(ul_m.group(1)) if ul_m else len(ol_m.group(1))
            content = ul_m.group(2) if ul_m else ol_m.group(3)
            items.append(content)
            j = i + 1
            while j < len(lines):
                ns = lines[j].strip()
                nu = re.match(r'^(\s*)[-*]\s+(.+)$', ns)
                no = re.match(r'^(\s*)(\d+)[.)]\s+(.+)$', ns)
                n_indent = len(nu.group(1)) if nu else (len(no.group(1)) if no else -1)
                if (nu or no) and n_indent == indent_len:
                    items.append(nu.group(2) if nu else no.group(3))
                    j += 1
                else:
                    break

            if len(items) >= 3:
                merged = "；".join(it.rstrip("。；;，,") for it in items) + "。"
            elif len(items) == 2:
                merged = items[0].rstrip("。；;，,") + "；" + items[1]
            else:
                merged = items[0]
            prefix = " " * indent_len
            result.append(f"{prefix}{merged}")
            i = j
        else:
            result.append(line)
            i += 1
    return '\n'.join(result)


# ═══════════════════════════════════════════════
# Word 构建
# ═══════════════════════════════════════════════

class DocBuilder:
    def __init__(self, doc):
        self.doc = doc

    def add_heading_1(self, text):
        text = strip_markdown_format(text)
        para = self.doc.add_paragraph()
        para.style = self.doc.styles['Heading 1']
        # 清空内置样式自动生成的默认空 run
        for r in para.runs:
            r.text = ""
        run = para.add_run(text)
        _set_run_font(run, '黑体', 'Arial', 15, bold=True)
        _set_para_spacing(para, before_pt=18, after_pt=10, line_spacing=1.5)
        _remove_borders(para)
        return para

    def add_heading_2(self, text):
        text = strip_markdown_format(text)
        para = self.doc.add_paragraph()
        para.style = self.doc.styles['Heading 2']
        for r in para.runs:
            r.text = ""
        run = para.add_run(text)
        _set_run_font(run, '黑体', 'Arial', 14, bold=True)
        _set_para_spacing(para, before_pt=14, after_pt=8, line_spacing=1.5)
        _remove_borders(para)
        return para

    def add_heading_3(self, text):
        text = strip_markdown_format(text)
        para = self.doc.add_paragraph()
        para.style = self.doc.styles['Heading 3']
        for r in para.runs:
            r.text = ""
        run = para.add_run(text)
        _set_run_font(run, '黑体', 'Arial', 12, bold=True)
        _set_para_spacing(para, before_pt=10, after_pt=6, line_spacing=1.5)
        _remove_borders(para)
        return para

    def add_body(self, text):
        """正文段落。"""
        if not text.strip():
            return None
        text = strip_markdown_format(text)
        text = clean_mixed_parens(text)
        para = self.doc.add_paragraph()
        run = para.add_run(text)
        _set_run_font(run, '宋体', 'Times New Roman', 12)
        _set_para_spacing(para, before_pt=0, after_pt=4, line_spacing=1.5, first_indent_chars=2)
        _remove_borders(para)
        return para

    def add_code_line(self, text):
        """代码行。"""
        para = self.doc.add_paragraph()
        run = para.add_run(text)
        _set_run_font(run, '宋体', 'Consolas', 9)
        _set_para_spacing(para, before_pt=1, after_pt=1, line_spacing=1.15)
        _add_para_shading(para, "F5F5F5")
        _remove_borders(para)
        return para

    def add_quote_block(self, text):
        """引用/注释段落。"""
        text = strip_markdown_format(text)
        text = clean_mixed_parens(text)
        para = self.doc.add_paragraph()
        run = para.add_run(text)
        _set_run_font(run, '宋体', 'Times New Roman', 9, color=(100, 100, 100))
        _set_para_spacing(para, before_pt=2, after_pt=2, line_spacing=1.2)
        _remove_borders(para)
        return para

    def add_image_placeholder(self, text):
        """图片描述占位符——带边框的浅色段落。"""
        para = self.doc.add_paragraph()
        run = para.add_run("【图片占位】" + text)
        _set_run_font(run, '宋体', 'Times New Roman', 10, color=(80, 80, 80))
        _set_para_spacing(para, before_pt=6, after_pt=6, line_spacing=1.3)
        _add_para_shading(para, "FAFAFA")
        _remove_borders(para)
        return para

    def add_table(self, headers, rows):
        """添加表格。"""
        table = self.doc.add_table(rows=1 + len(rows), cols=len(headers))
        table.style = 'Table Grid'
        for i, h in enumerate(headers):
            cell = table.rows[0].cells[i]
            cell.text = ""
            run = cell.paragraphs[0].add_run(strip_markdown_format(str(h)))
            _set_run_font(run, '黑体', 'Arial', 10, bold=True)
            _set_para_spacing(cell.paragraphs[0], before_pt=2, after_pt=2, line_spacing=1.0)
            _add_para_shading(cell.paragraphs[0], "E0E0E0")
        for r, row in enumerate(rows):
            for c, val in enumerate(row):
                cell = table.rows[r + 1].cells[c]
                cell.text = ""
                clean_val = clean_mixed_parens(strip_markdown_format(str(val)))
                run = cell.paragraphs[0].add_run(clean_val)
                _set_run_font(run, '宋体', 'Times New Roman', 10)
                _set_para_spacing(cell.paragraphs[0], before_pt=1, after_pt=1, line_spacing=1.05)
        # 表后空行
        spacer = self.doc.add_paragraph()
        _set_para_spacing(spacer, before_pt=4, after_pt=4, line_spacing=1.0)
        _remove_borders(spacer)
        return table


# ═══════════════════════════════════════════════
# Markdown 逐行解析
# ═══════════════════════════════════════════════

def parse_md_to_docx(db: DocBuilder, md_text: str):
    lines = md_text.split('\n')
    i = 0

    while i < len(lines):
        line = lines[i]

        if not line.strip():
            i += 1
            continue

        # 跳过水平线（原灰线来源）
        if line.strip() == '---':
            i += 1
            continue

        # 引用块
        if line.startswith('> '):
            qlines = []
            while i < len(lines) and lines[i].startswith('> '):
                qlines.append(lines[i][2:])
                i += 1
            db.add_quote_block(' '.join(qlines))
            continue

        # 代码块
        if line.startswith('```'):
            i += 1
            while i < len(lines) and not lines[i].startswith('```'):
                db.add_code_line(lines[i])
                i += 1
            if i < len(lines):
                i += 1
            continue

        # 图片占位符
        if line.strip().startswith('[图片描述') or line.strip().startswith('【图片'):
            img_lines = [line.strip()]
            j = i + 1
            while j < len(lines) and lines[j].strip() and not lines[j].startswith('#') and not lines[j].startswith('```') and not lines[j].strip().startswith('|'):
                img_lines.append(lines[j].strip())
                j += 1
            full_img = ' '.join(img_lines)
            full_img = full_img.replace('[图片描述：', '').replace('[图片描述:', '').rstrip(']')
            db.add_image_placeholder(full_img)
            i = j
            continue

        # 表格
        if '|' in line and line.strip().startswith('|'):
            tlines = []
            while i < len(lines) and '|' in lines[i]:
                tlines.append(lines[i])
                i += 1
            headers = []
            rows = []
            for ti, tl in enumerate(tlines):
                cells = [c.strip() for c in tl.split('|')]
                cells = [c for c in cells if c]
                if not cells:
                    continue
                if all(re.match(r'^[-:]+$', c) for c in cells):
                    continue
                if not headers:
                    headers = cells
                else:
                    rows.append(cells)
            if headers and len(headers) <= 12:
                padded = []
                for row in rows:
                    while len(row) < len(headers):
                        row.append("")
                    padded.append(row[:len(headers)])
                db.add_table(headers, padded)
            continue

        # 一级标题
        if line.startswith('# ') and not line.startswith('## '):
            db.add_heading_1(line[2:].strip())
            i += 1
            continue

        # 二级标题
        if line.startswith('## ') and not line.startswith('### '):
            db.add_heading_2(line[3:].strip())
            i += 1
            continue

        # 三级标题
        if line.startswith('### ') and not line.startswith('#### '):
            db.add_heading_3(line[4:].strip())
            i += 1
            continue

        # 四级标题 → 作为三级标题处理
        if line.startswith('#### '):
            db.add_heading_3(line[5:].strip())
            i += 1
            continue

        # 普通段落——收集连续文本行
        plines = []
        while i < len(lines) and lines[i].strip() \
                and not lines[i].startswith('#') \
                and not lines[i].startswith('```') \
                and not lines[i].startswith('> ') \
                and not lines[i].strip().startswith('|') \
                and not lines[i].strip() == '---' \
                and not lines[i].strip().startswith('[图片描述') \
                and not lines[i].strip().startswith('【图片'):
            plines.append(lines[i])
            i += 1

        text = ' '.join(plines)
        text = clean_mixed_parens(strip_markdown_format(text))
        if text.strip():
            db.add_body(text.strip())


# ═══════════════════════════════════════════════
# Word 样式设置
# ═══════════════════════════════════════════════

def setup_styles(doc):
    """设置 Word 内置标题样式的字体。"""
    # Normal
    style = doc.styles['Normal']
    style.font.name = 'Times New Roman'
    style.font.size = Pt(12)
    style.paragraph_format.line_spacing = 1.5
    rPr = style.element.get_or_add_rPr()
    rFonts = OxmlElement('w:rFonts')
    rFonts.set(qn('w:eastAsia'), '宋体')
    rPr.insert(0, rFonts)

    # 段落默认无边框
    style.paragraph_format.space_before = Pt(0)
    style.paragraph_format.space_after = Pt(4)

    # Heading 1
    h1 = doc.styles['Heading 1']
    h1.font.size = Pt(15)
    h1.font.bold = True
    h1.font.name = 'Arial'
    h1.font.color.rgb = RGBColor(0, 0, 0)
    h1rPr = h1.element.get_or_add_rPr()
    h1rFonts = OxmlElement('w:rFonts')
    h1rFonts.set(qn('w:eastAsia'), '黑体')
    h1rPr.insert(0, h1rFonts)

    # Heading 2
    h2 = doc.styles['Heading 2']
    h2.font.size = Pt(14)
    h2.font.bold = True
    h2.font.name = 'Arial'
    h2.font.color.rgb = RGBColor(0, 0, 0)
    h2rPr = h2.element.get_or_add_rPr()
    h2rFonts = OxmlElement('w:rFonts')
    h2rFonts.set(qn('w:eastAsia'), '黑体')
    h2rPr.insert(0, h2rFonts)

    # Heading 3
    h3 = doc.styles['Heading 3']
    h3.font.size = Pt(12)
    h3.font.bold = True
    h3.font.name = 'Arial'
    h3.font.color.rgb = RGBColor(0, 0, 0)
    h3rPr = h3.element.get_or_add_rPr()
    h3rFonts = OxmlElement('w:rFonts')
    h3rFonts.set(qn('w:eastAsia'), '黑体')
    h3rPr.insert(0, h3rFonts)


# ═══════════════════════════════════════════════
# 主流程
# ═══════════════════════════════════════════════

def main():
    print(f"Reading: {SRC}")
    with open(SRC, "r", encoding="utf-8") as f:
        raw = f.read()

    # 文本清洗
    cleaned = convert_lists_to_prose(raw)
    cleaned = re.sub(r'\n{3,}', '\n\n', cleaned)

    # 创建 Word 文档
    doc = Document()
    setup_styles(doc)

    # 页边距
    for section in doc.sections:
        section.top_margin = Cm(2.54)
        section.bottom_margin = Cm(2.54)
        section.left_margin = Cm(3.17)
        section.right_margin = Cm(3.17)

    # ── 封面 ──
    for _ in range(6):
        p = doc.add_paragraph()
        _set_para_spacing(p, before_pt=0, after_pt=0, line_spacing=1.0)
        _remove_borders(p)

    title_p = doc.add_paragraph()
    title_p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    _set_para_spacing(title_p, before_pt=0, after_pt=6)
    _remove_borders(title_p)
    r = title_p.add_run("灵境智游")
    _set_run_font(r, '黑体', 'Arial', 28, bold=True)

    sub_p = doc.add_paragraph()
    sub_p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    _set_para_spacing(sub_p, before_pt=0, after_pt=6)
    _remove_borders(sub_p)
    r = sub_p.add_run("产品总体设计文档")
    _set_run_font(r, '黑体', 'Arial', 18, bold=True)

    for _ in range(2):
        p = doc.add_paragraph()
        _set_para_spacing(p, before_pt=0, after_pt=0, line_spacing=1.0)
        _remove_borders(p)

    info_lines = [
        "第十五届中国软件杯 A5 赛题参赛作品",
        "应用场景：无锡灵山胜境（国家 5A 级旅游景区）",
        "数字人导游：小云",
        "版本：v2.1　　日期：2026 年 7 月",
        "团队：两人（后端开发 + 前端开发）",
    ]
    for ln in info_lines:
        p = doc.add_paragraph()
        p.alignment = WD_ALIGN_PARAGRAPH.CENTER
        _set_para_spacing(p, before_pt=2, after_pt=2, line_spacing=1.8)
        _remove_borders(p)
        r = p.add_run(ln)
        _set_run_font(r, '宋体', 'Times New Roman', 12)

    doc.add_page_break()

    # ── 目录 ──
    toc_heading = doc.add_paragraph(style='Heading 1')
    toc_heading.clear()
    r = toc_heading.add_run("目录")
    _set_run_font(r, '黑体', 'Arial', 15, bold=True)
    _set_para_spacing(toc_heading, before_pt=0, after_pt=18, line_spacing=1.5)
    _remove_borders(toc_heading)

    # 插入 TOC 域
    paragraph = doc.add_paragraph()
    _remove_borders(paragraph)
    run = paragraph.add_run()
    fldChar1 = OxmlElement('w:fldChar')
    fldChar1.set(qn('w:fldCharType'), 'begin')
    run._r.append(fldChar1)

    run2 = paragraph.add_run()
    instrText = OxmlElement('w:instrText')
    instrText.set(qn('xml:space'), 'preserve')
    instrText.text = ' TOC \\o "1-3" \\h \\z \\u '
    run2._r.append(instrText)

    run3 = paragraph.add_run()
    fldChar2 = OxmlElement('w:fldChar')
    fldChar2.set(qn('w:fldCharType'), 'separate')
    run3._r.append(fldChar2)

    run4 = paragraph.add_run()
    fldChar3 = OxmlElement('w:fldChar')
    fldChar3.set(qn('w:fldCharType'), 'end')
    run4._r.append(fldChar3)

    doc.add_page_break()

    # ── 正文 ──
    db = DocBuilder(doc)
    parse_md_to_docx(db, cleaned)

    # 保存
    doc.save(str(DST))
    print(f"Saved: {DST}")
    print(f"Size: {DST.stat().st_size / 1024:.1f} KB")


if __name__ == "__main__":
    main()
