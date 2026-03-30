from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.v1 import matching, health
from app.core.config import settings

app = FastAPI(
    title="Tayyibt AI Service",
    version="1.0.0",
    docs_url="/docs" if settings.DEBUG else None,  # hide docs in production
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_methods=["GET", "POST"],
    allow_headers=["*"],
)

app.include_router(health.router)
app.include_router(matching.router, prefix="/api/v1")
