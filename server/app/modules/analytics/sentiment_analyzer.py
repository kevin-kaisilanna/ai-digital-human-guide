"""情感分析器 —— 基于关键词的文本情感分析"""

# 正面情感词库
POSITIVE_WORDS = {
    "谢谢", "感谢", "好", "很棒", "不错", "厉害", "优秀", "满意", "喜欢",
    "推荐", "赞", "太棒", "完美", "精彩", "方便", "清楚", "详细",
    "美丽", "漂亮", "壮观", "庄严", "宏伟", "震撼", "感动",
    "开心", "快乐", "高兴", "期待", "想去", "值得",
    "有帮助", "明白了", "知道了", "懂了", "原来如此",
}

# 负面情感词库
NEGATIVE_WORDS = {
    "不懂", "不知道", "没听懂", "不对", "错了", "不是",
    "无聊", "失望", "不满意", "不好", "差", "糟糕",
    "太贵", "太远", "太挤", "太累", "太热",
    "没意思", "浪费", "坑", "骗",
    "混乱", "不清晰", "没说清楚",
}

# 中性指示词
NEUTRAL_WORDS = {
    "在哪", "怎么走", "几点了", "多少钱", "多高", "多大",
    "什么", "如何", "哪个", "有吗", "开放", "介绍",
}


def analyze(text: str) -> str:
    """分析单条文本的情感倾向"""
    if not text:
        return "neutral"

    pos_score = sum(1 for w in POSITIVE_WORDS if w in text)
    neg_score = sum(1 for w in NEGATIVE_WORDS if w in text)

    if pos_score > neg_score:
        return "positive"
    elif neg_score > pos_score:
        return "negative"
    return "neutral"


def analyze_batch(texts: list[str]) -> dict:
    """批量分析，返回统计分布"""
    results = {"positive": 0, "neutral": 0, "negative": 0}
    for text in texts:
        sentiment = analyze(text)
        results[sentiment] += 1
    total = sum(results.values()) or 1
    return {
        "positive": round(results["positive"] / total * 100, 1),
        "neutral": round(results["neutral"] / total * 100, 1),
        "negative": round(results["negative"] / total * 100, 1),
        "count": total,
    }


def analyze_question_satisfaction(question: str, answer: str) -> str:
    """根据问答对估算满意度"""
    if not answer:
        return "low"
    answer_len = len(answer)
    has_spot_info = any(kw in answer for kw in [
        "米", "建于", "门票", "开放", "表演", "路线", "历史", "建筑"
    ])
    has_apology = any(kw in answer for kw in [
        "抱歉", "对不起", "无法", "暂时", "不清楚", "学习中"
    ])

    if has_apology and answer_len < 80:
        return "low"
    if answer_len > 150 and has_spot_info:
        return "high"
    if answer_len > 100:
        return "medium"
    return "medium"


def get_sentiment_trends(days: int = 7) -> list[dict]:
    """获取最近 N 天情感趋势"""
    from datetime import datetime, timedelta
    from app.db.database import SessionLocal
    from app.models.conversation import QueryLog

    db = SessionLocal()
    try:
        today_start = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)
        trends = []

        for i in range(days - 1, -1, -1):
            day_start = today_start - timedelta(days=i)
            day_end = day_start + timedelta(days=1)

            logs = db.query(QueryLog.answer).filter(
                QueryLog.created_at >= day_start,
                QueryLog.created_at < day_end
            ).limit(100).all()

            answers = [log.answer for log in logs if log.answer]
            stats = analyze_batch(answers)

            trends.append({
                "date": day_start.strftime("%m/%d"),
                "positive": stats["positive"],
                "neutral": stats["neutral"],
                "negative": stats["negative"],
            })

        return trends
    finally:
        db.close()
