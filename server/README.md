# Server — 后端 API 服务

Python FastAPI 服务，为 visitor-app 和 admin-web 提供 REST API + SSE 流式接口。

## 技术栈
- Python 3.11+
- FastAPI
- SQLAlchemy + Alembic (数据库迁移)
- Anthropic Python SDK (Claude API)
- Pydantic (数据校验)

## 启动

```bash
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
python main.py
```

## 模块结构

| 模块 | 职责 | 对应 PRD |
|------|------|----------|
| `ai/` | Claude API 集成 | PRD 4.1.2 |
| `tts/` | 语音合成 + 口型同步 | PRD 4.1.1 |
| `knowledge/` | 知识库 CRUD + RAG 检索 | PRD 4.2.1 |
| `analytics/` | 数据分析 + 报告生成 | PRD 4.2.3/4 |
| `user/` | 用户认证 | — |
| `chat/` | 对话编排流水线 | PRD 4.1.1 |
