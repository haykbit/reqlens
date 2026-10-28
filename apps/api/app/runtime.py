from pathlib import Path
import os
import sys

from fastapi import FastAPI, HTTPException
from fastapi.staticfiles import StaticFiles

from . import __version__
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
    legacy = Path(__file__).resolve().parents[3] / ".reqlens" / "data"
    if (legacy / "reqlens.db").is_file():
        return legacy
    if sys.platform == "darwin":
        return Path.home() / "Library" / "Application Support" / "ReqLens"
    if os.name == "nt":
        return Path(os.environ.get("LOCALAPPDATA", Path.home())) / "ReqLens"
    return Path(os.environ.get("XDG_DATA_HOME", Path.home() / ".local" / "share")) / "reqlens"


def default_web_dir() -> Path:
    configured = os.environ.get("REQLENS_WEB_DIR")
    if configured:
        return Path(configured).expanduser().resolve()
    return Path(__file__).resolve().parents[3] / "apps" / "web" / "dist"


def create_app(data_dir: Path | None = None, web_dir: Path | None = None) -> FastAPI:
    application = FastAPI(
        title="ReqLens API",
        summary="Local evidence API for ReqLens Studio and coding agents",
        version=__version__,
    )
    service = ReviewService(ReviewStore(data_dir or default_data_dir()))

    @application.get("/api/health")
    async def health() -> dict[str, str]:
        return {"status": "ok", "version": __version__}

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
            return service.action(review_id, request.action, request.note)
        except ReviewNotFoundError as error:
            raise HTTPException(status_code=404, detail="Review not found") from error
        except GitRepositoryError as error:
            raise HTTPException(status_code=422, detail=str(error)) from error

    studio = web_dir or default_web_dir()
    if studio.is_dir():
        application.mount("/", StaticFiles(directory=studio, html=True), name="studio")

    return application
