"""Chat API 的 Pydantic 校验模型"""

from pydantic import BaseModel
from typing import Optional, Literal


class SendMessageRequest(BaseModel):
    session_id: Optional[str] = "default"
    type: Literal["text", "voice"] = "text"
    content: Optional[str] = None       # 文字内容
    audio_base64: Optional[str] = None  # 语音 base64


class ChatMessageResponse(BaseModel):
    id: str
    role: Literal["user", "ai"]
    type: Literal["text", "voice"]
    content: str
    audio_url: Optional[str] = None
    duration: Optional[float] = None
    emotion: Optional[str] = None
    created_at: str

    class Config:
        from_attributes = True


class ChatHistoryRequest(BaseModel):
    session_id: str = "default"
    page: int = 1
    page_size: int = 20


class SSEChunk(BaseModel):
    type: Literal["text", "audio", "viseme", "emotion", "action", "done"]
    content: Optional[str] = None
    audio_base64: Optional[str] = None
    visemes: Optional[list[dict]] = None
    emotion: Optional[str] = None   # 表情: 生气/困惑/难过/开心/有趣/惊讶
    action: Optional[str] = None    # 动作: 鞠躬/右手放胸前/右手放身前/右手放头上/无
