"""Child prediction endpoint — zero storage, in-memory face blend."""
from __future__ import annotations
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from app.services.child_generate import predict_child

router = APIRouter(tags=["child-prediction"])


class ChildPredictionRequest(BaseModel):
    parent1: str
    parent2: str


class ChildPredictionResponse(BaseModel):
    image: str
    format: str


@router.post("/child-prediction", response_model=ChildPredictionResponse)
def child_prediction(body: ChildPredictionRequest):
    try:
        img = predict_child(body.parent1, body.parent2)
    except ValueError as exc:
        raise HTTPException(status_code=422, detail=str(exc))
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Prediction failed: {exc}")
    return ChildPredictionResponse(image=img, format="jpeg")