from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.database import get_db
from app.auth import get_current_user
from app.models.llm_config import LLMConfig

router = APIRouter(prefix="/settings/llm", tags=["settings"])


class LLMConfigRequest(BaseModel):
    name: str
    provider: str = "openai"   # openai | anthropic
    base_url: str
    api_key: str
    model: str


@router.get("")
async def list_configs(db: AsyncSession = Depends(get_db), _=Depends(get_current_user)):
    result = await db.execute(select(LLMConfig).order_by(LLMConfig.created_at))
    configs = result.scalars().all()
    return [_to_dict(c) for c in configs]


@router.post("")
async def create_config(body: LLMConfigRequest, db: AsyncSession = Depends(get_db), _=Depends(get_current_user)):
    config = LLMConfig(**body.model_dump())
    db.add(config)
    await db.commit()
    await db.refresh(config)
    return _to_dict(config)


@router.put("/{config_id}")
async def update_config(config_id: int, body: LLMConfigRequest, db: AsyncSession = Depends(get_db), _=Depends(get_current_user)):
    config = await _get_or_404(db, config_id)
    for k, v in body.model_dump().items():
        if k == "api_key" and not v:
            continue  # 留空则保持原 key 不变
        setattr(config, k, v)
    await db.commit()
    return _to_dict(config)


@router.post("/{config_id}/activate")
async def activate_config(config_id: int, db: AsyncSession = Depends(get_db), _=Depends(get_current_user)):
    # 先全部取消激活
    result = await db.execute(select(LLMConfig))
    for c in result.scalars().all():
        c.is_active = False
    # 激活指定配置
    config = await _get_or_404(db, config_id)
    config.is_active = True
    await db.commit()
    return _to_dict(config)


@router.delete("/{config_id}")
async def delete_config(config_id: int, db: AsyncSession = Depends(get_db), _=Depends(get_current_user)):
    config = await _get_or_404(db, config_id)
    await db.delete(config)
    await db.commit()
    return {"ok": True}


async def _get_or_404(db: AsyncSession, config_id: int) -> LLMConfig:
    result = await db.execute(select(LLMConfig).where(LLMConfig.id == config_id))
    config = result.scalar_one_or_none()
    if not config:
        raise HTTPException(status_code=404, detail="配置不存在")
    return config


def _to_dict(c: LLMConfig) -> dict:
    return {
        "id": c.id,
        "name": c.name,
        "provider": c.provider,
        "base_url": c.base_url,
        "api_key": "***" if c.api_key else "",
        "model": c.model,
        "is_active": c.is_active,
    }
