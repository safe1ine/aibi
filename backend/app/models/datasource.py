from sqlalchemy import Column, Integer, String, Text, DateTime, Enum
from sqlalchemy.sql import func
from app.database import Base
import enum


class DataSourceType(str, enum.Enum):
    database = "database"
    file = "file"


class DataSourceStatus(str, enum.Enum):
    pending = "pending"
    analyzing = "analyzing"
    ready = "ready"
    error = "error"


class DataSource(Base):
    __tablename__ = "datasources"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    type = Column(Enum(DataSourceType), nullable=False)
    description = Column(Text)        # 用户的自然语言描述
    connection_info = Column(Text)    # JSON: 解析出的连接参数 or 文件路径列表
    schema_doc = Column(Text)         # AI 生成的结构说明
    status = Column(Enum(DataSourceStatus), default=DataSourceStatus.pending)
    error_message = Column(Text)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())
