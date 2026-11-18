"""Knowledge CRUD API 路由"""

import uuid
import os
from fastapi import APIRouter, HTTPException, Query, UploadFile, File
from app.db.database import SessionLocal
from app.models.knowledge import KnowledgeEntry, KnowledgeCategory, KnowledgeSource

router = APIRouter(prefix="/api/knowledge", tags=["knowledge"])


@router.get("")
async def get_list(page: int = Query(1, ge=1), pageSize: int = Query(50, ge=1, le=200)):
    db = SessionLocal()
    try:
        offset = (page - 1) * pageSize
        entries = db.query(KnowledgeEntry).order_by(
            KnowledgeEntry.updated_at.desc()
        ).offset(offset).limit(pageSize).all()

        return [
            {
                "id": e.id,
                "title": e.title,
                "category": e.category.value if e.category else "history",
                "source": e.source_file or "手动录入",
                "content": e.content,
                "excerpt": (e.content or "")[:180] + ("..." if len(e.content or "") > 180 else ""),
                "updated_at": e.updated_at.isoformat() if e.updated_at else "",
                "tags": e.tags or [],
            }
            for e in entries
        ]
    finally:
        db.close()


@router.post("")
async def create_entry(body: dict):
    db = SessionLocal()
    try:
        cat_str = body.get("category", "history")
        try:
            category = KnowledgeCategory[cat_str]
        except KeyError:
            category = KnowledgeCategory.history

        entry = KnowledgeEntry(
            id=str(uuid.uuid4()),
            title=body.get("title", "")[:200],
            content=body.get("content", ""),
            category=category,
            tags=body.get("tags", []),
            source=KnowledgeSource.manual,
            source_file="管理后台录入",
        )
        db.add(entry)
        db.commit()
        db.refresh(entry)

        return {
            "id": entry.id,
            "title": entry.title,
            "category": entry.category.value,
            "content": entry.content,
            "excerpt": (entry.content or "")[:180],
            "updated_at": entry.updated_at.isoformat() if entry.updated_at else "",
        }
    except Exception as e:
        db.rollback()
        raise HTTPException(500, str(e))
    finally:
        db.close()


@router.put("/{entry_id}")
async def update_entry(entry_id: str, body: dict):
    db = SessionLocal()
    try:
        entry = db.query(KnowledgeEntry).filter(KnowledgeEntry.id == entry_id).first()
        if not entry:
            raise HTTPException(404, "知识条目不存在")

        if "title" in body:
            entry.title = body["title"][:200]
        if "content" in body:
            entry.content = body["content"]
        if "category" in body:
            try:
                entry.category = KnowledgeCategory[body["category"]]
            except KeyError:
                pass
        if "tags" in body:
            entry.tags = body["tags"]

        db.commit()
        db.refresh(entry)

        return {
            "id": entry.id,
            "title": entry.title,
            "category": entry.category.value,
            "content": entry.content,
            "excerpt": (entry.content or "")[:180],
            "updated_at": entry.updated_at.isoformat() if entry.updated_at else "",
        }
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(500, str(e))
    finally:
        db.close()


@router.delete("/{entry_id}")
async def delete_entry(entry_id: str):
    db = SessionLocal()
    try:
        entry = db.query(KnowledgeEntry).filter(KnowledgeEntry.id == entry_id).first()
        if not entry:
            raise HTTPException(404, "知识条目不存在")
        db.delete(entry)
        db.commit()
        return {"ok": True}
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(500, str(e))
    finally:
        db.close()


@router.post("/upload")
async def upload_file(file: UploadFile = File(...)):
    """上传 .txt / .docx 文档，自动解析并导入知识库"""
    filename = file.filename or "unknown"
    ext = os.path.splitext(filename)[1].lower()
    if ext not in (".txt", ".docx"):
        raise HTTPException(400, f"不支持的文件格式 {ext}，仅支持 .txt 和 .docx")

    try:
        raw = await file.read()
    except Exception:
        raise HTTPException(400, "无法读取文件内容")

    if len(raw) > 10 * 1024 * 1024:
        raise HTTPException(400, "文件大小不能超过 10MB")

    text = ""
    if ext == ".txt":
        try:
            text = raw.decode("utf-8")
        except UnicodeDecodeError:
            try:
                text = raw.decode("gbk")
            except Exception:
                raise HTTPException(400, "无法解码文本文件，请使用 UTF-8 编码")
    elif ext == ".docx":
        try:
            from docx import Document
            from io import BytesIO
            doc = Document(BytesIO(raw))
            paragraphs = [p.text for p in doc.paragraphs if p.text.strip()]
            text = "\n".join(paragraphs)
        except ImportError:
            raise HTTPException(500, "服务器未安装 python-docx 库，无法解析 .docx 文件")
        except Exception as e:
            raise HTTPException(400, f"无法解析 .docx 文件：{str(e)}")

    if not text.strip():
        raise HTTPException(400, "文件内容为空，无法导入")

    title = os.path.splitext(filename)[0][:200]
    db = SessionLocal()
    try:
        entry = KnowledgeEntry(
            id=str(uuid.uuid4()),
            title=title,
            content=text,
            category=KnowledgeCategory.history,
            tags=[],
            source=KnowledgeSource.upload,
            source_file=filename,
        )
        db.add(entry)
        db.commit()
        db.refresh(entry)

        return {
            "success": True,
            "message": f"文件「{filename}」已导入知识库",
            "entry": {
                "id": entry.id,
                "title": entry.title,
                "category": entry.category.value,
                "excerpt": (entry.content or "")[:180],
                "updated_at": entry.updated_at.isoformat() if entry.updated_at else "",
            },
        }
    except Exception as e:
        db.rollback()
        raise HTTPException(500, str(e))
    finally:
        db.close()
