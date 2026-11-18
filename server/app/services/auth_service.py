"""认证服务 — 密码哈希 + 用户 CRUD + token 生成

使用 hashlib.pbkdf2_hmac（Python 标准库，无需额外依赖）"""

import hashlib
import hmac
import os
import re
import time
from datetime import datetime, timezone
from sqlalchemy.orm import Session
from app.models.user import User
from app.config.settings import settings

# ═══════════════════════════ 密码哈希 ═══════════════════════════

HASH_ITERATIONS = 100_000
HASH_ALGORITHM = "sha256"


def hash_password(password: str) -> str:
    """PBKDF2-HMAC-SHA256 哈希密码，格式: $pbkdf2$iterations$salt$hash"""
    salt = os.urandom(16)
    dk = hashlib.pbkdf2_hmac(HASH_ALGORITHM, password.encode(), salt, HASH_ITERATIONS)
    return f"$pbkdf2${HASH_ITERATIONS}${salt.hex()}${dk.hex()}"


def verify_password(password: str, stored_hash: str) -> bool:
    """验证密码。兼容旧格式（legacy 标记的明文或简单哈希）"""
    # 新格式: $pbkdf2$iterations$salt$hash
    if stored_hash.startswith("$pbkdf2$"):
        try:
            _, _, iters_str, salt_hex, hash_hex = stored_hash.split("$")
            salt = bytes.fromhex(salt_hex)
            expected = bytes.fromhex(hash_hex)
            dk = hashlib.pbkdf2_hmac(HASH_ALGORITHM, password.encode(), salt, int(iters_str))
            return hmac.compare_digest(dk, expected)
        except (ValueError, IndexError):
            return False

    # 旧格式: 纯文本密码（向后兼容）
    return stored_hash == password


def is_legacy_hash(stored_hash: str) -> bool:
    """检测是否为旧格式密码（需要升级）"""
    return not stored_hash.startswith("$pbkdf2$")


# ═══════════════════════════ 校验 ═══════════════════════════

def validate_username(username: str) -> str | None:
    if not username or len(username.strip()) < 2:
        return "用户名至少需要 2 个字符"
    if len(username.strip()) > 20:
        return "用户名最多 20 个字符"
    if username != username.strip():
        return "用户名首尾不能有空格"
    if not re.match(r'^[\w一-鿿]+$', username.strip()):
        return "用户名只能包含字母、数字、下划线或中文"
    return None


def validate_password_strength(password: str) -> str | None:
    """注册/改密时强制 ≥4 位"""
    if not password or len(password) < 4:
        return "密码至少需要 4 个字符"
    return None


def validate_phone(phone: str) -> str | None:
    if not phone or phone.strip() == "":
        return None  # 可选
    if not re.match(r'^1[3-9]\d{9}$', phone.strip()):
        return "请输入正确的 11 位手机号"
    return None


# ═══════════════════════════ Token ═══════════════════════════

def generate_token(username: str) -> str:
    """生成登录 token（简化版 HMAC-SHA256，生产环境应使用 JWT）"""
    payload = f"{username}:{int(time.time())}"
    sig = hmac.new(
        settings.JWT_SECRET.encode(),
        payload.encode(),
        hashlib.sha256,
    ).hexdigest()[:32]
    return f"tk-{sig}-{payload}"


def verify_token(token: str) -> str | None:
    """校验 token，返回 username 或 None"""
    if not token or not token.startswith("tk-"):
        return None
    try:
        parts = token.split("-", 2)
        if len(parts) < 3:
            return None
        sig = parts[1]
        payload = parts[2]
        expected_sig = hmac.new(
            settings.JWT_SECRET.encode(),
            payload.encode(),
            hashlib.sha256,
        ).hexdigest()[:32]
        if not hmac.compare_digest(sig, expected_sig):
            return None
        username = payload.split(":")[0]
        return username
    except (IndexError, ValueError):
        return None


# ═══════════════════════════ 用户 CRUD ═══════════════════════════

