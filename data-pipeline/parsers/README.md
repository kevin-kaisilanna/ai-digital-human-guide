# Parsers 文件解析器

解析参考数据文件，提取结构化内容。

- `word_parser.py` — Word (.docx) 解析（使用 python-docx，提取段落文本和表格）
- `excel_parser.py` — Excel (.xlsx) 解析（使用 openpyxl，提取行列数据）

## 输入
- `示范景区公开资料包/灵山胜境：历史、文化、景点特色与个性化游览指南.docx`
- `示范景区公开资料包/灵山胜境 景点结构化数据集.docx`
- `示范景区公开资料包/景点景区旅游数据行为分析数据.xlsx`

## 输出
解析后的原始数据结构（dict/list），供 transformers 使用。
