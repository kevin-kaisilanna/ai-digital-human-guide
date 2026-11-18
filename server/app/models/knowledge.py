"""知识条目数据模型 (PRD 4.2.1 知识库管理)"""

import enum
from datetime import datetime
from sqlalchemy import Column, String, Text, Enum, DateTime, JSON
from app.db.database import Base


class KnowledgeCategory(str, enum.Enum):
    history = "history"       # 历史文化
    spots = "spots"           # 景点介绍
    facility = "facility"     # 设施服务
    events = "events"         # 活动资讯
    faq = "faq"               # 常见问答
    guide = "guide"           # 游览指南
    routes = "routes"         # 路线推荐


class KnowledgeSource(str, enum.Enum):
    upload = "upload"
    manual = "manual"
    import_ = "import"


class KnowledgeEntry(Base):
    __tablename__ = "knowledge_entry"

    id = Column(String(36), primary_key=True, default=lambda: _new_id())
    title = Column(String(200), nullable=False, comment="知识标题")
    content = Column(Text, nullable=False, comment="知识内容")
    category = Column(Enum(KnowledgeCategory), nullable=False, index=True, comment="分类")
    tags = Column(JSON, default=list, comment="标签列表")
    source = Column(Enum(KnowledgeSource), default=KnowledgeSource.manual, comment="来源类型")
    source_file = Column(String(200), nullable=True, comment="来源文件名")
    created_at = Column(DateTime, default=datetime.utcnow, comment="创建时间")
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, comment="更新时间")

    def __repr__(self):
        return f"<KnowledgeEntry {self.title}>"


def _new_id():
    import uuid
    return str(uuid.uuid4())
