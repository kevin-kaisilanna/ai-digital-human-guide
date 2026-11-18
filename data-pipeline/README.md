# Data Pipeline — 数据导入流水线

将 `示范景区公开资料包/` 中的参考数据解析为结构化知识库数据。

## 流水线

```
Word/Excel 文件 → parsers (解析) → transformers (转换) → loaders (写入数据库/向量库)
```

## 使用

```bash
pip install -r requirements.txt
python main.py
```

## 依赖
- python-docx — Word 文件解析
- openpyxl — Excel 文件解析
