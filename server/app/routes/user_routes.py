"""用户 API 路由

完整用户认证系统：
  POST   /api/user/login        — 用户名/手机号 + 密码登录
  POST   /api/user/register     — 注册新用户
  POST   /api/user/recover      — 找回密码
  PUT    /api/user/display-name — 修改昵称
  PUT    /api/user/password     — 修改密码
  PUT    /api/user/phone        — 绑定手机号
  GET    /api/user/profile      — 获取当前用户信息
  GET    /api/user/status       — 查询用户状态
"""

from fastapi import APIRouter, Depends, HTTPException, Header
from sqlalchemy.orm import Session
from typing import Optional

from app.db.database import get_db
from app.schemas.user import (
    LoginRequest, RegisterRequest, LoginResponse, UserResponse,
    UpdateDisplayNameRequest, ChangePasswordRequest, UpdatePhoneRequest,
)
from app.services import auth_service

router = APIRouter(prefix="/api/user", tags=["user"])


def _user_to_response(user) -> UserResponse:
    return UserResponse(
        username=user.username,
        phone=user.phone or "",
        displayName=user.display_name or user.username,
        createdAt=user.created_at.isoformat() if user.created_at else "",
        status=user.status,
        lastLoginAt=user.last_login_at.isoformat() if user.last_login_at else None,
        totalChats=user.total_chats or 0,
        totalMessages=user.total_messages or 0,
    )


# ═══════════════════════════ POST /api/user/login ═══════════════════════════

@router.post("/login", response_model=LoginResponse)
def login(req: LoginRequest, db: Session = Depends(get_db)):
    """
    登录支持两种方式：
    1. username + password — 用户名密码登录
    2. phone + password — 手机号密码登录
    """
    identifier = req.username or req.phone
    if not identifier:
        raise HTTPException(400, detail="请输入用户名或手机号")

    user, legacy, error = auth_service.authenticate_user(db, identifier, req.password)

    if error:
        status = 401
        if "禁用" in error:
            status = 403
        elif "不存在" in error:
            status = 401
        raise HTTPException(status, detail=error)

    token = auth_service.generate_token(user.username)
    return LoginResponse(
        token=token,
        user=_user_to_response(user),
        passwordLegacy=legacy,
    )


# ═══════════════════════════ POST /api/user/register ═══════════════════════════

@router.post("/register", response_model=LoginResponse)
def register(req: RegisterRequest, db: Session = Depends(get_db)):
    """注册新用户，密码需 ≥6 位且包含字母+数字"""
    try:
        user = auth_service.create_user(db, req.username, req.password, req.phone or "")
    except ValueError as e:
        raise HTTPException(400, detail=str(e))

    token = auth_service.generate_token(user.username)
    return LoginResponse(
        token=token,
        user=_user_to_response(user),
        passwordLegacy=False,
    )


# ═══════════════════════════ POST /api/user/recover ═══════════════════════════

@router.post("/recover")
def recover(body: dict, db: Session = Depends(get_db)):
    """找回密码 — 输入用户名，返回 8 位随机新密码"""
    username = body.get("username", "")
    try:
        new_pwd = auth_service.reset_user_password(db, username)
        return {"newPassword": new_pwd}
    except ValueError as e:
        raise HTTPException(404, detail=str(e))


# ═══════════════════════════ PUT /api/user/display-name ═══════════════════════════

@router.put("/display-name")
def update_display_name(req: UpdateDisplayNameRequest, db: Session = Depends(get_db)):
    try:
        user = auth_service.update_user_display_name(db, req.username, req.displayName)
        return {"user": _user_to_response(user)}
    except ValueError as e:
        raise HTTPException(400, detail=str(e))


# ═══════════════════════════ PUT /api/user/password ═══════════════════════════

@router.put("/password")
def change_password(req: ChangePasswordRequest, db: Session = Depends(get_db)):
    """修改密码 — 新密码 ≥6 位 + 字母+数字"""
    try:
        auth_service.change_user_password(db, req.username, req.oldPassword, req.newPassword)
        return {"ok": True}
    except ValueError as e:
        msg = str(e)
        if "旧密码" in msg:
            raise HTTPException(403, detail=msg)
        raise HTTPException(400, detail=msg)


# ═══════════════════════════ PUT /api/user/phone ═══════════════════════════

@router.put("/phone")
def update_phone(req: UpdatePhoneRequest, db: Session = Depends(get_db)):
    try:
        user = auth_service.update_user_phone(db, req.username, req.phone)
        return {"user": _user_to_response(user)}
    except ValueError as e:
        raise HTTPException(400, detail=str(e))


# ═══════════════════════════ GET /api/user/profile ═══════════════════════════

@router.get("/profile")
def get_profile(authorization: Optional[str] = Header(None),
                x_username: Optional[str] = Header(None, alias="x-username"),
                db: Session = Depends(get_db)):
    token = (authorization or "").replace("Bearer ", "")
    username = auth_service.verify_token(token) if token else x_username
    if not username:
        raise HTTPException(401, detail="未登录")

    user = auth_service.get_user_by_username(db, username)
    if not user:
        raise HTTPException(404, detail="用户不存在")

    return {"ok": True, "user": _user_to_response(user)}


# ═══════════════════════════ GET /api/user/status ═══════════════════════════

@router.get("/status")
def get_status(x_username: Optional[str] = Header(None, alias="x-username"),
               db: Session = Depends(get_db)):
    if not x_username:
        raise HTTPException(401, detail="未登录")
    user = auth_service.get_user_by_username(db, x_username)
    if not user:
        raise HTTPException(404, detail="用户不存在")
    return {
        "username": user.username,
        "status": user.status,
        "displayName": user.display_name,
        "totalChats": user.total_chats,
        "totalMessages": user.total_messages,
    }
