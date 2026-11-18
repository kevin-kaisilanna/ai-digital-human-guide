"""AI Chat API（admin-web「AI对话测试」专用 → DeepSeek）"""

from fastapi import APIRouter
from fastapi.responses import StreamingResponse
from app.modules.ai.deepseek_client import chat_once, chat_stream

router = APIRouter(prefix="/api/ai", tags=["ai"])

# 景区知识摘要（admin-web 测试时作为 system prompt）
AI_TEST_SYSTEM_PROMPT = """你是灵山胜境景区的AI数字人导游小云。用亲切口语化中文回复，每次100-200字。
你掌握的景区知识：
- 灵山大佛88米，2000块青铜板，重725吨
- 九龙灌浴27.5米，每天4-5场，上午10点首场
- 灵山梵宫72000㎡，东阳木雕/敦煌壁画/景德镇瓷器/景泰蓝
- 五印坛城藏式湖心岛建筑，仿布达拉宫风格
- 祥符禅寺1300年唐代建，千年银杏树
- 门票成人210元，半价105元；夏季7:00-17:30，冬季7:30-17:00
- 三条路线：人文6h/自然5h/亲子4h"""


@router.post("/chat")
async def chat(body: dict):
    """单轮问答 —— 非流式，返回完整回答"""
    prompt = body.get("prompt", "")
    if not prompt:
        return {"id": "", "answer": "请输入测试问题。"}

    answer = await chat_once(prompt, AI_TEST_SYSTEM_PROMPT)
    return {"id": str(hash(prompt))[:16], "answer": answer}


@router.post("/stream")
async def stream(body: dict):
    """流式问答 SSE"""
    prompt = body.get("prompt", "")
    if not prompt:
        prompt = "你好，介绍一下灵山胜境"

    async def gen():
        async for sse in chat_stream(prompt, AI_TEST_SYSTEM_PROMPT):
            yield sse

    return StreamingResponse(
        gen(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
        }
    )
