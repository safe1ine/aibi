import os
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

load_dotenv()

from app.database import init_db
from app.api import auth, datasource, chat, settings


@asynccontextmanager
async def lifespan(app: FastAPI):
    os.makedirs(os.getenv("UPLOAD_DIR", "./uploads"), exist_ok=True)
    await init_db()
    yield


app = FastAPI(title="CatBI", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(datasource.router)
app.include_router(chat.router)
app.include_router(settings.router)
