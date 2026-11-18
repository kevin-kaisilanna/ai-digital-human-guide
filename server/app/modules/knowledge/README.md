# Knowledge 知识库管理模块

负责知识条目的 CRUD、文档解析入库、RAG 检索。

## 关键约束 (PRD)
- 知识更新后数字人回答即时生效
- 支持上传 Word/TXT/PDF

## 文件
- `knowledge_service.py` — 知识条目 CRUD 业务逻辑
- `rag_retriever.py` — RAG 检索器（查询向量化 → 相似度检索 → 重排序）
- `embedding_service.py` — Embedding 服务（文本分块 + 向量化）
- `vector_db.py` — 向量数据库接口抽象
