# 数据模型 (SQLAlchemy ORM)

- `knowledge.py` — 知识条目表 (id, title, content, category, source, embedding, timestamps)
- `conversation.py` — 对话记录表 (id, session_id, visitor_id, messages, sentiment)
- `analytics.py` — 统计数据表 (date, service_count, online_count, satisfaction)
- `user.py` — 管理员用户表 (id, username, password_hash, role)
