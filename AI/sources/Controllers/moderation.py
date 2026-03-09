from fastapi import APIRouter
from pydantic import BaseModel, Field, conlist

from sources.Moderation.service import moderation_service

router = APIRouter()


class ModerationRequest(BaseModel):
    text: str = Field(..., min_length=1, max_length=5000)


class ModerationBatchRequest(BaseModel):
    texts: conlist(str, min_items=1, max_items=100)


@router.get("/moderation/status")
async def moderation_status():
    return moderation_service.status()


@router.post("/moderation/predict")
async def moderation_predict(payload: ModerationRequest):
    return moderation_service.predict(payload.text)


@router.post("/moderation/predict-batch")
async def moderation_predict_batch(payload: ModerationBatchRequest):
    return {
        "results": [moderation_service.predict(text) for text in payload.texts],
    }
