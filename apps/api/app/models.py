from enum import StrEnum
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field


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


class ReviewDecision(StrEnum):
    IN_REVIEW = "in_review"
    ACCEPTED = "accepted"
    CHANGES_REQUESTED = "changes_requested"
    STALE = "stale"


class TicketCriterionInput(ApiModel):
    id: str
    title: str
    detail: str = ""


class TicketInput(ApiModel):
    source: Literal["linear", "jira", "asana", "github", "manual"]
    reference: str
    url: str | None = None
    title: str
    description: str = ""
    feature: str | None = None
    feature_reference: str | None = None
    requirement: str | None = None
    requirement_id: str | None = None
    acceptance_criteria: list[TicketCriterionInput] = Field(default_factory=list)


class StartReviewRequest(ApiModel):
    project_path: str
    ticket: TicketInput
    base_revision: str | None = None


class CriterionEvidenceInput(ApiModel):
    criterion_id: str
    state: EvidenceState
    implementation: list[str] = Field(default_factory=list)
    evidence_label: str


class ChangeAnnotationInput(ApiModel):
    path: str
    requirement_ids: list[str] = Field(default_factory=list)
    summary: str
    rationale: str


class TestEvidenceInput(ApiModel):
    id: str
    name: str
    command: str
    kind: Literal["unit", "integration", "api", "database", "e2e", "lint", "typecheck"]
    state: EvidenceState
    duration_ms: int | None = None
    assertions: int = 0
    requirement_ids: list[str] = Field(default_factory=list)
    detail: str = ""


class FindingInput(ApiModel):
    id: str
    severity: Literal["required", "recommended", "optional"]
    category: Literal["coverage", "scope", "correctness", "verification", "maintainability"]
    title: str
    detail: str
    requirement_ids: list[str] = Field(default_factory=list)
    evidence: list[str] = Field(default_factory=list)
    action: str


class ReplayStepInput(ApiModel):
    id: str
    order: int
    title: str
    expectation: str
    state: EvidenceState
    timestamp_seconds: int
    requirement_ids: list[str] = Field(default_factory=list)


class AgentEventInput(ApiModel):
    actor: str = "Codex"
    title: str
    detail: str = ""
    kind: Literal["product", "agent", "git", "test", "review"] = "agent"


class SyncReviewRequest(ApiModel):
    criteria: list[CriterionEvidenceInput] | None = None
    changes: list[ChangeAnnotationInput] | None = None
    tests: list[TestEvidenceInput] | None = None
    findings: list[FindingInput] | None = None
    replay_steps: list[ReplayStepInput] | None = None
    events: list[AgentEventInput] = Field(default_factory=list)
    preview_url: str | None = None
    pull_request: int | None = None


class StoredEvent(ApiModel):
    id: str
    timestamp: str
    actor: str
    title: str
    detail: str
    kind: Literal["product", "agent", "git", "test", "review"]


class ReviewRecord(ApiModel):
    id: str
    project_id: str
    project_path: str
    base_revision: str
    ticket: TicketInput
    criteria: list[CriterionEvidenceInput] = Field(default_factory=list)
    changes: list[ChangeAnnotationInput] = Field(default_factory=list)
    tests: list[TestEvidenceInput] = Field(default_factory=list)
    findings: list[FindingInput] = Field(default_factory=list)
    replay_steps: list[ReplayStepInput] = Field(default_factory=list)
    events: list[StoredEvent] = Field(default_factory=list)
    preview_url: str | None = None
    pull_request: int | None = None
    decision: ReviewDecision = ReviewDecision.IN_REVIEW
    decision_note: str | None = None
    accepted_revision: str | None = None
    created_at: str
    updated_at: str


class ProjectContext(ApiModel):
    project_id: str
    review_id: str
    repository_path: str
    repository: str
    branch: str
    worktree: str
    base_revision: str
    head_revision: str
    pull_request: int | None
    ticket_reference: str
    ticket_source: str
    ticket_url: str | None
    preview_url: str | None
    decision: ReviewDecision
    decision_note: str | None
    accepted_revision: str | None
    dirty: bool
    updated_at: str


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
    diff: str


class TestResult(ApiModel):
    id: str
    name: LocalizedText
    command: str
    kind: Literal["unit", "integration", "api", "database", "e2e", "lint", "typecheck"]
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


class ReviewListItem(ApiModel):
    id: str
    project_id: str
    repository: str
    repository_path: str
    ticket_reference: str
    ticket_source: str
    title: str
    branch: str
    status: EvidenceState
    decision: ReviewDecision
    updated_at: str


class WorkspacePayload(ApiModel):
    reviews: list[ReviewListItem]
    selected_review_id: str | None


class StartReviewResponse(ApiModel):
    review_id: str
    created: bool
    dashboard: DashboardPayload


class ReviewActionRequest(ApiModel):
    action: Literal["sync_repository", "open_preview", "accept_review", "request_changes"]
    note: str | None = Field(default=None, max_length=2000)


class ActionResponse(ApiModel):
    action_id: str
    state: Literal["accepted", "blocked"]
    message: LocalizedText
    target_url: str | None = None
