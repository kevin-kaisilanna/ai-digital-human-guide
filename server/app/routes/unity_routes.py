"""
Unity ChatManager 桥接路由

Unity WebGL ChatManager C# 脚本硬编码了以下端点：
  POST http://127.0.0.1:8000/chat/llm/
  Content-Type: application/x-www-form-urlencoded
  Body: userText=...

期望返回纯文本格式：
  表情：xxx|动作：xxx|回复文本：xxx|指令：xxx
"""

from fastapi import APIRouter, Form, HTTPException
from fastapi.responses import PlainTextResponse
from app.modules.ai.prompt_templates import mock_reply, detect_language

router = APIRouter(tags=["unity"])


@router.post("/chat/llm/", response_class=PlainTextResponse)
async def unity_chat_llm(userText: str = Form(...)):
    """
    Unity ChatManager 直接调用的 LLM 端点。
    """
    if not userText or not userText.strip():
        raise HTTPException(status_code=400, detail="消息内容不能为空")

    text = userText.strip()
    lang = detect_language(text)
    return mock_reply(text, lang)


@router.post("/chat/llm/basic/", response_class=PlainTextResponse)
async def unity_chat_llm_basic(userText: str = Form(...)):
    """基础 LLM 调用（不含系统提示词的角色设定），供 Unity 备选"""
    if not userText or not userText.strip():
        raise HTTPException(status_code=400, detail="消息内容不能为空")

    text = userText.strip()
    lang = detect_language(text)
    return mock_reply(text, lang)


@router.post("/chat/recognize/")
async def unity_voice_recognize():
    """语音识别占位 — 实际由 Unity 内部处理"""
    return {"result": ["（语音识别占位）"]}


@router.post("/chat/synthesis/")
async def unity_voice_synthesis():
    """语音合成占位 — 实际由 Unity 内部处理"""
    return {"audioUrl": ""}


@router.post("/face/analysis/")
async def unity_face_analysis():
    """人脸表情分析占位"""
    return {"analysis": None, "img": ""}
