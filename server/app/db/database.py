"""数据库连接 —— SQLAlchemy engine + session"""

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

from app.config.settings import settings

engine = create_engine(
    settings.DATABASE_URL,
    connect_args={"check_same_thread": False} if "sqlite" in settings.DATABASE_URL else {},
    echo=settings.DEBUG,
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()


def get_db():
    """FastAPI 依赖注入：每个请求获取独立 session"""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def init_db():
    """创建所有表（开发用，生产应使用 Alembic 迁移）"""
    # 延迟导入，避免循环依赖
    from app.models import knowledge, conversation, user  # noqa: F401
    Base.metadata.create_all(bind=engine)
