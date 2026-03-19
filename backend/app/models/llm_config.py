from sqlalchemy import Column, Integer, String, Boolean, DateTime
from sqlalchemy.sql import func
from app.database import Base


class LLMConfig(Base):
    __tablename__ = "llm_configs"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    provider = Column(String, nullable=False, default="openai")  # openai | anthropic
    base_url = Column(String, nullable=False)
    api_key = Column(String, nullable=False)
    model = Column(String, nullable=False)
    is_active = Column(Boolean, default=False)
    created_at = Column(DateTime, server_default=func.now())
