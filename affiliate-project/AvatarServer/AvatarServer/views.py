import base64
import json
import os
import re
from io import BytesIO
from functools import wraps

from django.http import HttpResponse, JsonResponse, HttpResponseNotAllowed
from django.views.decorators.csrf import csrf_exempt

from AvatarServer import STT, face
from AvatarServer import TTS
from AvatarServer import LLM

# ── 音色配置文件路径 ──────────────────────────────────────────
# 共享配置文件：项目根目录 config/voice.json
# 从 Django 项目向上查找项目根目录
_VOICE_CONFIG_PATH = os.path.normpath(
    os.path.join(os.path.dirname(__file__), '..', '..', '..', 'config', 'voice.json')
)


def _get_voice_per() -> int:
    """从共享配置文件读取当前音色 per 值，默认 111"""
    try:
        with open(_VOICE_CONFIG_PATH, 'r', encoding='utf-8') as f:
            cfg = json.load(f)
            return int(cfg.get('per', 111))
    except Exception:
        return 111


def _get_voice_per_en() -> int:
    """从共享配置文件读取英文音色 per 值，默认 0"""
    try:
        with open(_VOICE_CONFIG_PATH, 'r', encoding='utf-8') as f:
            cfg = json.load(f)
            return int(cfg.get('per_en', 0))
    except Exception:
        return 0


def _extract_reply_text(llm_reply: str) -> str:
    """从 pipe 格式中提取回复文本（去掉 表情/动作/指令 标记）"""
    import re
    m = re.search(r'回复文本[：:]\s*(.+?)(?:\s*[|｜]\s*指令|$)', llm_reply)
    if m:
        return m.group(1).strip()
    # 回退：去掉所有标记段落，返回纯文本
    clean = re.sub(r'(表情|动作|回复文本|指令)[：:].*?([|｜]|$)', '', llm_reply)
    return clean.strip() or llm_reply

# ── 表情/动作 旧→新 强制映射 ──
EMOTION_MAP = {
    "微笑": "开心", "认真": "有趣", "好奇": "惊讶",
    "庄重": "有趣", "惊喜": "惊讶",
}
ACTION_MAP = {
    "双手合十": "鞠躬", "右手平伸指引": "右手放身前",
}

def normalize_reply(reply: str) -> str:
    """
    将 LLM 返回中的旧表情/动作名替换为新的 6+4 规范值。
    格式: 表情：xxx|动作：xxx|回复文本：xxx|指令：xxx
    """
    def fix_emotion(m):
        name = m.group(1)
        return f"表情：{EMOTION_MAP.get(name, name)}"

    def fix_action(m):
        name = m.group(1)
        return f"动作：{ACTION_MAP.get(name, name)}"

    reply = re.sub(r"表情[：:]\s*(.{1,4})", fix_emotion, reply)
    reply = re.sub(r"动作[：:]\s*(.{1,6})", fix_action, reply)
    return reply


# Django 6 移除了 require_http_methods，手写一个
def require_post(func):
    @wraps(func)
    def wrapper(request, *args, **kwargs):
        if request.method not in ("POST", "OPTIONS"):
            return HttpResponseNotAllowed(["POST"])
        return func(request, *args, **kwargs)
    return wrapper

VOICE_ACCESS_TOKEN = STT.get_voice_access_token()
LLM_ACCESS_TOKEN = LLM.get_LLM_access_token()
FACE_ACCESS_TOKEN = face.get_face_access_token()

@csrf_exempt
@require_post
def chat_with_llm(request):
    user_text = request.POST["userText"]
    lang = LLM.detect_language(user_text)

    # ── 硬编码拦截：特定问题直接返回，不走 LLM ──
    lower_text = user_text.lower()
    if any(w in lower_text for w in ["豆包", "doubao", "dou bao"]):
        return HttpResponse(
            "表情：难过|动作：右手放头上|"
            "回复文本：我不是豆包哦……我是小云，灵山胜境景区的AI数字人导游🌿 "
            "我只为这片山水和千年佛缘代言，不来自任何其他平台。"
            "如果您想了解灵山大佛、梵宫、九龙灌浴的故事，或者需要推荐游览路线，我随时为您解答~|指令：无"
        )

    llm_reply = LLM.chat_with_LLM(user_text, LLM_ACCESS_TOKEN, language=lang)
    llm_reply = normalize_reply(llm_reply)
    print("LLM回复:", llm_reply)
    return HttpResponse(llm_reply)

@csrf_exempt
@require_post
def chat_with_basic_llm(request):
    user_text = request.POST["userText"]
    llm_reply = LLM.chat_with_basic_llm(user_text, LLM_ACCESS_TOKEN)
    llm_reply = normalize_reply(llm_reply)
    print("LLM回复:", llm_reply)
    return HttpResponse(llm_reply)

@csrf_exempt
@require_post
def voice_recognize(request):
    audio_data = request.FILES.get("file")
    response_stt = STT.get_text_from_audio(audio_data, VOICE_ACCESS_TOKEN)
    user_text = response_stt.get("result")[0]
    print("用户输入的文本:", user_text)
    return HttpResponse(user_text)

@csrf_exempt
@require_post
def voice_synthesize(request):
    llm_reply = request.POST["llmReply"]

    # 提取纯文本 + 检测语言 + 选择对应音色
    reply_text = _extract_reply_text(llm_reply)
    lang = LLM.detect_language(reply_text)

    if lang == "en":
        voice_per = _get_voice_per_en()
        lan = "en"
    else:
        voice_per = _get_voice_per()
        lan = "zh"

    response_audio = TTS.get_audio_from_text(reply_text, VOICE_ACCESS_TOKEN, per=voice_per, lan=lan)
    response = HttpResponse(content_type="audio/wav")
    response.write(response_audio)
    return response

@csrf_exempt
@require_post
def face_analysis(request):
    image_data = request.FILES.get("img")
    analysis = face.face_analysis(image_data, FACE_ACCESS_TOKEN)
    processed_image = face.process_face_analysis(image_data, analysis)
    img_base64 = base64.b64encode(processed_image).decode()
    response = {"img": img_base64, "analysis": analysis}
    return JsonResponse(response)



