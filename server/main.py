"""FastAPI 应用入口"""

from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.db.database import init_db
from app.config.settings import settings
from app.routes import chat_routes, route_routes, user_routes
from app.routes import auth_routes, analytics_routes, knowledge_routes, digital_human_routes, reports_routes, ai_routes
from app.routes import asr_routes, unity_routes, config_routes, admin_routes


@asynccontextmanager
async def lifespan(app: FastAPI):
    """启动/关闭生命周期"""
    init_db()
    yield


app = FastAPI(
    title="景区导览 AI 数字人 API",
    description="灵山胜境智能导游后端服务",
    version="0.1.0",
    lifespan=lifespan,
)

# CORS —— 开发阶段全开
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 注册路由
app.include_router(chat_routes.router)
app.include_router(route_routes.router)
app.include_router(user_routes.router)
app.include_router(auth_routes.router)
app.include_router(analytics_routes.router)
app.include_router(knowledge_routes.router)
app.include_router(digital_human_routes.router)
app.include_router(reports_routes.router)
app.include_router(ai_routes.router)
app.include_router(asr_routes.router)
app.include_router(unity_routes.router)
app.include_router(config_routes.router)
app.include_router(admin_routes.router)


@app.get("/api/health")
async def health():
    return {"status": "ok", "service": "景区导览 AI 数字人 API"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host=settings.SERVER_HOST,
        port=settings.SERVER_PORT,
        reload=settings.DEBUG,
    )
