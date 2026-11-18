"""Chat API 路由"""

import json
from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse
from app.modules.chat.chat_service import handle_chat, get_chat_history
from app.modules.ai.prompt_templates import build_first_greeting, detect_language
from app.modules.asr.asr_service import transcribe_base64
from app.schemas.chat import SendMessageRequest, ChatHistoryRequest

router = APIRouter(prefix="/api/chat", tags=["chat"])


@router.post("/send")
async def send_message(req: SendMessageRequest):
    """发送消息，SSE 流式返回 AI 回复"""
    content = req.content or ""

    # 语音消息：先 ASR 转写再对话
    if req.type == "voice":
        if req.audio_base64:
            transcribed = transcribe_base64(req.audio_base64)
            if transcribed:
                content = transcribed
            else:
                content = "[语音消息]"  # 转写失败时的降级处理
        elif not content:
            raise HTTPException(400, "语音消息需要提供 audio_base64 或 content")

    if not content:
        raise HTTPException(400, "消息内容不能为空")

    language = detect_language(content)

    return StreamingResponse(
        handle_chat(content, req.session_id or "default", req.type, language),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
        }
    )


@router.get("/history")
async def get_history(session_id: str = "default", page: int = 1, page_size: int = 20):
    """获取对话历史"""
    return get_chat_history(session_id, page, page_size)


@router.get("/greeting")
async def get_greeting(lang: str = "zh"):
    """获取初始打招呼消息（lang=zh|en）"""
    return {"message": build_first_greeting(lang)}
