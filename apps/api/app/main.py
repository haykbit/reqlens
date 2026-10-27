from uuid import uuid4

from fastapi import FastAPI

from .fixtures import copy, dashboard_fixture
from .models import ActionRequest, ActionResponse, DashboardPayload

app = FastAPI(
    title="ReqLens API",
    summary="Local evidence API for ReqLens Studio",
    version="0.1.0",
)


@app.get("/api/health")
async def health() -> dict[str, str]:
    return {"status": "ok"}


@app.get("/api/dashboard", response_model=DashboardPayload)
async def dashboard() -> DashboardPayload:
    return dashboard_fixture()


@app.post("/api/actions", response_model=ActionResponse)
async def create_action(request: ActionRequest) -> ActionResponse:
    messages = {
        "run_acceptance": copy(
            "Acceptance run queued for the selected revision.",
            "Ejecución de aceptación en cola para la revisión seleccionada.",
        ),
        "open_preview": copy(
            "Local preview preparation started.",
            "Preparación de la preview local iniciada.",
        ),
        "request_changes": copy(
            "Change request recorded with the current evidence snapshot.",
            "Solicitud de cambios registrada con el snapshot de evidencias actual.",
        ),
    }
    return ActionResponse(
        action_id=str(uuid4()),
        state="accepted",
        message=messages[request.action],
    )

