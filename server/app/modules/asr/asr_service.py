"""ASR 语音识别服务 —— 百度语音识别 API 封装

前置依赖（可选，仅后端 ASR 模式需要）：
    pip install requests

音频格式：百度 API 要求 PCM/WAV, 16kHz, 16bit, 单声道
若上传格式不符，将尝试用 ffmpeg 转换（需系统安装 ffmpeg）
"""

import os
import json
import base64
import tempfile
import subprocess
import urllib.request
import urllib.error
from pathlib import Path

# ══════════════════════════════════════════════════
# 百度 API 配置（从环境变量读取）
# ══════════════════════════════════════════════════
BAIDU_ASR_API_KEY = os.getenv("BAIDU_ASR_API_KEY", "")
BAIDU_ASR_SECRET_KEY = os.getenv("BAIDU_ASR_SECRET_KEY", "")
# 默认使用开发用凭据（仅供本地调试）
BAIDU_ASR_DEV_PID = int(os.getenv("BAIDU_ASR_DEV_PID", "80001"))
BAIDU_ASR_CUID = os.getenv("BAIDU_ASR_CUID", "scenic_asr")

# 访问令牌缓存
_token_cache: dict = {"token": "", "expires_at": 0}


def _get_access_token() -> str:
    """获取百度 API access_token（带缓存）"""
    import time

    if _token_cache["token"] and time.time() < _token_cache["expires_at"] - 300:
        return _token_cache["token"]

    if not BAIDU_ASR_API_KEY or not BAIDU_ASR_SECRET_KEY:
        raise RuntimeError("百度 ASR API 未配置：请设置 BAIDU_ASR_API_KEY 和 BAIDU_ASR_SECRET_KEY 环境变量")

    url = (
        "https://aip.baidubce.com/oauth/2.0/token"
        "?grant_type=client_credentials"
        f"&client_id={BAIDU_ASR_API_KEY}"
        f"&client_secret={BAIDU_ASR_SECRET_KEY}"
    )

    req = urllib.request.Request(url, method="POST")
    req.add_header("Content-Type", "application/json")
    req.add_header("Accept", "application/json")

    try:
        with urllib.request.urlopen(req, data=b"") as resp:
            data = json.loads(resp.read().decode())
            token = data.get("access_token", "")
            if not token:
                raise RuntimeError(f"获取百度 access_token 失败: {data}")
            _token_cache["token"] = token
            _token_cache["expires_at"] = time.time() + data.get("expires_in", 2592000)
            return token
    except urllib.error.URLError as e:
        raise RuntimeError(f"百度 OAuth 请求失败: {e}")


def _convert_to_wav_pcm(input_path: str) -> str:
    """
    将音频文件转换为 16kHz/16bit/单声道 WAV（百度 ASR 要求的格式）
    优先使用 ffmpeg，不可用时尝试直接读取
    """
    output_path = input_path + ".pcm.wav"

    # 尝试 ffmpeg 转换
    try:
        subprocess.run(
            [
                "ffmpeg", "-y", "-i", input_path,
                "-ar", "16000", "-ac", "1", "-sample_fmt", "s16",
                "-f", "wav", output_path,
            ],
            capture_output=True,
            timeout=30,
            check=True,
        )
        if os.path.exists(output_path) and os.path.getsize(output_path) > 0:
            return output_path
    except (subprocess.CalledProcessError, FileNotFoundError, subprocess.TimeoutExpired):
        pass

    # ffmpeg 不可用 → 假设输入已经是兼容格式，直接复制
    import shutil
    shutil.copy(input_path, output_path)
    return output_path


def transcribe_audio(audio_data: bytes, filename: str = "recording.webm") -> str:
    """
    将音频数据转写为文本

    Args:
        audio_data: 原始音频字节
        filename: 原始文件名（用于推断格式）

    Returns:
        转写后的文本，失败时返回空字符串
    """
    if not audio_data or len(audio_data) < 100:
        return ""

    suffix = Path(filename).suffix or ".webm"
    tmp_input = None
    tmp_wav = None

    try:
        # 1. 写入原始音频到临时文件
        with tempfile.NamedTemporaryFile(suffix=suffix, delete=False) as f:
            f.write(audio_data)
            tmp_input = f.name

        # 2. 转换为百度 ASR 要求的格式
        tmp_wav = _convert_to_wav_pcm(tmp_input)

        # 3. 读取 WAV 文件
        with open(tmp_wav, "rb") as f:
            wav_bytes = f.read()

        if len(wav_bytes) < 44:  # 比 WAV 头还小
            return ""

        # 4. 调用百度 ASR API（标准版 server_api）
        #    pro_api 需要单独开通专业版权限，否则返回 3302 错误
        token = _get_access_token()
        asr_url = (
            f"https://vop.baidu.com/server_api"
            f"?dev_pid={BAIDU_ASR_DEV_PID}"
            f"&cuid={BAIDU_ASR_CUID}"
            f"&token={token}"
        )

        # 标准版 API 建议将音频以 JSON + base64 方式发送
        speech_b64 = base64.b64encode(wav_bytes).decode("ascii")
        payload = json.dumps({
            "format": "wav",
            "rate": 16000,
            "channel": 1,
            "cuid": BAIDU_ASR_CUID,
            "token": token,
            "speech": speech_b64,
            "len": len(wav_bytes),
        }).encode("utf-8")

        req = urllib.request.Request(asr_url, method="POST", data=payload)
        req.add_header("Content-Type", "application/json")

        with urllib.request.urlopen(req, timeout=15) as resp:
            result = json.loads(resp.read().decode())

        # 5. 解析结果
        if result.get("err_no") == 0 and result.get("result"):
            return result["result"][0].strip()
        else:
            err_msg = result.get("err_msg", "未知错误")
            print(f"[ASR] 百度识别失败: err_no={result.get('err_no')}, msg={err_msg}")
            return ""

    except urllib.error.URLError as e:
        print(f"[ASR] 百度 API 请求失败: {e}")
        return ""
    except Exception as e:
        print(f"[ASR] 识别异常: {e}")
        return ""
    finally:
        # 清理临时文件
        for p in (tmp_input, tmp_wav):
            if p and os.path.exists(p):
                try:
                    os.unlink(p)
                except OSError:
                    pass


def transcribe_base64(audio_base64: str) -> str:
    """
    将 base64 编码的音频转写为文本
    适用于 Chat API 中内联的 audio_base64 字段
    """
    if not audio_base64:
        return ""
    try:
        # 处理可能的 data URL 前缀
        if "," in audio_base64 and audio_base64.startswith("data:"):
            audio_base64 = audio_base64.split(",", 1)[1]
        audio_bytes = base64.b64decode(audio_base64)
    except Exception:
        return ""
    return transcribe_audio(audio_bytes, filename="recording.webm")
