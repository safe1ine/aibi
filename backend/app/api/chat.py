import json
from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.database import get_db
from app.auth import get_current_user
from app.models.datasource import DataSource, DataSourceStatus
from app.agent.analyst import run_analysis

router = APIRouter(prefix="/chat", tags=["chat"])


class ChatRequest(BaseModel):
    datasource_id: int
    message: str


@router.post("/stream")
async def chat_stream(
    body: ChatRequest,
    db: AsyncSession = Depends(get_db),
    _=Depends(get_current_user),
):
    result = await db.execute(select(DataSource).where(DataSource.id == body.datasource_id))
    ds = result.scalar_one_or_none()
    if not ds:
        raise HTTPException(status_code=404, detail="数据源不存在")
    if ds.status != DataSourceStatus.ready:
        raise HTTPException(status_code=400, detail="数据源尚未就绪")

    connection_info = json.loads(ds.connection_info) if ds.connection_info else {}

    async def event_stream():
        async for chunk in run_analysis(
            message=body.message,
            ds_type=ds.type,
            connection_info=connection_info,
            schema_doc=ds.schema_doc or "",
        ):
            yield f"data: {json.dumps({'text': chunk})}\n\n"
        yield "data: [DONE]\n\n"

    return StreamingResponse(event_stream(), media_type="text/event-stream")
