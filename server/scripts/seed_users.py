"""
种子数据迁移脚本

从 visitor-app/public/data/users.json 读取现有用户，
密码用 PBKDF2 哈希后写入 SQLite 数据库。

用法: cd server && python -m scripts.seed_users
"""

import json
import sys
import os

# 确保项目根目录在 path 中
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.db.database import SessionLocal, init_db
from app.services.auth_service import hash_password, create_user, get_user_by_username
from app.models.user import User


def seed():
    """迁移 visitor-app 用户到数据库"""
    # 找到 users.json
    script_dir = os.path.dirname(os.path.abspath(__file__))
    project_root = os.path.dirname(script_dir)  # server/
    repo_root = os.path.dirname(project_root)    # d:/action/
    users_file = os.path.join(repo_root, "visitor-app", "public", "data", "users.json")

    if not os.path.exists(users_file):
        print(f"[FAIL] users.json not found: {users_file}")
        return

    with open(users_file, "r", encoding="utf-8") as f:
        seed_data = json.load(f)

    # 初始化数据库（创建表）
    init_db()
    db = SessionLocal()

    imported = 0
    skipped = 0

    for key, u in seed_data.items():
        username = u.get("username", key)
        password = u.get("password", "")
        phone = u.get("phone", "")
        display_name = u.get("displayName", username)
        status = u.get("status", "active")

        # 检查是否已存在
        existing = get_user_by_username(db, username)
        if existing:
            print(f"[SKIP] already exists: {username}")
            skipped += 1
            continue

        try:
            # 旧密码先临时哈希（后续登录时会检测为 low-strength）
            user = User(
                username=username.lower(),
                password_hash=hash_password(password),
                phone=phone,
                display_name=display_name,
                status=status,
                total_chats=u.get("totalChats", 0),
                total_messages=u.get("totalMessages", 0),
            )
            db.add(user)
            print(f"[OK] imported: {username}" + (f" (phone: {phone})" if phone else ""))
            imported += 1
        except Exception as e:
            print(f"[FAIL] {username}: {e}")

    db.commit()
    db.close()

    print(f"\n[DONE] imported={imported} skipped={skipped}")


if __name__ == "__main__":
    seed()
