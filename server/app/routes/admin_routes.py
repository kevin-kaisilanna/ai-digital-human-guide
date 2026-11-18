"""
管理员 API 路由 — 用户管理 + 聊天数据查询

  GET    /api/admin/users                    列出所有用户（分页/搜索/排序）
  GET    /api/admin/users/stats              聚合统计
  GET    /api/admin/users/:username          单个用户详情
  PUT    /api/admin/users/:username          更新用户（状态/昵称）
  DELETE /api/admin/users/:username          删除用户
  GET    /api/admin/users/:username/chats    用户聊天会话列表
  GET    /api/admin/users/:username/chats/:id 会话详情
  DELETE /api/admin/users/:username/chats/:id 删除会话
  POST   /api/admin/sync                     触发数据同步
"""

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.services import auth_service

router = APIRouter(prefix="/api/admin", tags=["admin"])


# ═══════════════════════ GET /api/admin/users/stats ═══════════════════════

@router.get("/users/stats")
def get_stats(db: Session = Depends(get_db)):
    return auth_service.get_user_stats(db)


# ═══════════════════════ GET /api/admin/users ═══════════════════════

@router.get("/users")
def list_users(
    search: str = Query(""),
    status: str = Query(""),
    sort: str = Query("created_at"),
    order: str = Query("desc"),
    page: int = Query(1),
    pageSize: int = Query(20),
    db: Session = Depends(get_db),
):
    users, total = auth_service.get_all_users(
        db, search=search, status_filter=status,
        sort_by=sort, order=order,
        page=page, page_size=pageSize,
    )
    return {
        "users": [
            {
                "username": u.username,
                "displayName": u.display_name or u.username,
                "createdAt": u.created_at.isoformat() if u.created_at else "",
                "status": u.status,
                "lastLoginAt": u.last_login_at.isoformat() if u.last_login_at else None,
                "totalChats": u.total_chats or 0,
                "totalMessages": u.total_messages or 0,
                "notes": "",
                "disabledAt": None,
            }
            for u in users
        ],
        "total": total,
        "page": page,
        "pageSize": pageSize,
    }


# ═══════════════════════ GET /api/admin/users/:username ═══════════════════════

@router.get("/users/{username}")
def get_user(username: str, db: Session = Depends(get_db)):
    user = auth_service.get_user_by_username(db, username)
    if not user:
        raise HTTPException(404, detail="用户不存在")
    return {
        "username": user.username,
        "displayName": user.display_name or user.username,
        "createdAt": user.created_at.isoformat() if user.created_at else "",
        "status": user.status,
        "lastLoginAt": user.last_login_at.isoformat() if user.last_login_at else None,
        "totalChats": user.total_chats or 0,
        "totalMessages": user.total_messages or 0,
        "notes": "",
        "disabledAt": None,
    }


# ═══════════════════════ PUT /api/admin/users/:username ═══════════════════════

@router.put("/users/{username}")
async def update_user(username: str, body: dict, db: Session = Depends(get_db)):
    user = auth_service.get_user_by_username(db, username)
    if not user:
        raise HTTPException(404, detail="用户不存在")

    if "displayName" in body and body["displayName"]:
        user.display_name = body["displayName"]
    if "notes" in body:
        pass  # notes 暂不存储到 User 表
    if "status" in body:
        new_status = body["status"]
        if new_status in ("active", "disabled"):
            user.status = new_status

    db.commit()
    db.refresh(user)

    return {
        "username": user.username,
        "displayName": user.display_name or user.username,
        "createdAt": user.created_at.isoformat() if user.created_at else "",
        "status": user.status,
        "lastLoginAt": user.last_login_at.isoformat() if user.last_login_at else None,
        "totalChats": user.total_chats or 0,
        "totalMessages": user.total_messages or 0,
        "notes": "",
        "disabledAt": None,
    }


# ═══════════════════════ DELETE /api/admin/users/:username ═══════════════════════

@router.delete("/users/{username}")
def delete_user(username: str, db: Session = Depends(get_db)):
    try:
        auth_service.delete_user(db, username)
        return {"deleted": username}
    except ValueError as e:
        raise HTTPException(404, detail=str(e))


# ═══════════════════════ GET /api/admin/users/:username/chats ═══════════════════════

@router.get("/users/{username}/chats")
def get_user_chats(username: str, db: Session = Depends(get_db)):
    """获取用户的聊天会话列表（从数据库 conversation 表查询）"""
    from app.models.conversation import Conversation as ConvModel
    sessions = db.query(ConvModel).filter(
        ConvModel.visitor_id == username
    ).order_by(ConvModel.updated_at.desc()).all()

    return {
        "username": username,
        "sessions": [
            {
                "session_id": s.session_id,
                "title": s.session_id[:8] + "…",
                "status": "active",
                "messageCount": len(s.messages) if s.messages else 0,
                "created_at": s.created_at.isoformat() if s.created_at else "",
                "updated_at": s.updated_at.isoformat() if s.updated_at else "",
            }
            for s in sessions
        ],
        "totalSessions": len(sessions),
        "totalMessages": sum(len(s.messages) if s.messages else 0 for s in sessions),
    }


# ═══════════════════════ GET /api/admin/users/:username/chats/:sessId ═══════════════════════

@router.get("/users/{username}/chats/{sess_id}")
def get_chat_detail(username: str, sess_id: str, db: Session = Depends(get_db)):
    from app.models.conversation import Conversation as ConvModel
    session = db.query(ConvModel).filter(
        ConvModel.session_id == sess_id,
        ConvModel.visitor_id == username,
    ).first()
    if not session:
        raise HTTPException(404, detail="会话不存在")
    return {
        "session_id": session.session_id,
        "username": session.username,
        "title": session.title,
        "status": session.status,
        "created_at": session.created_at.isoformat() if session.created_at else "",
        "updated_at": session.updated_at.isoformat() if session.updated_at else "",
        "messages": session.messages or [],
    }


# ═══════════════════════ DELETE /api/admin/users/:username/chats/:sessId ═══════════════════════

@router.delete("/users/{username}/chats/{sess_id}")
def delete_chat(username: str, sess_id: str, db: Session = Depends(get_db)):
    from app.models.conversation import Conversation as ConvModel
    session = db.query(ConvModel).filter(
        ConvModel.session_id == sess_id,
        ConvModel.visitor_id == username,
    ).first()
    if not session:
        raise HTTPException(404, detail="会话不存在")

    db.delete(session)
    db.commit()
    return {"deleted": sess_id}


# ═══════════════════════ POST /api/admin/sync ═══════════════════════

@router.post("/sync")
def sync_users(db: Session = Depends(get_db)):
    """触发数据同步 — 当前为数据库直读模式，sync 为 no-op"""
    stats = auth_service.get_user_stats(db)
    return {
        "imported": 0,
        "skipped": stats["total"],
        "total": stats["total"],
        "lastSyncedAt": None,
    }
