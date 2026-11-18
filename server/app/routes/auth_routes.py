"""Auth API 路由"""

from fastapi import APIRouter, HTTPException

router = APIRouter(prefix="/api/auth", tags=["auth"])

# 硬编码管理后台账号
ADMIN_USER = {"username": "admin", "password": "admin123"}


@router.post("/login")
async def login(body: dict):
    username = body.get("username", "")
    password = body.get("password", "")
    if username != ADMIN_USER["username"] or password != ADMIN_USER["password"]:
        raise HTTPException(401, "用户名或密码错误")

    token = "admin-token-" + str(hash(username + password))[:16]
    return {
        "token": token,
        "user": {"name": username, "role": "管理员"},
    }


@router.post("/logout")
async def logout():
    return {"ok": True}
