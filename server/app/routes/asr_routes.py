"""ASR 语音识别 API 路由"""

from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from app.modules.asr.asr_service import transcribe_audio, transcribe_base64

router = APIRouter(prefix="/api/asr", tags=["asr"])


@router.post("/transcribe")
async def transcribe(
    audio: UploadFile = File(...),
    duration: int = Form(default=0),
):
    """
    语音转写接口

    - 接受 WebM / WAV / MP3 等常见格式
    - 自动转换为百度 ASR 所需格式 (16kHz / 16bit / 单声道 WAV)
    - 返回 JSON: { text: string, duration?: number }

    HTTP 400 → 音频文件为空
    HTTP 200 → 识别成功（text 可能为空——表示未识别到语音）
    """
    if not audio or not audio.filename:
        raise HTTPException(400, "音频文件不能为空")

    # 检查文件大小（百度 API 上限 10MB，这里设 5MB 安全值）
    raw = await audio.read()
    if len(raw) < 100:
        raise HTTPException(400, "音频太短或为空")
    if len(raw) > 5 * 1024 * 1024:
        raise HTTPException(400, "音频文件过大（上限 5MB）")

    text = transcribe_audio(raw, filename=audio.filename or "recording.webm")

    return {
        "text": text,
        "duration": duration,
    }


@router.post("/transcribe-base64")
async def transcribe_b64(request: dict):
    """
    接受 base64 编码音频的转写接口

    POST JSON: { audio_base64: string, duration?: number }
    返回 JSON: { text: string, duration?: number }
    """
    audio_base64 = request.get("audio_base64", "") if request else ""
    if not audio_base64:
        raise HTTPException(400, "audio_base64 不能为空")

    text = transcribe_base64(audio_base64)
    return {
        "text": text,
        "duration": request.get("duration", 0) if request else 0,
    }
