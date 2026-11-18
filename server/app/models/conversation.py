"""对话记录数据模型 (PRD 4.1.1 多模态交互)"""

from datetime import datetime
from sqlalchemy import Column, String, Text, DateTime, JSON
from app.db.database import Base


class Conversation(Base):
    __tablename__ = "conversation"

    id = Column(String(36), primary_key=True, default=lambda: _new_id())
    session_id = Column(String(36), nullable=False, index=True, comment="会话ID")
    visitor_id = Column(String(36), nullable=False, index=True, comment="游客ID")
    messages = Column(JSON, default=list, comment="消息列表 [{role, type, content, emotion, created_at}]")
    created_at = Column(DateTime, default=datetime.utcnow, comment="创建时间")
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, comment="更新时间")

    def __repr__(self):
        return f"<Conversation {self.session_id}>"


class QueryLog(Base):
    """问答记录（用于统计和分析）"""

    __tablename__ = "query_log"

    id = Column(String(36), primary_key=True, default=lambda: _new_id())
    visitor_id = Column(String(36), nullable=False, index=True, comment="游客ID")
    question = Column(Text, nullable=False, comment="游客问题")
    answer = Column(Text, nullable=True, comment="AI回答")
    sentiment = Column(String(20), nullable=True, comment="情感: positive/neutral/negative")
    satisfaction = Column(String(10), nullable=True, comment="满意度评分")
    created_at = Column(DateTime, default=datetime.utcnow, comment="创建时间")

    def __repr__(self):
        return f"<QueryLog {self.question[:30]}>"


def _new_id():
    import uuid
    return str(uuid.uuid4())
