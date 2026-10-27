from enum import StrEnum
from typing import Literal

from pydantic import BaseModel, ConfigDict


class ApiModel(BaseModel):
    model_config = ConfigDict(extra="forbid")


class LocalizedText(ApiModel):
    en: str
    es: str


class EvidenceState(StrEnum):
    VERIFIED = "verified"
    NEEDS_EVIDENCE = "needs_evidence"
    IN_REVIEW = "in_review"
    PENDING = "pending"
    FAILED = "failed"


class ProjectContext(ApiModel):
    repository: str
    branch: str
    worktree: str
    base_revision: str
    head_revision: str
    pull_request: int


class ProductNode(ApiModel):
    kind: Literal["feature", "requirement", "ticket", "revision"]
    eyebrow: LocalizedText
    title: LocalizedText
    reference: str
    state: EvidenceState


class AcceptanceCriterion(ApiModel):
    id: str
    title: LocalizedText
    detail: LocalizedText
    state: EvidenceState
    implementation: list[str]
    test_count: int
    evidence_label: LocalizedText


class ChangeSummary(ApiModel):
    path: str
    additions: int
    deletions: int
    category: Literal["implementation", "test", "migration", "configuration"]
    requirements: list[str]
    summary: LocalizedText
    rationale: LocalizedText


class TestResult(ApiModel):
    id: str
    name: LocalizedText
    command: str
    kind: Literal["unit", "integration", "api", "database", "e2e"]
    state: EvidenceState
    duration_ms: int | None
    assertions: int
    requirement_ids: list[str]
    detail: LocalizedText


class ReplayStep(ApiModel):
    id: str
    order: int
    title: LocalizedText
    expectation: LocalizedText
    state: EvidenceState
    timestamp_seconds: int
    requirement_ids: list[str]


class Finding(ApiModel):
    id: str
    severity: Literal["required", "recommended", "optional"]
    category: Literal["coverage", "scope", "correctness", "verification", "maintainability"]
    title: LocalizedText
    detail: LocalizedText
    requirement_ids: list[str]
    evidence: list[str]
    action: LocalizedText


class ActivityEvent(ApiModel):
    id: str
    time: str
    actor: LocalizedText
    title: LocalizedText
    detail: LocalizedText
    kind: Literal["product", "agent", "git", "test", "review"]


class DashboardSummary(ApiModel):
    acceptance_verified: int
    acceptance_total: int
    checks_passed: int
    checks_total: int
    additions: int
    deletions: int
    findings_open: int
    replay_state: EvidenceState


class DashboardPayload(ApiModel):
    project: ProjectContext
    title: LocalizedText
    description: LocalizedText
    status: EvidenceState
    chain: list[ProductNode]
    criteria: list[AcceptanceCriterion]
    changes: list[ChangeSummary]
    tests: list[TestResult]
    replay_steps: list[ReplayStep]
    findings: list[Finding]
    activity: list[ActivityEvent]
    summary: DashboardSummary


class ActionRequest(ApiModel):
    action: Literal["run_acceptance", "open_preview", "request_changes"]
    revision: str


class ActionResponse(ApiModel):
    action_id: str
    state: Literal["accepted"]
    message: LocalizedText

