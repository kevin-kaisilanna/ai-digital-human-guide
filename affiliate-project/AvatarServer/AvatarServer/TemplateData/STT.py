import os
import requests
import json
from pydub import AudioSegment

def get_voice_access_token():
    """
    使用 API Key，Secret Key 获取access_token
    请在 .env 或系统环境变量中配置 BAIDU_ASR_API_KEY / BAIDU_ASR_SECRET_KEY，切勿提交真实密钥
    """

    api_key = os.environ.get("BAIDU_ASR_API_KEY", "")
    secret_key = os.environ.get("BAIDU_ASR_SECRET_KEY", "")
    url = ("https://aip.baidubce.com/oauth/2.0/token?grant_type=client_credentials"
           f"&client_id={api_key}&client_secret={secret_key}")

    payload = json.dumps("")
    headers = {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    }

    response = requests.request("POST", url, headers=headers, data=payload)
    return response.json().get("access_token")


def get_sample_rate(audio_file_path):
    audio = AudioSegment.from_file(audio_file_path)
    sample_rate = audio.frame_rate
    return sample_rate


def translate_sample_rate(audio_segment, target_sample_rate):
    converted_audio = audio_segment.set_frame_rate(target_sample_rate)
    converted_audio.export("out.wav", format="wav")


def get_text_from_audio(audio, access_token):
    audio_segment = AudioSegment.from_file(audio, format="wav")
    audio_segment = audio_segment.set_frame_rate(16000)
    audio_segment.export("out.wav", format="wav")

    url = "https://vop.baidu.com/pro_api?dev_pid=80001&cuid=tochusc&token=" + access_token
    headers = {
        'Content-Type': 'audio/wav;rate=16000'
    }

    response = requests.request("POST", url, headers=headers, data=audio_segment.export(format="wav"))
    return response.json()

def main():
    """
    替换下列示例中的创建服务时填写的API名称
    """
    url = "https://vop.baidu.com/pro_api?dev_pid=80001&cuid=tochusc&token=" + get_voice_access_token()

    headers = {
        'Content-Type': 'audio/wav;rate=16000'
    }
    # 781496

    audio = AudioSegment.from_file("yan.wav", format="wav")
    target_sample_rate = 16000
    converted_audio = audio.set_frame_rate(target_sample_rate)

    response = requests.request("POST", url, headers=headers, data=converted_audio.export(format="wav"))

    result = response.json()

#
# if __name__ == '__main__':
#     main()

print(get_voice_access_token())