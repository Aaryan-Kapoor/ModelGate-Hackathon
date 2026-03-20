from fastapi import APIRouter, HTTPException
from backend.database import get_request_logs, get_customer_stats, get_customer, get_global_stats

router = APIRouter(tags=["logs"])


@router.get("/logs/{customer_id}")
def get_logs(customer_id: str, limit: int = 100):
    if not get_customer(customer_id):
        raise HTTPException(status_code=404, detail="Customer not found")
    return get_request_logs(customer_id, limit)


@router.get("/logs")
def get_all_logs(limit: int = 100):
    return get_request_logs(None, limit)


@router.get("/stats/{customer_id}")
def get_stats(customer_id: str):
    if not get_customer(customer_id):
        raise HTTPException(status_code=404, detail="Customer not found")
    return get_customer_stats(customer_id)


@router.get("/stats")
def get_overview_stats():
    return get_global_stats()
