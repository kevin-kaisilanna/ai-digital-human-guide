# TTS 语音合成模块

负责将 AI 文本回复转为语音输出，并生成口型同步数据。

## 关键约束 (PRD)
- 数字人口型同步 → TTS 输出需生成 viseme 时间轴
- 语音自然流畅

## 文件
- `tts_service.py` — TTS 服务封装（对接第三方 TTS API，如 Azure/阿里云）
- `viseme_generator.py` — Viseme 口型时间轴生成
- `audio_cache.py` — 音频缓存（避免重复合成相同文本）
