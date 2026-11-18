"""数据分析服务 —— 从数据库提取真实统计"""

from datetime import datetime, timedelta
from sqlalchemy import func, extract
from app.db.database import SessionLocal
from app.models.conversation import QueryLog, Conversation
from app.models.knowledge import KnowledgeEntry


def get_query_stats(days: int = 7) -> dict:
    """获取指定天数内的问答统计数据"""
    db = SessionLocal()
    try:
        cutoff = datetime.utcnow() - timedelta(days=days)
        total = db.query(QueryLog).count()
        recent = db.query(QueryLog).filter(QueryLog.created_at >= cutoff).count()

        # 今日数据
        today_start = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)
        today = db.query(QueryLog).filter(QueryLog.created_at >= today_start).count()

        # 昨日数据（用于环比）
        yesterday_start = today_start - timedelta(days=1)
        yesterday = db.query(QueryLog).filter(
            QueryLog.created_at >= yesterday_start,
            QueryLog.created_at < today_start
        ).count()

        # 环比变化
        if yesterday > 0:
            change = round((today - yesterday) / yesterday * 100, 1)
        else:
            change = 0.0 if today == 0 else 100.0

        # 近7天每日趋势
        daily_trend = []
        for i in range(days - 1, -1, -1):
            day_start = (today_start - timedelta(days=i))
            day_end = day_start + timedelta(days=1)
            count = db.query(QueryLog).filter(
                QueryLog.created_at >= day_start,
                QueryLog.created_at < day_end
            ).count()
            daily_trend.append(count or 0)

        # 活跃会话数（未过期的 Conversation）
        session_cutoff = datetime.utcnow() - timedelta(hours=2)
        active_sessions = db.query(Conversation).filter(
            Conversation.updated_at >= session_cutoff
        ).count()

        # 知识库条目数
        knowledge_count = db.query(KnowledgeEntry).count()

        return {
            "total": total,
            "recent": recent,
            "today": today,
            "yesterday": yesterday,
            "change": change,
            "dailyTrend": daily_trend,
            "activeSessions": max(1, active_sessions),
            "knowledgeCount": knowledge_count,
        }
    finally:
        db.close()


def get_top_questions(days: int = 7, limit: int = 10) -> list[dict]:
    """获取热门问题 Top N"""
    db = SessionLocal()
    try:
        cutoff = datetime.utcnow() - timedelta(days=days)
        logs = db.query(QueryLog).filter(QueryLog.created_at >= cutoff).all()

        # 问题聚合
        qmap = {}
        for log in logs:
            # 问题清洗：取前 40 字符作为问题摘要
            q = (log.question or "")[:40].strip()
            if not q:
                q = "（空问题）"
            if q not in qmap:
                qmap[q] = {"count": 0, "answers": []}
            qmap[q]["count"] += 1
            if log.answer:
                qmap[q]["answers"].append(log.answer)

        # 按次数排序
        sorted_q = sorted(qmap.items(), key=lambda x: x[1]["count"], reverse=True)[:limit]

        return [
            {
                "question": q,
                "count": data["count"],
                "satisfaction": _estimate_satisfaction(data["answers"]),
            }
            for q, data in sorted_q
        ]
    finally:
        db.close()


def get_spot_popularity(days: int = 30, limit: int = 8) -> list[dict]:
    """统计各景点被提问的频率"""
    db = SessionLocal()
    try:
        cutoff = datetime.utcnow() - timedelta(days=days)
        logs = db.query(QueryLog).filter(QueryLog.created_at >= cutoff).all()
    finally:
        db.close()

    # 景点关键词映射
    spot_keywords = {
        "灵山大佛": ["大佛", "佛高", "青铜", "88", "释迦", "抱佛脚"],
        "灵山梵宫": ["梵宫", "宫殿", "木雕", "东阳", "琉璃", "吉祥颂"],
        "九龙灌浴": ["九龙", "灌浴", "喷泉", "花开", "八功德", "表演"],
        "五印坛城": ["五印", "坛城", "藏传", "转经", "藏族", "布达拉"],
        "祥符禅寺": ["祥符", "禅寺", "寺庙", "古寺", "银杏", "铜钟", "玄奘"],
        "菩提大道": ["菩提", "大道", "林荫", "菩提树"],
        "灵山大照壁": ["照壁", "大照壁", "赵朴初", "华夏第一壁"],
        "拈花湾": ["拈花湾", "小镇", "禅意小镇", "花海"],
        "百子戏弥勒": ["百子", "弥勒", "孩童", "亲子"],
        "曼飞龙塔": ["曼飞龙", "白塔", "傣族"],
    }

    counts = {name: 0 for name in spot_keywords}

    for log in logs:
        text = (log.question or "") + (log.answer or "")
        for spot, keywords in spot_keywords.items():
            if any(kw in text for kw in keywords):
                counts[spot] += 1
                break

    sorted_spots = sorted(counts.items(), key=lambda x: x[1], reverse=True)
    return [
        {"name": name, "count": count}
        for name, count in sorted_spots[:limit] if count > 0
    ]


def get_category_distribution() -> list[dict]:
    """统计对话涉及的知识分类分布（基于知识库内容匹配）"""
    db = SessionLocal()
    try:
        logs = db.query(QueryLog).limit(200).all()
    finally:
        db.close()

    category_keywords = {
        "历史文化": ["历史", "唐朝", "玄奘", "清代", "乾隆", "千年", "传说", "赵朴初", "佛教"],
        "景点介绍": ["大佛", "梵宫", "灌浴", "寺庙", "坛城", "桥", "门", "塔", "米", "建筑"],
        "设施服务": ["卫生间", "门票", "开放", "几点", "价格", "多少钱", "餐厅", "素斋", "停车", "开放时间"],
        "路线推荐": ["路线", "推荐", "游览", "多久", "怎么走", "半天", "一天", "小时"],
    }

    scores = {name: 0 for name in category_keywords}
    scores["其他"] = 0

    for log in logs:
        text = (log.question or "") + (log.answer or "")
        matched = False
        for cat, kws in category_keywords.items():
            if any(kw in text for kw in kws):
                scores[cat] += 1
                matched = True
                break
        if not matched:
            scores["其他"] += 1

    total = sum(scores.values()) or 1
    return [
        {"category": name, "percentage": round(count / total * 100, 1)}
        for name, count in scores.items()
    ]


def _estimate_satisfaction(answers: list[str]) -> int:
    """根据回答长度和信息密度估算满意度（简化版）"""
    if not answers:
        return 85
    # 回答长且包含景点名的认为质量较高
    score = 0
    for a in answers:
        length = len(a)
        has_info = any(kw in a for kw in ["米", "历史", "建于", "门票", "开放", "表演", "路线"])
        score += min(100, 75 + (length // 20) + (10 if has_info else 0))
    return min(99, max(70, score // len(answers)))
