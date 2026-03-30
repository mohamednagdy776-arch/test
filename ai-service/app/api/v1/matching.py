from fastapi import APIRouter
from app.models.schemas import MatchRequest, MatchResponse
from app.services.scoring import calculate_compatibility

router = APIRouter(tags=["matching"])


@router.post("/match", response_model=MatchResponse)
def match_users(request: MatchRequest) -> MatchResponse:
    """
    Calculate compatibility score between two users.
    Returns score (0-100) and match reasons.
    Internal scoring weights are NOT exposed in the response.
    """
    return calculate_compatibility(request.user_a, request.user_b)
