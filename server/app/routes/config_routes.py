"""系统配置 API 路由 — 音色等全局配置

百度语音 TTS 音色列表，per 参数值与官方 API 文档一致：
  https://cloud.baidu.com/doc/SPEECH/s/Rluv3uq3d
"""

import json
from datetime import datetime
from pathlib import Path
from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter(prefix="/api/config", tags=["config"])

# 音色配置文件路径（项目根目录 config/voice.json）
_VOICE_CONFIG_PATH = Path(__file__).resolve().parent.parent.parent.parent / "config" / "voice.json"


# ── 全部可用音色（per 值与百度官方 API 文档一致）─────────────
# 每项：per(百度语音参数), name(完整名), desc(用户可见描述), cat(音库级别), scene(适用场景)
VOICE_OPTIONS = [
    # ── 臻品音库 ──
    {"per": 5147, "name": "度常盈-电台女主播", "desc": "电台女主播",   "cat": "臻品音库", "scene": "资讯"},
    {"per": 5976, "name": "度小皮-萌娃童声",   "desc": "萌娃童声",     "cat": "臻品音库", "scene": "资讯"},
    {"per": 4259, "name": "度小新-播音女声",   "desc": "播音女声",     "cat": "臻品音库", "scene": "资讯"},
    {"per": 4119, "name": "度小鹿-甜美女声",   "desc": "甜美女声",     "cat": "臻品音库", "scene": "对话助手"},
    {"per": 4105, "name": "度灵儿-清激女声",   "desc": "清激女声",     "cat": "臻品音库", "scene": "对话助手"},
    {"per": 4117, "name": "度小乔-活泼女声",   "desc": "活泼女声",     "cat": "臻品音库", "scene": "对话助手"},
    {"per": 4288, "name": "度晴岚-甜美女声",   "desc": "甜美女声",     "cat": "臻品音库", "scene": "对话助手"},
    {"per": 4100, "name": "度小雯-活力女主播", "desc": "活力女主播",   "cat": "臻品音库", "scene": "资讯"},
    {"per": 4103, "name": "度米朵-可爱女声",   "desc": "可爱女声",     "cat": "臻品音库", "scene": "对话助手"},
    {"per": 4144, "name": "度姗姗-娱乐女声",   "desc": "娱乐女声",     "cat": "臻品音库", "scene": "配音"},
    {"per": 4278, "name": "度小贝-知识女主播", "desc": "知识女主播",   "cat": "臻品音库", "scene": "资讯"},
    {"per": 4140, "name": "度小新-专业女主播", "desc": "专业女主播",   "cat": "臻品音库", "scene": "资讯"},
    {"per": 4254, "name": "度小清-广告女声",   "desc": "广告女声",     "cat": "臻品音库", "scene": "配音"},
    {"per": 4141, "name": "度婉婉-甜美女声",   "desc": "甜美女声",     "cat": "臻品音库", "scene": "配音"},
    {"per": 4226, "name": "南方-电台女主播",   "desc": "电台女主播",   "cat": "臻品音库", "scene": "资讯"},
    {"per": 6221, "name": "度云萱-旁白女声",   "desc": "旁白女声",     "cat": "臻品音库", "scene": "小说"},
    {"per": 6562, "name": "度雨楠-元气少女",   "desc": "元气少女",     "cat": "臻品音库", "scene": "小说"},
    {"per": 6543, "name": "度雨萌-邻家女孩",   "desc": "邻家女孩",     "cat": "臻品音库", "scene": "小说"},
    {"per": 6644, "name": "度书宁-亲和女声",   "desc": "亲和女声",     "cat": "臻品音库", "scene": "小说"},
    {"per": 4148, "name": "度小夏-甜美女声",   "desc": "甜美女声",     "cat": "臻品音库", "scene": "小说"},
    {"per": 4277, "name": "西贝-脱口秀女声",   "desc": "脱口秀女声",   "cat": "臻品音库", "scene": "配音"},
    {"per": 5153, "name": "度常悦-民生女主播", "desc": "民生女主播",   "cat": "臻品音库", "scene": "资讯"},
    {"per": 6561, "name": "度小乐-可爱童声",   "desc": "可爱童声",     "cat": "臻品音库", "scene": "对话助手"},

    # ── 精品音库 ──
    {"per": 5118, "name": "度小鹿-甜美女声",   "desc": "甜美女声",     "cat": "精品音库", "scene": "对话助手"},
    {"per": 103,  "name": "度米朵-可爱童声",   "desc": "可爱童声",     "cat": "精品音库", "scene": "对话助手"},
    {"per": 110,  "name": "度小童-童声主播",   "desc": "童声主播",     "cat": "精品音库", "scene": "资讯"},
    {"per": 111,  "name": "度小萌-软萌妹子",   "desc": "软萌妹子",     "cat": "精品音库", "scene": "小说"},
    {"per": 5,    "name": "度小娇-成熟女主播", "desc": "成熟女主播",   "cat": "精品音库", "scene": "资讯"},

    # ── 基础音库 ──
    {"per": 0,    "name": "度小美-标准女主播", "desc": "标准女主播",   "cat": "基础音库", "scene": "资讯"},
    {"per": 4,    "name": "度丫丫-童声",       "desc": "童声",         "cat": "基础音库", "scene": "小说"},
]


def _read_voice_config() -> dict:
    """从共享文件读取当前音色配置"""
    try:
        if _VOICE_CONFIG_PATH.exists():
            with open(_VOICE_CONFIG_PATH, "r", encoding="utf-8") as f:
                return json.load(f)
    except Exception:
        pass
    return {
        "per": 4119, "name": "度小鹿-甜美女声", "description": "甜美女声", "category": "臻品音库",
        "per_en": 0, "name_en": "度小美-标准女主播", "description_en": "Standard English Female", "category_en": "基础音库",
    }


def _write_voice_config(cfg: dict) -> None:
    """写入共享音色配置文件"""
    cfg["updatedAt"] = datetime.now().isoformat()
    _VOICE_CONFIG_PATH.parent.mkdir(parents=True, exist_ok=True)
    with open(_VOICE_CONFIG_PATH, "w", encoding="utf-8") as f:
        json.dump(cfg, f, ensure_ascii=False, indent=2)


# ── API 端点 ──────────────────────────────────────────────────

class VoiceUpdateRequest(BaseModel):
    per: int
    name: str = ""
    description: str = ""
    category: str = ""
    per_en: int = 0
    name_en: str = ""
    description_en: str = ""
    category_en: str = ""


@router.get("/voice")
async def get_voice_config():
    """获取当前音色配置 + 全部可选音色列表"""
    cfg = _read_voice_config()
    return {"data": cfg, "options": VOICE_OPTIONS}


@router.put("/voice")
async def update_voice_config(body: VoiceUpdateRequest):
    """更新音色配置（管理端调用，支持中英文音色）"""
    # 从 VOICE_OPTIONS 中找到匹配项以补全信息
    matched = None
    for v in VOICE_OPTIONS:
        if v["per"] == body.per:
            matched = v
            break

    cfg = {
        "per": body.per,
        "name": matched["name"] if matched else body.name,
        "description": matched["desc"] if matched else body.description,
        "category": matched["cat"] if matched else body.category,
        "per_en": body.per_en,
        "name_en": body.name_en,
        "description_en": body.description_en,
        "category_en": body.category_en,
    }
    _write_voice_config(cfg)
    return {"ok": True, "data": cfg}
