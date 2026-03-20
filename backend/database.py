import sqlite3
import json
from pathlib import Path
from backend.config import DB_PATH
from backend.models import CustomerProfile, RequestLogEntry


def get_connection() -> sqlite3.Connection:
    DB_PATH.parent.mkdir(parents=True, exist_ok=True)
    conn = sqlite3.connect(str(DB_PATH))
    conn.row_factory = sqlite3.Row
    return conn


def init_db():
    conn = get_connection()
    conn.execute("""
        CREATE TABLE IF NOT EXISTS customers (
            customer_id TEXT PRIMARY KEY,
            data TEXT NOT NULL,
            created_at TEXT NOT NULL
        )
    """)
    conn.execute("""
        CREATE TABLE IF NOT EXISTS request_logs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            customer_id TEXT NOT NULL,
            timestamp TEXT NOT NULL,
            prompt_preview TEXT,
            classification TEXT,
            selected_provider TEXT,
            selected_model TEXT,
            reason TEXT,
            latency_ms INTEGER,
            estimated_cost REAL,
            tokens_used INTEGER DEFAULT 0
        )
    """)
    conn.commit()
    conn.close()


def save_customer(profile: CustomerProfile):
    conn = get_connection()
    conn.execute(
        "INSERT OR REPLACE INTO customers (customer_id, data, created_at) VALUES (?, ?, ?)",
        (profile.customer_id, profile.model_dump_json(), profile.created_at),
    )
    conn.commit()
    conn.close()


def get_customer(customer_id: str) -> CustomerProfile | None:
    conn = get_connection()
    row = conn.execute(
        "SELECT data FROM customers WHERE customer_id = ?", (customer_id,)
    ).fetchone()
    conn.close()
    if row is None:
        return None
    return CustomerProfile.model_validate_json(row["data"])


def list_customers() -> list[CustomerProfile]:
    conn = get_connection()
    rows = conn.execute("SELECT data FROM customers ORDER BY created_at DESC").fetchall()
    conn.close()
    return [CustomerProfile.model_validate_json(row["data"]) for row in rows]


def delete_customer(customer_id: str) -> bool:
    conn = get_connection()
    cursor = conn.execute("DELETE FROM customers WHERE customer_id = ?", (customer_id,))
    conn.commit()
    conn.close()
    return cursor.rowcount > 0


def save_request_log(entry: RequestLogEntry):
    conn = get_connection()
    conn.execute(
        """INSERT INTO request_logs
        (customer_id, timestamp, prompt_preview, classification, selected_provider,
         selected_model, reason, latency_ms, estimated_cost, tokens_used)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)""",
        (
            entry.customer_id,
            entry.timestamp,
            entry.prompt_preview,
            entry.classification,
            entry.selected_provider,
            entry.selected_model,
            entry.reason,
            entry.latency_ms,
            entry.estimated_cost,
            entry.tokens_used,
        ),
    )
    conn.commit()
    conn.close()


def get_request_logs(customer_id: str, limit: int = 100) -> list[RequestLogEntry]:
    conn = get_connection()
    rows = conn.execute(
        "SELECT * FROM request_logs WHERE customer_id = ? ORDER BY timestamp DESC LIMIT ?",
        (customer_id, limit),
    ).fetchall()
    conn.close()
    return [RequestLogEntry(**dict(row)) for row in rows]


def get_customer_stats(customer_id: str) -> dict:
    conn = get_connection()
    rows = conn.execute(
        "SELECT * FROM request_logs WHERE customer_id = ?", (customer_id,)
    ).fetchall()
    conn.close()

    if not rows:
        return {
            "total_requests": 0,
            "avg_latency_ms": 0,
            "total_cost": 0,
            "cost_savings_vs_premium": 0,
            "model_distribution": {},
            "requests_by_tier": {},
        }

    total = len(rows)
    total_latency = sum(r["latency_ms"] for r in rows)
    total_cost = sum(r["estimated_cost"] for r in rows)

    # Cost if everything went to the most expensive model
    from backend.services.provider_registry import MODEL_CATALOG
    premium_cost_per_token = max(m["cost_per_1k_input"] for m in MODEL_CATALOG.values()) / 1000
    premium_total = sum(r["tokens_used"] * premium_cost_per_token for r in rows)

    model_dist: dict[str, int] = {}
    tier_dist: dict[str, int] = {}
    for r in rows:
        model = r["selected_model"]
        tier = r["classification"]
        model_dist[model] = model_dist.get(model, 0) + 1
        tier_dist[tier] = tier_dist.get(tier, 0) + 1

    return {
        "total_requests": total,
        "avg_latency_ms": round(total_latency / total, 1),
        "total_cost": round(total_cost, 4),
        "cost_savings_vs_premium": round(premium_total - total_cost, 4),
        "model_distribution": model_dist,
        "requests_by_tier": tier_dist,
    }
