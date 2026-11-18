"""LLM 客户端 —— 百度千帆 ERNIE（visitor-app 聊天专用）

非流式调用 → 按句子拆分 → 模拟 SSE 流式输出。
每句之间插入短延迟，前端体验接近真实流式。
"""

import asyncio
import json
import os
import re
import emoji
import httpx
from app.config.settings import settings
from app.modules.ai.prompt_templates import build_system_prompt, mock_reply, detect_language

# 表情+动作标记正则
EMOTION_ACTION_RE = re.compile(r"表情[：:]\s*(.{1,4})\s*[|｜]\s*动作[：:]\s*(.{1,6})")

ERNIE_URL = "https://qianfan.baidubce.com/v2/chat/completions"


def _strip_emotion_tag(text: str) -> str:
    return EMOTION_ACTION_RE.sub("", text).strip()


def _extract_emotion_action(text: str) -> tuple[str | None, str | None]:
    match = EMOTION_ACTION_RE.search(text)
    if match:
        return match.group(1).strip(), match.group(2).strip()
    return None, None


def _remove_enclosed_text(text: str, enclosure: str = "::") -> str:
    """移除配对标点包裹的内容（千帆有时会在思维链外加 ::...:: 标记）"""
    while enclosure in text:
        start = text.find(enclosure)
        end = text.find(enclosure, start + len(enclosure))
        if end != -1:
            text = text[:start] + text[end + len(enclosure):]
        else:
            break
    return text


async def chat_stream(
    user_message: str,
    context: list[dict],
    history: list[dict],
    language: str | None = None,
) -> str:
    """
    调用百度千帆 ERNIE，返回 SSE 事件字符串的异步生成器。
    """
    if language is None:
        language = detect_language(user_message)

    system_prompt = build_system_prompt(context, history, language)

    # ── Mock 模式 ──
    if not settings.BAIDU_QIANFAN_API_KEY or settings.MOCK_MODE:
        print(f"[ERNIE MOCK] {user_message[:50]}")
        full_reply = mock_reply(user_message, language)
        for evt in _simulate_stream(full_reply):
            yield evt
        return

    # ── 调千帆 API ──
    try:
        async with httpx.AsyncClient(timeout=60.0) as client:
            resp = await client.post(
                ERNIE_URL,
                headers={
                    "Content-Type": "application/json",
                    "Authorization": f"Bearer {settings.BAIDU_QIANFAN_API_KEY}",
                },
                json={
                    "model": settings.ERNIE_MODEL,
                    "messages": [
                        {"role": "user", "content": user_message}
                    ],
                    "system": system_prompt,
                    "stream": False,
                },
            )
            data = resp.json()

            # 提取回复文本
            reply = ""
            try:
                reply = data["choices"][0]["message"]["content"]
            except (KeyError, IndexError, TypeError):
                reply = data.get("result", "")

            # 清洗
            reply = emoji.demojize(reply)
            reply = _remove_enclosed_text(reply)

            if not reply.strip():
                print(f"[ERNIE] 空回复，降级 mock: {user_message[:50]}")
                reply = mock_reply(user_message, language)

            print(f"[ERNIE] {user_message[:30]} → {reply[:60]}...")
            for evt in _simulate_stream(reply):
                yield evt

    except Exception as e:
        print(f"[ERNIE] API 异常: {e}")
        fallback = mock_reply(user_message, language)
        for evt in _simulate_stream(fallback):
            yield evt


def _simulate_stream(full_reply: str):
    """将完整回复按句拆分，模拟 SSE 流式输出"""
    # 提取表情/动作标记
    emotion, action = _extract_emotion_action(full_reply)
    emotion = emotion or "开心"
    action = action or "无"

    # 剥离标记后的干净文本
    clean = _strip_emotion_tag(full_reply)

    # 按句拆分
    sentences = re.split(r"(?<=[。！？~])", clean)
    if not sentences:
        sentences = [clean]

    for i, sentence in enumerate(sentences):
        s = sentence.strip()
        if not s:
            continue
        yield _sse_event("text", s)
        # 中间位置发表情/动作
        if i == max(0, len(sentences) - 1) // 2:
            yield _sse_event("emotion", emotion)
            if action != "无":
                yield _sse_event("action", action)

    # 确保表情/动作至少各发一次
    yield _sse_event("emotion", emotion)
    if action != "无":
        yield _sse_event("action", action)
    yield _sse_event("done")


def _sse_event(event_type: str, data: str = "") -> str:
    payload = json.dumps({"type": event_type, "content": data}, ensure_ascii=False)
    return f"data: {payload}\n\n"
