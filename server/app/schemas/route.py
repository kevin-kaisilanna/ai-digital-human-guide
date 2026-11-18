"""Route API Pydantic 模型"""

from pydantic import BaseModel


class RouteSpotItem(BaseModel):
    order: int
    spot_name: str
    talking_points: list[str]
    duration: str


class RouteResponse(BaseModel):
    id: str
    name: str
    description: str
    tags: list[str]
    image_url: Optional[str] = None
    spots: list[RouteSpotItem]
    duration: str
    spot_count: int
