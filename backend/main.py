import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from backend.database import init_db
from backend.services.classifier import load_classifier, is_model_loaded
from backend.routers import customers, extraction, proxy, logs

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Starting ModelGate...")
    init_db()
    logger.info("Database initialized")
    load_classifier()
    yield
    logger.info("ModelGate shutting down")


app = FastAPI(
    title="ModelGate",
    description="Contract-Aware AI Control Plane",
    version="0.1.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=[
        "X-Routing-Decision",
        "X-Model-Used",
        "X-Classification",
        "X-Latency-Ms",
    ],
)

app.include_router(customers.router)
app.include_router(extraction.router)
app.include_router(proxy.router)
app.include_router(logs.router)


@app.get("/health")
def health():
    return {
        "status": "ok",
        "classifier_loaded": is_model_loaded(),
        "service": "ModelGate",
    }
