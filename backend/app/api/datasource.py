import json
import os
import shutil
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, BackgroundTasks
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.database import get_db
from app.auth import get_current_user
from app.models.datasource import DataSource, DataSourceType, DataSourceStatus
from app.agent.analyzer import analyze_datasource

router = APIRouter(prefix="/datasources", tags=["datasources"])
UPLOAD_DIR = os.getenv("UPLOAD_DIR", "./uploads")


class DatabaseSourceRequest(BaseModel):
    name: str
    description: str  # 自然语言描述，包含连接信息


@router.get("")
async def list_datasources(db: AsyncSession = Depends(get_db), _=Depends(get_current_user)):
    result = await db.execute(select(DataSource).order_by(DataSource.created_at.desc()))
    sources = result.scalars().all()
    return [_to_dict(s) for s in sources]


@router.post("/database")
async def create_database_source(
    body: DatabaseSourceRequest,
    background_tasks: BackgroundTasks,
    db: AsyncSession = Depends(get_db),
    _=Depends(get_current_user),
):
    ds = DataSource(name=body.name, type=DataSourceType.database, description=body.description, status=DataSourceStatus.analyzing)
    db.add(ds)
    await db.commit()
    await db.refresh(ds)
    background_tasks.add_task(analyze_datasource, ds.id)
    return _to_dict(ds)


@router.post("/file")
async def create_file_source(
    name: str = Form(...),
    description: str = Form(""),
    files: list[UploadFile] = File(...),
    background_tasks: BackgroundTasks = BackgroundTasks(),
    db: AsyncSession = Depends(get_db),
    _=Depends(get_current_user),
):
    saved_paths = []
    for f in files:
        dest = os.path.join(UPLOAD_DIR, f.filename)
        with open(dest, "wb") as out:
            shutil.copyfileobj(f.file, out)
        saved_paths.append(dest)

    ds = DataSource(
        name=name,
        type=DataSourceType.file,
        description=description,
        connection_info=json.dumps({"files": saved_paths}),
        status=DataSourceStatus.analyzing,
    )
    db.add(ds)
    await db.commit()
    await db.refresh(ds)
    background_tasks.add_task(analyze_datasource, ds.id)
    return _to_dict(ds)


@router.post("/{ds_id}/reanalyze")
async def reanalyze(ds_id: int, background_tasks: BackgroundTasks, db: AsyncSession = Depends(get_db), _=Depends(get_current_user)):
    ds = await _get_or_404(db, ds_id)
    ds.status = DataSourceStatus.analyzing
    ds.error_message = None
    await db.commit()
    background_tasks.add_task(analyze_datasource, ds_id)
    return {"status": "analyzing"}


@router.delete("/{ds_id}")
async def delete_datasource(ds_id: int, db: AsyncSession = Depends(get_db), _=Depends(get_current_user)):
    ds = await _get_or_404(db, ds_id)
    await db.delete(ds)
    await db.commit()
    return {"ok": True}


async def _get_or_404(db: AsyncSession, ds_id: int) -> DataSource:
    result = await db.execute(select(DataSource).where(DataSource.id == ds_id))
    ds = result.scalar_one_or_none()
    if not ds:
        raise HTTPException(status_code=404, detail="数据源不存在")
    return ds


def _to_dict(ds: DataSource) -> dict:
    return {
        "id": ds.id,
        "name": ds.name,
        "type": ds.type,
        "description": ds.description,
        "schema_doc": ds.schema_doc,
        "status": ds.status,
        "error_message": ds.error_message,
        "created_at": ds.created_at.isoformat() if ds.created_at else None,
        "updated_at": ds.updated_at.isoformat() if ds.updated_at else None,
    }
