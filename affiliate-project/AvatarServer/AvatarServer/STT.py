import requests
import json
import wave
import struct
import io


def get_voice_access_token():
    """获取百度语音 API access_token"""
    url = ("https://aip.baidubce.com/oauth/2.0/token"
           "?grant_type=client_credentials"
           "&client_id=3gNeeJCeGqnmngyVFe5zNDvq"
           "&client_secret=Nc0CyBYi8qapVwNTZiaGqPvyVEeo6yDl")
    headers = {'Content-Type': 'application/json', 'Accept': 'application/json'}
    response = requests.post(url, headers=headers, data=json.dumps(""))
    return response.json().get("access_token")


def resample_wav(raw_bytes, target_rate=16000):
    """用标准库 wave 将 WAV 重采样到 target_rate（简单线性插值）"""
    with wave.open(io.BytesIO(raw_bytes), 'rb') as wf:
        nchannels = wf.getnchannels()
        sampwidth = wf.getsampwidth()
        orig_rate = wf.getframerate()
        frames = wf.readframes(wf.getnframes())

    if orig_rate == target_rate:
        return raw_bytes

    # 解码采样点
    fmt = {1: 'b', 2: 'h', 4: 'i'}[sampwidth]
    samples = list(struct.iter_unpack(f'<{fmt}', frames))
    ratio = orig_rate / target_rate

    new_samples = []
    for i in range(0, len(samples), nchannels):
        if int(i / nchannels * ratio) < len(new_samples) // nchannels:
            continue
        new_samples.extend(samples[i:i + nchannels])

    # 回编码
    buf = io.BytesIO()
    with wave.open(buf, 'wb') as wf:
        wf.setnchannels(nchannels)
        wf.setsampwidth(sampwidth)
        wf.setframerate(target_rate)
        for s in new_samples:
            wf.writeframes(struct.pack(f'<{fmt}', *s))
    return buf.getvalue()


def get_text_from_audio(audio_file, access_token):
    """直接读 WAV → 重采样 16kHz → 调百度语音识别"""
    raw = audio_file.read()

    try:
        wav_16k = resample_wav(raw, 16000)
    except Exception as e:
        print(f"[STT] 重采样失败，尝试直接发送原始音频: {e}")
        wav_16k = raw

    url = "https://vop.baidu.com/pro_api?dev_pid=80001&cuid=tochusc&token=" + access_token
    headers = {'Content-Type': 'audio/wav;rate=16000'}

    response = requests.post(url, headers=headers, data=wav_16k)
    return response.json()


def main():
    token = get_voice_access_token()
    print("Token:", token[:20] + "...")

    with open("d:/action/server/test_voice.wav", "rb") as f:
        result = get_text_from_audio(f, token)
    print("Result:", result)


if __name__ == '__main__':
    main()
