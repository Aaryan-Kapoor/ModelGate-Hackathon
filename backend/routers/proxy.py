import json
import time
import logging
from datetime import datetime, timezone

import httpx
from fastapi import APIRouter, HTTPException
from fastapi.responses import JSONResponse

from backend.models import ChatCompletionRequest
from backend.database import get_customer, save_request_log
from backend.services.router_engine import route
from backend.services.provider_registry import get_openrouter_id, estimate_cost
from backend.config import OPENROUTER_API_KEY, OPENROUTER_BASE_URL

logger = logging.getLogger(__name__)

router = APIRouter(tags=["proxy"])


@router.post("/v1/{customer_id}/chat/completions")
async def chat_completions(customer_id: str, request: ChatCompletionRequest):
    profile = get_customer(customer_id)
    if not profile:
        raise HTTPException(status_code=404, detail=f"Customer '{customer_id}' not found")

    user_prompt = ""
    for msg in reversed(request.messages):
        if msg.get("role") == "user":
            user_prompt = msg.get("content", "")
            break

    if not user_prompt:
        raise HTTPException(status_code=400, detail="No user message found")

    # Classify + Route
    classify_start = time.time()
    decision = route(profile, user_prompt)
    classify_ms = int((time.time() - classify_start) * 1000)
    openrouter_model = get_openrouter_id(decision.selected_model)

    # Forward to OpenRouter
    status = "success"
    ttft_ms = 0
    start_time = time.time()
    try:
        async with httpx.AsyncClient(timeout=60.0) as client:
            response = await client.post(
                f"{OPENROUTER_BASE_URL}/chat/completions",
                headers={
                    "Authorization": f"Bearer {OPENROUTER_API_KEY}",
                    "Content-Type": "application/json",
                    "HTTP-Referer": "https://modelgate.app",
                    "X-Title": "ModelGate",
                },
                json={
                    "model": openrouter_model,
                    "messages": request.messages,
                    "temperature": request.temperature,
                    **({"max_tokens": request.max_tokens} if request.max_tokens else {}),
                },
            )
            ttft_ms = int((time.time() - start_time) * 1000)
            response.raise_for_status()
    except httpx.HTTPStatusError as e:
        status = "error"
        logger.error(f"OpenRouter error: {e.response.status_code} {e.response.text}")
        raise HTTPException(status_code=502, detail=f"Model provider error: {e.response.status_code}")
    except httpx.RequestError as e:
        status = "error"
        logger.error(f"OpenRouter request failed: {e}")
        raise HTTPException(status_code=502, detail="Failed to reach model provider")

    latency_ms = int((time.time() - start_time) * 1000)
    result = response.json()

    usage = result.get("usage", {})
    input_tokens = usage.get("prompt_tokens", len(user_prompt.split()) * 2)
    output_tokens = usage.get("completion_tokens", 100)
    total_tokens = input_tokens + output_tokens

    cost = estimate_cost(decision.selected_model, input_tokens, output_tokens)

    log_entry = {
        "customer_id": customer_id,
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "prompt_preview": user_prompt[:200],
        "classification": decision.classification,
        "selected_provider": decision.selected_provider,
        "selected_model": decision.selected_model,
        "reason": decision.reason,
        "latency_ms": latency_ms,
        "estimated_cost": cost,
        "tokens_used": total_tokens,
        "input_tokens": input_tokens,
        "output_tokens": output_tokens,
        "ttft_ms": ttft_ms,
        "status": status,
        "candidates_considered": decision.candidates_considered,
        "candidates_eliminated": decision.candidates_eliminated,
    }
    save_request_log(log_entry)

    resp = JSONResponse(content=result)
    routing_meta = {
        **decision.model_dump(),
        "latency_ms": latency_ms,
        "ttft_ms": ttft_ms,
        "classify_ms": classify_ms,
        "cost": cost,
        "input_tokens": input_tokens,
        "output_tokens": output_tokens,
    }
    resp.headers["X-Routing-Decision"] = json.dumps(routing_meta)
    resp.headers["X-Model-Used"] = decision.selected_model
    resp.headers["X-Classification"] = decision.classification
    resp.headers["X-Latency-Ms"] = str(latency_ms)
    resp.headers["X-TTFT-Ms"] = str(ttft_ms)
    resp.headers["X-Classify-Ms"] = str(classify_ms)
    resp.headers["X-Cost"] = str(cost)
    return resp
