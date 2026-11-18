"""用户 API Pydantic 模型"""

from pydantic import BaseModel, field_validator
from typing import Optional


class LoginRequest(BaseModel):
    username: Optional[str] = None
    phone: Optional[str] = None
    password: str


class RegisterRequest(BaseModel):
    username: str
    password: str
    phone: Optional[str] = None


class UserResponse(BaseModel):
    username: str
    phone: str
    displayName: str
    createdAt: str
    status: str
    lastLoginAt: Optional[str] = None
    totalChats: int = 0
    totalMessages: int = 0


class LoginResponse(BaseModel):
    token: str
    user: UserResponse
    passwordLegacy: bool = False


class UpdateDisplayNameRequest(BaseModel):
    username: str
    displayName: str


class ChangePasswordRequest(BaseModel):
    username: str
    oldPassword: str
    newPassword: str


class UpdatePhoneRequest(BaseModel):
    username: str
    phone: str
