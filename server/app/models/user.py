"""用户数据模型"""

import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Integer, DateTime
from app.db.database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    username = Column(String(50), unique=True, nullable=False, index=True, comment="登录用户名")
    password_hash = Column(String(128), nullable=False, comment="密码哈希 (pbkdf2_hmac)")
    phone = Column(String(20), default="", comment="手机号")
    display_name = Column(String(50), default="", comment="展示昵称")
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), comment="注册时间")
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc), comment="更新时间")
    last_login_at = Column(DateTime, nullable=True, comment="最后登录时间")
    status = Column(String(20), default="active", index=True, comment="状态: active / disabled")
    total_chats = Column(Integer, default=0, comment="对话总数")
    total_messages = Column(Integer, default=0, comment="消息总数")

    def to_dict(self):
        return {
            "username": self.username,
            "phone": self.phone or "",
            "displayName": self.display_name or self.username,
            "createdAt": self.created_at.isoformat() if self.created_at else "",
            "status": self.status,
            "lastLoginAt": self.last_login_at.isoformat() if self.last_login_at else None,
            "totalChats": self.total_chats or 0,
            "totalMessages": self.total_messages or 0,
        }
