"""路线推荐 API 路由"""

import json
from pathlib import Path
from fastapi import APIRouter, Query

router = APIRouter(prefix="/api/routes", tags=["routes"])

ROOT = Path(__file__).resolve().parent.parent.parent.parent
DATA_DIR = ROOT / "src" / "data"


def _load_routes_from_guide() -> list[dict]:
    """从指南数据中提取预设路线"""
    guide_file = DATA_DIR / "knowledge-guide.json"
    if not guide_file.exists():
        return _default_routes()

    with open(guide_file, "r", encoding="utf-8") as f:
        entries = json.load(f)

    # 搜索路线相关条目
    routes = []
    for entry in entries:
        content = entry.get("content", "")
        if "路线" in content and "景点" in content:
            # 从指南文本中提取路线信息
            routes.append(_parse_route(entry))
        if len(routes) >= 3:
            break

    return routes if routes else _default_routes()


def _parse_route(entry: dict) -> dict:
    """从指南条目解析路线"""
    content = entry.get("content", "")
    title = entry.get("title", "游览路线")

    # 简单解析：提取关键词
    tags = []
    if "历史" in content or "文化" in content:
        tags.append("历史人文")
    if "自然" in content or "风光" in content:
        tags.append("自然风光")
    if "亲子" in content or "家庭" in content:
        tags.append("亲子游")

    return {
        "id": str(hash(title))[:8],
        "name": title[:30],
        "description": content[:200],
        "tags": tags or ["综合"],
        "spots": [],
        "duration": "约4-6小时",
        "spot_count": len(tags) + 3,
    }


def _default_routes() -> list[dict]:
    """默认 3 条路线"""
    return [
        {
            "id": "r1",
            "name": "一日看尽灵山 — 人文精华线",
            "description": "从入口到登顶，完整领略灵山佛教文化精华",
            "tags": ["历史人文"],
            "spots": [
                {"order": 1, "spot_name": "灵山大照壁", "talking_points": ["华夏第一壁", "赵朴初题字"], "duration": "15分钟"},
                {"order": 2, "spot_name": "祥符禅寺", "talking_points": ["千年古刹", "银杏古树"], "duration": "30分钟"},
                {"order": 3, "spot_name": "灵山大佛", "talking_points": ["88米青铜大佛", "登顶观景"], "duration": "60分钟"},
                {"order": 4, "spot_name": "灵山梵宫", "talking_points": ["佛教艺术殿堂", "东阳木雕"], "duration": "45分钟"},
                {"order": 5, "spot_name": "五印坛城", "talking_points": ["藏传佛教文化", "转经祈福"], "duration": "40分钟"},
            ],
            "duration": "约6小时",
            "spot_count": 5,
        },
        {
            "id": "r2",
            "name": "山水之间 — 自然风光线",
            "description": "在佛教文化中感受自然之美，适合拍照打卡和休闲漫步",
            "tags": ["自然风光", "摄影打卡"],
            "spots": [
                {"order": 1, "spot_name": "佛足坛", "talking_points": ["佛陀足迹", "千年印记"], "duration": "15分钟"},
                {"order": 2, "spot_name": "九龙灌浴", "talking_points": ["动态表演", "花开见佛"], "duration": "40分钟"},
                {"order": 3, "spot_name": "灵山大佛", "talking_points": ["登顶俯瞰太湖", "全景拍照"], "duration": "60分钟"},
                {"order": 4, "spot_name": "曼飞龙塔", "talking_points": ["傣族建筑风格", "园林景观"], "duration": "30分钟"},
            ],
            "duration": "约5小时",
            "spot_count": 4,
        },
        {
            "id": "r3",
            "name": "亲子同游 — 家庭欢乐线",
            "description": "轻松愉快的家庭游览，适合带老人和小朋友一起体验",
            "tags": ["亲子游"],
            "spots": [
                {"order": 1, "spot_name": "九龙灌浴", "talking_points": ["释迦牟尼诞生故事", "接取祈福圣水"], "duration": "45分钟"},
                {"order": 2, "spot_name": "百子戏弥勒", "talking_points": ["百子百态", "皆大欢喜"], "duration": "30分钟"},
                {"order": 3, "spot_name": "灵山梵宫", "talking_points": ["艺术欣赏", "素斋体验"], "duration": "60分钟"},
            ],
            "duration": "约4小时",
            "spot_count": 3,
        },
    ]


@router.get("")
async def get_routes(tags: str = Query("", description="逗号分隔的标签筛选")):
    """获取路线列表，可按标签筛选"""
    routes = _load_routes_from_guide()
    if tags:
        tag_list = [t.strip() for t in tags.split(",") if t.strip()]
        routes = [r for r in routes if any(t in r.get("tags", []) for t in tag_list)]
    return {"routes": routes}


@router.get("/{route_id}")
async def get_route_detail(route_id: str):
    """获取单条路线详情"""
    routes = _load_routes_from_guide()
    for r in routes:
        if r["id"] == route_id:
            return {"route": r}
    return {"route": None}
