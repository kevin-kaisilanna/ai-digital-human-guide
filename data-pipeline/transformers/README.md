# Transformers 数据转换器

将解析后的原始数据转换为知识库格式。

- `knowledge_transformer.py` — Word 文本段落 → KnowledgeEntry[] （分块/分类/去重/添加标签）
- `analytics_transformer.py` — Excel 行数据 → AnalyticsRecord[] （清洗/聚合/统计）
- `embedder.py` — KnowledgeEntry → vector embeddings （调用 embedding API）
