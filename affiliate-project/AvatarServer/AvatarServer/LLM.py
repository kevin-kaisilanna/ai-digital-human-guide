import os
import re
from pathlib import Path

# 加载 AvatarServer 目录下的 .env 文件（Django 不自动读取 .env）
try:
    from dotenv import load_dotenv
    _env_path = Path(__file__).resolve().parent.parent / ".env"
    load_dotenv(_env_path)
except ImportError:
    pass

import requests
import json
import emoji


def detect_language(text: str) -> str:
    """检测文本语言：含 CJK 字符返回 'zh'，否则 'en'"""
    if not text:
        return "zh"
    if re.search(r'[一-鿿　-〿＀-￯]', text):
        return "zh"
    return "en"


def remove_enclosed_text(text, enclosure="::"):
    while enclosure in text:
        start_index = text.find(enclosure)
        end_index = text.find(enclosure, start_index + len(enclosure))
        if end_index != -1:
            text = text[:start_index] + text[end_index + len(enclosure):]
        else:
            break
    return text


def get_LLM_access_token():
    """千帆 v3 API Key - Bearer 鉴权"""
    return os.getenv("BAIDU_QIANFAN_API_KEY", "")


# 百度千帆 API 地址 (v2)
ERNIE_URL = "https://qianfan.baidubce.com/v2/chat/completions"
ERNIE_MODEL = os.getenv("ERNIE_MODEL", "ernie-4.5-turbo-128k")
ERNIE_STREAM = False


def _call_ernie(messages_payload, access_token=None):
    """调用千帆 ERNIE API 的通用函数"""
    api_key = access_token or os.getenv("BAIDU_QIANFAN_API_KEY", "")
    if not api_key:
        return "错误：未配置 BAIDU_QIANFAN_API_KEY 环境变量"

    payload = json.dumps(messages_payload, ensure_ascii=False)
    headers = {
        'Content-Type': 'application/json',
        'Authorization': f'Bearer {api_key}',
    }

    response = requests.request("POST", ERNIE_URL, headers=headers, data=payload.encode("utf-8"))
    response.encoding = "utf-8"
    data = response.json()
    print(data)

    # v2 API: choices[0].message.content
    reply = ""
    try:
        reply = data["choices"][0]["message"]["content"]
    except (KeyError, IndexError, TypeError):
        reply = data.get("result", "")

    reply = emoji.demojize(reply)
    reply = remove_enclosed_text(reply, enclosure=":")
    return reply


def chat_with_basic_llm(messages, access_token=None):
    """简单 LLM 对话（无 system prompt）"""
    return _call_ernie({
        "model": ERNIE_MODEL,
        "messages": [
            {
                "role": "user",
                "content": messages
            }
        ],
        "stream": ERNIE_STREAM,
    }, access_token)


# ── 景区知识（中英双语）────────────────────────────────
_KNOWLEDGE_ZH = (
    "你掌握的景区知识：灵山大佛88米；九龙灌浴27.5米4-5场/天；梵宫72000㎡；五印坛城藏式湖心岛；"
    "祥符禅寺1300年唐代建；大照壁39.8m×7m赵朴初题；五明桥五座汉白玉代表五智慧；"
    "佛足坛青铜足印32吉祥图案；五智门16.8m六度波罗蜜；菩提大道250m印度菩提树；"
    "门票210/105，夏季7:00-17:30冬季7:30-17:00；三条路线：人文6h自然5h亲子4h。"
)

_KNOWLEDGE_EN = (
    "Key facts about Lingshan Scenic Area: Grand Buddha 88m tall, 2000 bronze plates, 725 tons. "
    "Nine Dragons Bathing 27.5m, 4-5 shows/day. Brahma Palace 72,000 sqm. "
    "Five Seals Mandala on lake island, Tibetan Buddhist style. "
    "Xiangfu Temple founded Tang Dynasty 1300 years ago. Grand Screen Wall 39.8m x 7m. "
    "Five Wisdom Bridges: 5 white-marble bridges representing Buddhist wisdom. "
    "Buddha Foot Altar: bronze footprints with 32 auspicious symbols. "
    "Five Wisdom Gate 16.8m, Bodhi Avenue 250m of Indian bodhi trees. "
    "Tickets: 210 yuan adult / 105 half-price. Summer 7:00-17:30, Winter 7:30-17:00. "
    "Three routes: Cultural 6h, Nature 5h, Family 4h."
)

def chat_with_LLM(messages, access_token=None, language=None):
    """带导游人设的 LLM 对话。language=None 时自动检测，'zh'=中文，'en'=英文"""
    if language is None:
        language = detect_language(messages)

    if language == "en":
        system_content = (
            "You are Xiao Yun, the AI digital human tour guide at Lingshan Scenic Area (灵山胜境) in Wuxi, China. "
            "Reply in friendly, conversational English, 100-200 words per response. "
            "You MUST use this exact reply format: 表情：xxx|动作：xxx|回复文本：xxx|指令：xxx "
            "For 表情, choose from these Chinese labels: 生气/困惑/难过/开心/有趣/惊讶 (default 开心). "
            "For 动作, choose from: 鞠躬/右手放胸前/右手放身前/右手放头上/无 (default 无). "
            "For 指令, choose from: 推荐游览路线/打开景点导览/带我去灵山大佛/查看我的游览记录/无 (default 无). "
            "Do NOT translate the Chinese labels in the format — keep 表情, 动作, 回复文本, 指令 exactly as-is. "
            "Only the reply text after 回复文本： should be in English. "
            + _KNOWLEDGE_EN
        )
        assistant_example = (
            "表情：开心|动作：鞠躬|回复文本：Hello! I'm Xiao Yun, your AI tour guide at Lingshan. "
            "Which attraction would you like to learn about?|指令：无"
        )
    else:
        system_content = (
            "你是灵山胜境景区的AI数字人导游小云。用亲切口语化中文回复，每次100-200字。"
            "回复时必须用如下格式：表情：xxx|动作：xxx|回复文本：xxx|指令：xxx。"
            "表情可选：生气/困惑/难过/开心/有趣/惊讶。动作可选：鞠躬/右手放胸前/右手放身前/右手放头上/无。"
            "指令可选：推荐游览路线/打开景点导览/带我去灵山大佛/查看我的游览记录/无。"
            "不做表情变化时填开心，不做动作时填无。"
            + _KNOWLEDGE_ZH
        )
        assistant_example = (
            "表情：开心|动作：鞠躬|回复文本：你好! 我是灵山胜境的AI导游小云，"
            "想了解哪个景点或者需要规划路线吗？|指令：无"
        )

    return _call_ernie({
        "model": ERNIE_MODEL,
        "messages": [
            {"role": "system", "content": system_content},
            {"role": "assistant", "content": assistant_example},
            {"role": "user", "content": messages}
        ],
        "stream": ERNIE_STREAM,
    }, access_token)
