"""Digital Human 配置 API 路由"""

import json
from pathlib import Path
from fastapi import APIRouter

router = APIRouter(prefix="/api/digital-human", tags=["digital-human"])

# 音色配置文件路径（与 config_routes.py 共享同一个 voice.json）
_VOICE_CONFIG_PATH = Path(__file__).resolve().parent.parent.parent.parent / "config" / "voice.json"


def _read_voice_per() -> int:
    """从共享配置文件读取当前音色 per 值，默认 4119"""
    try:
        if _VOICE_CONFIG_PATH.exists():
            with open(_VOICE_CONFIG_PATH, "r", encoding="utf-8") as f:
                cfg = json.load(f)
                return int(cfg.get("per", 4119))
    except Exception:
        pass
    return 4119


# 内存配置存储
_dh_config = {
    "appearance": {"gender": "女", "hair": "长发", "face": "鹅蛋脸"},
    "clothing": {"style": "汉服", "color": "#c41e3a"},
    "voice": "甜美女声",
    "expression": "开心",
    "action": "无",
    "background": {"bgUrl": "", "blur": 0},
}


@router.get("/config")
async def get_config():
    # 注入当前音色 per 值，供应用端读取
    cfg = dict(_dh_config)
    cfg["voicePer"] = _read_voice_per()
    return cfg


@router.post("/config")
async def save_config(body: dict):
    for key in ["appearance", "clothing", "voice", "emoji", "background"]:
        if key in body:
            _dh_config[key] = body[key]
    return {"ok": True}


@router.post("/synthesize")
async def synthesize(body: dict):
    text = body.get("text", "欢迎来到灵山胜境")
    voice_per = _read_voice_per()
    # TTS 占位：返回 mock URL，同时透传当前音色 per 值供调用方使用
    return {
        "audioUrl": "/mock-audio/tts-sample.mp3",
        "text": text,
        "voicePer": voice_per,
    }


@router.post("/visemes")
async def visemes(body: dict):
    text = body.get("text", "")
    # 简化 viseme 生成：每 100ms 交替开合
    chars = len(text)
    duration = max(1, chars * 0.08)  # 估算朗读时长
    frames = []
    for i in range(0, int(duration * 10)):
        frames.append({
            "time": round(i * 0.1, 1),
            "viseme": "aa" if i % 2 == 0 else "sil",
        })
    return {"visemeTimeline": frames}


@router.post("/session")
async def create_session(body: dict = {}):
    import uuid
    return {"sessionId": str(uuid.uuid4())}
