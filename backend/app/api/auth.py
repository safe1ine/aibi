from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from app.auth import verify_login, create_token

router = APIRouter(prefix="/auth", tags=["auth"])


class LoginRequest(BaseModel):
    username: str
    password: str


@router.post("/login")
def login(body: LoginRequest):
    if not verify_login(body.username, body.password):
        raise HTTPException(status_code=401, detail="用户名或密码错误")
    return {"token": create_token()}
