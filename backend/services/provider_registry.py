MODEL_CATALOG: dict[str, dict] = {
    "claude-haiku": {
        "provider": "anthropic",
        "openrouter_id": "anthropic/claude-3-5-haiku-20241022",
        "tier": "simple",
        "cost_per_1k_input": 0.0008,
        "cost_per_1k_output": 0.004,
        "avg_latency_ms": 350,
        "regions": ["US", "EU"],
        "max_context": 200000,
        "description": "Fast, affordable model for simple tasks",
    },
    "gpt-4o-mini": {
        "provider": "openai",
        "openrouter_id": "openai/gpt-4o-mini",
        "tier": "simple",
        "cost_per_1k_input": 0.00015,
        "cost_per_1k_output": 0.0006,
        "avg_latency_ms": 400,
        "regions": ["US", "EU"],
        "max_context": 128000,
        "description": "Cost-effective model for basic queries",
    },
    "claude-sonnet": {
        "provider": "anthropic",
        "openrouter_id": "anthropic/claude-sonnet-4",
        "tier": "medium",
        "cost_per_1k_input": 0.003,
        "cost_per_1k_output": 0.015,
        "avg_latency_ms": 900,
        "regions": ["US", "EU"],
        "max_context": 200000,
        "description": "Balanced model for moderate analysis",
    },
    "gpt-4o": {
        "provider": "openai",
        "openrouter_id": "openai/gpt-4o",
        "tier": "medium",
        "cost_per_1k_input": 0.0025,
        "cost_per_1k_output": 0.01,
        "avg_latency_ms": 800,
        "regions": ["US", "EU"],
        "max_context": 128000,
        "description": "Strong general-purpose model",
    },
    "gemini-2.0-flash": {
        "provider": "google",
        "openrouter_id": "google/gemini-2.0-flash-001",
        "tier": "simple",
        "cost_per_1k_input": 0.0001,
        "cost_per_1k_output": 0.0004,
        "avg_latency_ms": 300,
        "regions": ["US", "EU"],
        "max_context": 1000000,
        "description": "Ultra-fast, cheapest option for simple tasks",
    },
    "gemini-2.5-pro": {
        "provider": "google",
        "openrouter_id": "google/gemini-2.5-pro-preview-06-05",
        "tier": "complex",
        "cost_per_1k_input": 0.0025,
        "cost_per_1k_output": 0.015,
        "avg_latency_ms": 1500,
        "regions": ["US", "EU"],
        "max_context": 1000000,
        "description": "Advanced reasoning for complex tasks",
    },
    "deepseek-v3": {
        "provider": "deepseek",
        "openrouter_id": "deepseek/deepseek-chat-v3-0324",
        "tier": "medium",
        "cost_per_1k_input": 0.0003,
        "cost_per_1k_output": 0.0008,
        "avg_latency_ms": 600,
        "regions": ["CN", "US"],
        "max_context": 128000,
        "description": "Cost-effective Chinese provider model",
    },
}


def get_model_info(model_name: str) -> dict | None:
    return MODEL_CATALOG.get(model_name)


def get_openrouter_id(model_name: str) -> str:
    info = MODEL_CATALOG.get(model_name)
    if info:
        return info["openrouter_id"]
    return model_name


def get_models_for_tier(tier: str) -> list[str]:
    return [name for name, info in MODEL_CATALOG.items() if info["tier"] == tier]


def estimate_cost(model_name: str, input_tokens: int, output_tokens: int) -> float:
    info = MODEL_CATALOG.get(model_name)
    if not info:
        return 0.0
    input_cost = (input_tokens / 1000) * info["cost_per_1k_input"]
    output_cost = (output_tokens / 1000) * info["cost_per_1k_output"]
    return round(input_cost + output_cost, 6)


def get_all_providers() -> list[str]:
    return list(set(info["provider"] for info in MODEL_CATALOG.values()))


def get_all_model_names() -> list[str]:
    return list(MODEL_CATALOG.keys())
