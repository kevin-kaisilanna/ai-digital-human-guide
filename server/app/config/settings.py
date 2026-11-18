"""应用配置 —— 从 .env 读取，提供默认值"""

import os
from dotenv import load_dotenv

load_dotenv()


class Settings:
    # Server
    SERVER_HOST: str = os.getenv("SERVER_HOST", "0.0.0.0")
    SERVER_PORT: int = int(os.getenv("SERVER_PORT", "8000"))
    DEBUG: bool = os.getenv("DEBUG", "true").lower() == "true"

    # Database
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./scenic.db")

    # ── visitor-app 聊天：百度千帆 ERNIE ──
    BAIDU_QIANFAN_API_KEY: str = os.getenv("BAIDU_QIANFAN_API_KEY", "")
    ERNIE_MODEL: str = os.getenv("ERNIE_MODEL", "ernie-4.5-turbo-128k")

    # ── admin-web AI 测试：DeepSeek（Anthropic 兼容代理）──
    DEEPSEEK_API_KEY: str = os.getenv("DEEPSEEK_API_KEY", "")
    DEEPSEEK_BASE_URL: str = os.getenv("DEEPSEEK_BASE_URL", "https://api.deepseek.com/anthropic")
    DEEPSEEK_MODEL: str = os.getenv("DEEPSEEK_MODEL", "DeepSeek-v4-pro[1m]")

    # Mock mode — 强制使用预制回答，不调用 LLM API
    MOCK_MODE: bool = os.getenv("MOCK_MODE", "false").lower() == "true"

    # TTS
    TTS_PROVIDER: str = os.getenv("TTS_PROVIDER", "edge-tts")

    # JWT
    JWT_SECRET: str = os.getenv("JWT_SECRET", "dev-secret")
    JWT_EXPIRE_MINUTES: int = int(os.getenv("JWT_EXPIRE_MINUTES", "1440"))


settings = Settings()
