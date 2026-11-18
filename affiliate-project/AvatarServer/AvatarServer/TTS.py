from urllib.parse import urlencode
import requests


def get_audio_from_text(text, access_token, per=111, lan="zh"):
    """调用百度 TTS 将文本转为 WAV 音频。lan 参数: zh=中文, en=英文"""
    url = "https://tsn.baidu.com/text2audio"

    parameter = {
        "tex": text,
        "lan": lan,
        "ctp": "1",
        "cuid": "toch",
        "aue": "6",
        "per": per,
        "tok": access_token
    }

    payload = urlencode(parameter)

    response = requests.request("POST", url, data=payload)
    return response.content
