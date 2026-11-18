# Chat 对话管理模块

对话编排核心，协调 ASR → NLU → RAG → LLM → TTS 全链路。

## 关键约束 (PRD)
- 语音问答 < 5 秒开始回答 → 全链路流式处理
- 支持连续对话 + 上下文衔接
- 支持语音输入（ASR 转写）和文字输入

## 文件
- `chat_service.py` — 对话编排（ASR → RAG → LLM → TTS 流水线）
- `message_store.py` — 消息持久化存储
- `session_manager.py` — 会话管理（创建/过期/上下文）
