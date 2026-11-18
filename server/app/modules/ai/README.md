# AI / LLM 集成模块

负责与 Claude API 交互，实现智能问答核心逻辑。

## 关键约束 (PRD)
- 语音问答响应 < 5 秒 → 必须使用 prompt caching + streaming
- 事实性问答准确率 ≥ 90% → 高质量 RAG 检索 + 系统提示词约束

## 文件
- `claude_client.py` — Claude API 客户端（prompt caching + streaming SSE）
- `prompt_templates.py` — 系统提示词模板（导游人设/回答风格/安全边界）
- `context_builder.py` — 多轮对话上下文构建器（截断/摘要/指代消解）
- `response_parser.py` — AI 回复解析（提取表情标记/动作指令）
