"""Chat 编排模块 —— RAG → AI → 存库"""

import uuid
from datetime import datetime
from app.modules.knowledge.rag_retriever import retrieve
from app.modules.ai.claude_client import chat_stream
from app.db.database import SessionLocal
from app.models.conversation import Conversation, QueryLog


async def handle_chat(
    message: str,
    session_id: str = "default",
    message_type: str = "text",
    language: str = "zh",
):
    """
    处理一条聊天消息 —— 异步生成器，逐条 yield SSE 事件。
    Starlette StreamingResponse 消费这个生成器。
    """
    # 1. RAG 检索相关知识
    context = retrieve(message, top_k=3)

    # 2. 获取对话历史
    db = SessionLocal()
    try:
        conv = db.query(Conversation).filter(
            Conversation.session_id == session_id
        ).first()
        history = conv.messages if conv else []
    finally:
        db.close()

    # 3. AI 流式回复——实时 yield 给客户端
    full_reply = ""
    async for sse_event in chat_stream(message, context, history, language):
        full_reply += _extract_content(sse_event)
        yield sse_event

    # 4. 保存对话记录（SSE 流结束后）
    db = SessionLocal()
    try:
        if not conv:
            conv = Conversation(
                id=str(uuid.uuid4()),
                session_id=session_id,
                visitor_id="visitor",
                messages=[],
            )
            db.add(conv)

        msgs = list(conv.messages or [])
        msgs.append({
            "role": "user",
            "type": message_type,
            "content": message,
            "created_at": datetime.utcnow().isoformat(),
        })
        msgs.append({
            "role": "ai",
            "type": "text",
            "content": full_reply,
            "created_at": datetime.utcnow().isoformat(),
        })
        conv.messages = msgs[-20:]

        log = QueryLog(
            id=str(uuid.uuid4()),
            visitor_id="visitor",
            question=message,
            answer=full_reply,
            sentiment="neutral",
        )
        db.add(log)
        db.commit()
    except Exception as e:
        db.rollback()
        print(f"[chat_service] 保存失败: {e}")
    finally:
        db.close()


def _extract_content(sse_event: str) -> str:
    """从单个 SSE 事件中提取文本内容"""
    import json
    if sse_event.startswith("data: "):
        try:
            data = json.loads(sse_event[6:])
            if data.get("type") == "text":
                return data.get("content", "")
        except json.JSONDecodeError:
            pass
    return ""


def _extract_text_from_events(events: list[str]) -> str:
    """从 SSE 事件中提取完整文本"""
    import json
    full = ""
    for event in events:
        if event.startswith("data: "):
            try:
                data = json.loads(event[6:])
                if data.get("type") == "text":
                    full += data.get("content", "")
            except json.JSONDecodeError:
                pass
    return full


def get_chat_history(session_id: str = "default", page: int = 1, page_size: int = 20):
    """获取对话历史"""
    db = SessionLocal()
    try:
        conv = db.query(Conversation).filter(
            Conversation.session_id == session_id
        ).first()
        if not conv:
            return {"messages": [], "total": 0}
        messages = conv.messages or []
        total = len(messages)
        start = (page - 1) * page_size
        end = start + page_size
        return {"messages": messages[start:end], "total": total}
    finally:
        db.close()