def create_user(db: Session, username: str, password: str, phone: str = "") -> User:
    """创建新用户，密码自动哈希"""
    err = validate_username(username)
    if err:
        raise ValueError(err)
    err = validate_password_strength(password)
    if err:
        raise ValueError(err)
    if phone:
        err = validate_phone(phone)
        if err:
            raise ValueError(err)

    key = username.strip().lower()
    existing = db.query(User).filter(User.username == key).first()
    if existing:
        raise ValueError("该用户名已被注册，请换一个")

    if phone:
        existing_phone = db.query(User).filter(User.phone == phone.strip()).first()
        if existing_phone:
            raise ValueError("该手机号已被绑定")

    user = User(
        username=username.strip(),
        password_hash=hash_password(password),
        phone=phone.strip() if phone else "",
        display_name=username.strip(),
        status="active",
        created_at=datetime.now(timezone.utc),
        updated_at=datetime.now(timezone.utc),
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


def authenticate_user(db: Session, identifier: str, password: str) -> tuple[User | None, bool, str | None]:
    """
    验证用户登录。
    返回: (user, password_legacy, error_message)
    - user: 成功时返回 User，失败返回 None
    - password_legacy: 是否为旧格式密码（需提示升级）
    - error_message: 失败时的错误信息
    """
    if not identifier or not password:
        return None, False, "请输入用户名和密码"

    key = identifier.strip().lower()
    user = None

    # 先按用户名查找
    user = db.query(User).filter(User.username == key).first()

    # 再按手机号查找
    if not user and re.match(r'^1[3-9]\d{9}$', identifier):
        user = db.query(User).filter(User.phone == identifier.strip()).first()

    if not user:
        return None, False, "账号不存在，请先注册"

    if user.status == "disabled":
        return None, False, "该账号已被管理员禁用，请联系景区工作人员"

    if not verify_password(password, user.password_hash):
        return None, False, "密码错误，请重试"

    # 更新最后登录时间
    user.last_login_at = datetime.now(timezone.utc)
    db.commit()

    legacy = is_legacy_hash(user.password_hash)
    return user, legacy, None


def get_user_by_username(db: Session, username: str) -> User | None:
    return db.query(User).filter(User.username == username.strip().lower()).first()


def update_user_display_name(db: Session, username: str, display_name: str) -> User:
    user = get_user_by_username(db, username)
    if not user:
        raise ValueError("用户不存在")
    if not display_name or len(display_name.strip()) < 1:
        raise ValueError("昵称不能为空")
    if len(display_name.strip()) > 20:
        raise ValueError("昵称最多 20 个字符")
    user.display_name = display_name.strip()
    user.updated_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(user)
    return user


def change_user_password(db: Session, username: str, old_password: str, new_password: str) -> None:
    user = get_user_by_username(db, username)
    if not user:
        raise ValueError("用户不存在")
    if not verify_password(old_password, user.password_hash):
        raise ValueError("旧密码不正确")
    err = validate_password_strength(new_password)
    if err:
        raise ValueError(err)
    user.password_hash = hash_password(new_password)
    user.updated_at = datetime.now(timezone.utc)
    db.commit()


def reset_user_password(db: Session, username: str) -> str:
    """找回密码：生成 8 位随机新密码，返回明文"""
    user = get_user_by_username(db, username)
    if not user:
        raise ValueError("该账号不存在")

    chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789"
    new_pwd = "".join(chars[ord(os.urandom(1)) % len(chars)] for _ in range(8))

    user.password_hash = hash_password(new_pwd)
    user.updated_at = datetime.now(timezone.utc)
    db.commit()
    return new_pwd


def update_user_phone(db: Session, username: str, phone: str) -> User:
    user = get_user_by_username(db, username)
    if not user:
        raise ValueError("用户不存在")
    if phone:
        err = validate_phone(phone)
        if err:
            raise ValueError(err)
        existing = db.query(User).filter(User.phone == phone.strip(), User.username != username.lower()).first()
        if existing:
            raise ValueError("该手机号已被绑定")
    user.phone = phone.strip() if phone else ""
    user.updated_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(user)
    return user


def get_all_users(db: Session, search: str = "", status_filter: str = "",
                  sort_by: str = "created_at", order: str = "desc",
                  page: int = 1, page_size: int = 20) -> tuple[list[User], int]:
    """分页获取用户列表"""
    q = db.query(User)

    if search:
        q = q.filter(
            (User.username.contains(search.lower())) |
            (User.display_name.contains(search))
        )
    if status_filter == "active":
        q = q.filter(User.status == "active")
    elif status_filter == "disabled":
        q = q.filter(User.status == "disabled")

    total = q.count()

    sort_col = getattr(User, sort_by, User.created_at)
    if order == "asc":
        q = q.order_by(sort_col.asc())
    else:
        q = q.order_by(sort_col.desc())

    offset = (page - 1) * page_size
    users = q.offset(offset).limit(page_size).all()
    return users, total


def get_user_stats(db: Session) -> dict:
    total = db.query(User).count()
    active = db.query(User).filter(User.status == "active").count()
    disabled = db.query(User).filter(User.status == "disabled").count()
    total_chats = db.query(User).with_entities(
        __import__("sqlalchemy").sql.func.sum(User.total_chats)
    ).scalar() or 0
    total_messages = db.query(User).with_entities(
        __import__("sqlalchemy").sql.func.sum(User.total_messages)
    ).scalar() or 0
    return {
        "total": total,
        "active": active,
        "disabled": disabled,
        "totalChats": total_chats,
        "totalMessages": total_messages,
    }


def disable_user(db: Session, username: str) -> User:
    user = get_user_by_username(db, username)
    if not user:
        raise ValueError("用户不存在")
    user.status = "disabled"
    user.updated_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(user)
    return user


def enable_user(db: Session, username: str) -> User:
    user = get_user_by_username(db, username)
    if not user:
        raise ValueError("用户不存在")
    user.status = "active"
    user.updated_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(user)
    return user


def delete_user(db: Session, username: str) -> None:
    user = get_user_by_username(db, username)
    if not user:
        raise ValueError("用户不存在")
    db.delete(user)
    db.commit()
