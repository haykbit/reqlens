from pathlib import Path
import os

from fastapi import FastAPI, HTTPException

from .git import GitRepositoryError
from .models import (
    ActionResponse,
    DashboardPayload,
    ReviewActionRequest,
    StartReviewRequest,
    StartReviewResponse,
    SyncReviewRequest,
    WorkspacePayload,
)
from .service import ReviewNotFoundError, ReviewService
from .store import ReviewStore


def default_data_dir() -> Path:
    configured = os.environ.get("REQLENS_DATA_DIR")
    if configured:
        return Path(configured).expanduser().resolve()
    return Path(__file__).resolve().parents[3] / ".reqlens" / "data"


def create_app(data_dir: Path | None = None) -> FastAPI:
    application = FastAPI(
        title="ReqLens API",
        summary="Local evidence API for ReqLens Studio and coding agents",
        version="0.2.0",
    )
    service = ReviewService(ReviewStore(data_dir or default_data_dir()))

    @application.get("/api/health")
    async def health() -> dict[str, str]:
        return {"status": "ok", "version": "0.2.0"}

    @application.get("/api/workspace", response_model=WorkspacePayload)
    async def workspace() -> WorkspacePayload:
        return service.workspace()

    @application.post("/api/reviews/start", response_model=StartReviewResponse)
    async def start_review(request: StartReviewRequest) -> StartReviewResponse:
        try:
            return service.start(request)
        except (GitRepositoryError, FileNotFoundError, NotADirectoryError) as error:
            raise HTTPException(status_code=422, detail=str(error)) from error

    @application.get("/api/reviews/{review_id}", response_model=DashboardPayload)
    async def dashboard(review_id: str) -> DashboardPayload:
        try:
            return service.dashboard(review_id)
        except ReviewNotFoundError as error:
            raise HTTPException(status_code=404, detail="Review not found") from error
        except GitRepositoryError as error:
            raise HTTPException(status_code=422, detail=str(error)) from error

    @application.post("/api/reviews/{review_id}/sync", response_model=DashboardPayload)
    async def sync_review(review_id: str, request: SyncReviewRequest) -> DashboardPayload:
        try:
            return service.sync(review_id, request)
        except ReviewNotFoundError as error:
            raise HTTPException(status_code=404, detail="Review not found") from error
        except GitRepositoryError as error:
            raise HTTPException(status_code=422, detail=str(error)) from error

    @application.post("/api/reviews/{review_id}/actions", response_model=ActionResponse)
    async def review_action(review_id: str, request: ReviewActionRequest) -> ActionResponse:
        try:
            return service.action(review_id, request.action)
        except ReviewNotFoundError as error:
            raise HTTPException(status_code=404, detail="Review not found") from error
        except GitRepositoryError as error:
            raise HTTPException(status_code=422, detail=str(error)) from error

    return application


app = create_app()
