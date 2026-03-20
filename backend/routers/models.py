from fastapi import APIRouter
from pydantic import BaseModel
from backend.database import get_global_models, update_global_model

router = APIRouter(prefix="/models", tags=["models"])


class ModelUpdate(BaseModel):
    enabled: bool
    description: str = ""


@router.get("")
def list_models():
    return get_global_models()


@router.put("/{model_name}")
def toggle_model(model_name: str, update: ModelUpdate):
    update_global_model(model_name, update.enabled, update.description)
    return {"status": "updated", "model_name": model_name, "enabled": update.enabled}
