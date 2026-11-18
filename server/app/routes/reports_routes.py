"""Reports API —— 基于真实数据的游客感受度报告"""

from fastapi import APIRouter, Query
from app.db.database import SessionLocal
from app.models.conversation import QueryLog
from app.modules.analytics.report_generator import generate_report_data
from app.modules.analytics.sentiment_analyzer import analyze

router = APIRouter(prefix="/api/reports", tags=["reports"])


@router.get("/summary")
async def get_summary():
    """游客感受度报告摘要 —— 全部来自真实数据"""
    return generate_report_data()


@router.get("/query-logs")
async def get_query_logs(page: int = Query(1, ge=1), pageSize: int = Query(50, ge=1, le=200)):
    """问答记录分页查询（不含 mock 数据）"""
    db = SessionLocal()
    try:
        offset = (page - 1) * pageSize
        total = db.query(QueryLog).count()
        logs = db.query(QueryLog).order_by(
            QueryLog.created_at.desc()
        ).offset(offset).limit(pageSize).all()

        return {
            "logs": [
                {
                    "id": log.id[:8],
                    "time": log.created_at.strftime("%Y-%m-%d %H:%M") if log.created_at else "",
                    "visitorId": (log.visitor_id or "")[:8],
                    "question": log.question or "",
                    "answer": (log.answer or "")[:200] + ("..." if len(log.answer or "") > 200 else ""),
                    "sentiment": log.sentiment or analyze(log.question or ""),
                    "satisfaction": log.satisfaction or "未评级",
                }
                for log in logs
            ],
            "total": total,
            "page": page,
            "pageSize": pageSize,
        }
    finally:
        db.close()


@router.get("/export-pdf")
async def export_pdf():
    """PDF 导出 — 返回完整报告数据，由前端渲染可打印 HTML"""
    report = generate_report_data()
    return {
        "report": report,
    }
