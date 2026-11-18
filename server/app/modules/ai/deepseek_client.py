"""DeepSeek 客户端 —— admin-web「AI 对话测试」专用

DeepSeek 提供 Anthropic 兼容代理（/anthropic/v1/messages），
支持流式 SSE 输出。
"""

import json
from typing import AsyncGenerator
import httpx
from app.config.settings import settings

DEEPSEEK_MESSAGES_URL: str = ""


def _get_url() -> str:
    """动态拼接 API URL（兼容配置变更后重新调用）"""
    base = settings.DEEPSEEK_BASE_URL.rstrip("/")
    return f"{base}/v1/messages"


async def chat_stream(
    user_message: str,
    system_prompt: str = "",
) -> AsyncGenerator[str, None]:
    """
    DeepSeek 流式对话，逐 token yield SSE 事件。
    返回: data: {"type":"text","content":"..."}  + data: {"type":"done"}
    """
    if not settings.DEEPSEEK_API_KEY:
        yield _sse("text", "DeepSeek API 未配置：请在 .env 中设置 DEEPSEEK_API_KEY")
        yield _sse("done")
        return

    messages = []
    if system_prompt:
        messages.append({"role": "system", "content": system_prompt})
    messages.append({"role": "user", "content": user_message})

    try:
        async with httpx.AsyncClient(timeout=45.0) as client:
            async with client.stream(
                "POST",
                _get_url(),
                headers={
                    "x-api-key": settings.DEEPSEEK_API_KEY,
                    "anthropic-version": "2023-06-01",
                    "content-type": "application/json",
                },
                json={
                    "model": settings.DEEPSEEK_MODEL,
                    "max_tokens": 2048,
                    "messages": messages,
                    "stream": True,
                },
            ) as response:
                accumulated = ""

                async for line in response.aiter_lines():
                    if line.startswith("data: "):
                        data = line[6:]
                        if data == "[DONE]":
                            break
                        try:
                            chunk = json.loads(data)
                            if chunk.get("type") == "content_block_delta":
                                delta = chunk.get("delta", {})
                                # 跳过 thinking_delta（DeepSeek 思维链）
                                if delta.get("type") == "thinking_delta":
                                    continue
                                text = delta.get("text", "")
                                if text:
                                    accumulated += text
                                    if len(accumulated) > 20 or _has_sentence_end(accumulated):
                                        yield _sse("text", accumulated)
                                        accumulated = ""
                        except json.JSONDecodeError:
                            continue

                if accumulated:
                    yield _sse("text", accumulated)

                yield _sse("done")

    except Exception as e:
        yield _sse("text", f"DeepSeek API 调用失败: {str(e)[:200]}")
        yield _sse("done")


async def chat_once(user_message: str, system_prompt: str = "") -> str:
    """
    DeepSeek 非流式单轮对话，返回完整回答文本。
    admin-web「AI 对话测试」用这个。
    """
    full = ""
    async for sse in chat_stream(user_message, system_prompt):
        if sse.startswith("data: "):
            try:
                d = json.loads(sse[6:])
                if d.get("type") == "text":
                    full += d.get("content", "")
            except json.JSONDecodeError:
                pass
    return full or "(空回复)"


def _has_sentence_end(text: str) -> bool:
    """检查是否以句末标点结尾"""
    import re
    return bool(re.search(r"[。！？~]$", text))


def _sse(event_type: str, data: str = "") -> str:
    return f"data: {json.dumps({'type': event_type, 'content': data}, ensure_ascii=False)}\n\n"
