import httpx
import logging
from fastapi import APIRouter
from pydantic import BaseModel
from backend.database import get_global_models, update_global_model
from backend.config import OPENROUTER_API_KEY

logger = logging.getLogger(__name__)

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


@router.get("/openrouter/catalog")
async def openrouter_catalog(q: str = ""):
    """Browse available models from OpenRouter's catalog."""
    try:
        async with httpx.AsyncClient(timeout=15.0) as client:
            resp = await client.get(
                "https://openrouter.ai/api/v1/models",
                headers={"Authorization": f"Bearer {OPENROUTER_API_KEY}"},
            )
            resp.raise_for_status()
        data = resp.json().get("data", [])

        models = []
        for m in data:
            model_id = m.get("id", "")
            name = m.get("name", model_id)
            pricing = m.get("pricing", {})

            # Filter by search query
            if q and q.lower() not in name.lower() and q.lower() not in model_id.lower():
                continue

            prompt_cost = float(pricing.get("prompt", "0")) * 1_000_000
            completion_cost = float(pricing.get("completion", "0")) * 1_000_000

            models.append({
                "id": model_id,
                "name": name,
                "context_length": m.get("context_length", 0),
                "cost_per_m_input": round(prompt_cost, 4),
                "cost_per_m_output": round(completion_cost, 4),
                "provider": model_id.split("/")[0] if "/" in model_id else "unknown",
            })

        # Sort by name
        models.sort(key=lambda x: x["name"])
        return models[:100]  # Cap at 100 results
    except Exception as e:
        logger.error(f"Failed to fetch OpenRouter catalog: {e}")
        return []
