import threading
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.v1 import matching, health, bio, icebreaker, moderate, profile_tips, child_prediction
from app.core.config import settings
from app.services import llm
from app.services.child_generate import warm_up as warm_up_child_prediction


@asynccontextmanager
async def lifespan(app: FastAPI):
    ready = llm.is_ready()
    status = f"ready (model: {settings.OLLAMA_MODEL})" if ready else "not ready — will retry per request"
    print(f"[startup] Ollama LLM: {status}")
    # Runs in the background so it never delays the health endpoint coming up;
    # loads the child-prediction vision model + diffusers pipeline into memory
    # ahead of the first real request instead of paying that cost inline (#387).
    threading.Thread(target=warm_up_child_prediction, daemon=True).start()
    yield


app = FastAPI(
    title="Tayyibt AI Service",
    version="2.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_methods=["GET", "POST"],
    allow_headers=["*"],
)

app.include_router(health.router)
app.include_router(matching.router,         prefix="/api/v1")
app.include_router(bio.router,              prefix="/api/v1")
app.include_router(icebreaker.router,       prefix="/api/v1")
app.include_router(moderate.router,         prefix="/api/v1")
app.include_router(profile_tips.router,     prefix="/api/v1")
app.include_router(child_prediction.router, prefix="/api/v1")