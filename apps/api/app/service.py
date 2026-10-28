from collections.abc import Callable
from datetime import UTC, datetime
from hashlib import sha256
from typing import Literal, TypeVar
from uuid import uuid4

from .git import GitFileChange, GitRepositoryError, GitSnapshot, inspect_repository, resolve_revision
from .models import (
    AcceptanceCriterion,
    ActionResponse,
    ActivityEvent,
    AgentEventInput,
    ChangeAnnotationInput,
    ChangeSummary,
    CriterionEvidenceInput,
    DashboardPayload,
    DashboardSummary,
    EvidenceState,
    Finding,
    LocalizedText,
    ProductNode,
    ProjectContext,
    ReplayStep,
    ReviewDecision,
    ReviewListItem,
    ReviewRecord,
    StartReviewRequest,
    StartReviewResponse,
    StoredEvent,
    SyncReviewRequest,
    TestEvidenceInput,
    TestResult,
    WorkspacePayload,
)
from .store import ReviewStore


class ReviewNotFoundError(LookupError):
    pass


T = TypeVar("T")


def text(value: str) -> LocalizedText:
    return LocalizedText(en=value, es=value)


def translated(en: str, es: str) -> LocalizedText:
    return LocalizedText(en=en, es=es)


def now_iso() -> str:
    return datetime.now(UTC).isoformat()


def merge_by(current: list[T], incoming: list[T], key: Callable[[T], str]) -> list[T]:
    values = {key(item): item for item in current}
    values.update({key(item): item for item in incoming})
    return list(values.values())


class ReviewService:
    def __init__(self, store: ReviewStore) -> None:
        self.store = store

    def start(self, request: StartReviewRequest) -> StartReviewResponse:
        snapshot = inspect_repository(request.project_path)
        project_path = str(snapshot.root)
        existing = self.store.find(project_path, request.ticket.reference)
        timestamp = now_iso()
        if existing:
            if existing.ticket != request.ticket:
                existing.ticket = request.ticket
                existing.decision = ReviewDecision.IN_REVIEW
                existing.decision_note = None
                existing.accepted_revision = None
                existing.updated_at = timestamp
                existing.events.append(
                    self._event(
                        AgentEventInput(
                            actor="Codex",
                            title="Ticket context refreshed",
                            detail=f"{request.ticket.source} · {request.ticket.reference}",
                            kind="product",
                        )
                    )
                )
                self.store.save(existing)
            return StartReviewResponse(
                review_id=existing.id,
                created=False,
                dashboard=self.dashboard(existing.id),
            )

        base_revision = resolve_revision(snapshot.root, request.base_revision or "HEAD")
        project_id = sha256(project_path.encode()).hexdigest()[:12]
        record = ReviewRecord(
            id=str(uuid4()),
            project_id=project_id,
            project_path=project_path,
            base_revision=base_revision,
            ticket=request.ticket,
            created_at=timestamp,
            updated_at=timestamp,
            events=[
                self._event(
                    AgentEventInput(
                        actor="Codex",
                        title="Review started",
                        detail=f"Tracking {request.ticket.source} ticket {request.ticket.reference} from {base_revision}",
                        kind="product",
                    ),
                    timestamp,
                )
            ],
        )
        self.store.save(record)
        return StartReviewResponse(
            review_id=record.id,
            created=True,
            dashboard=self.dashboard(record.id),
        )

    def sync(self, review_id: str, request: SyncReviewRequest) -> DashboardPayload:
        record = self._record(review_id)
        evidence_changed = any(
            value is not None
            for value in (request.criteria, request.changes, request.tests, request.findings, request.replay_steps)
        )
        if evidence_changed:
            record.decision = ReviewDecision.IN_REVIEW
            record.decision_note = None
            record.accepted_revision = None
        if request.criteria is not None:
            record.criteria = merge_by(record.criteria, request.criteria, lambda item: item.criterion_id)
        if request.changes is not None:
            record.changes = merge_by(record.changes, request.changes, lambda item: item.path)
        if request.tests is not None:
            record.tests = merge_by(record.tests, request.tests, lambda item: item.id)
        if request.findings is not None:
            record.findings = request.findings
        if request.replay_steps is not None:
            record.replay_steps = sorted(request.replay_steps, key=lambda item: item.order)
        if request.preview_url is not None:
            record.preview_url = request.preview_url
        if request.pull_request is not None:
            record.pull_request = request.pull_request
        record.events.extend(self._event(event) for event in request.events)
        snapshot = inspect_repository(record.project_path, record.base_revision)
        record.events.append(
            self._event(
                AgentEventInput(
                    actor="ReqLens",
                    title="Repository synchronized",
                    detail=f"{len(snapshot.changes)} changed files at {snapshot.head_revision}",
                    kind="git",
                )
            )
        )
        record.updated_at = now_iso()
        self.store.save(record)
        return self._dashboard(record, snapshot)

    def dashboard(self, review_id: str) -> DashboardPayload:
        record = self._record(review_id)
        snapshot = inspect_repository(record.project_path, record.base_revision)
        return self._dashboard(record, snapshot)

    def workspace(self) -> WorkspacePayload:
        items: list[ReviewListItem] = []
        for record in self.store.list():
            try:
                dashboard = self.dashboard(record.id)
            except (GitRepositoryError, OSError):
                continue
            items.append(
                ReviewListItem(
                    id=record.id,
                    project_id=record.project_id,
                    repository=dashboard.project.repository,
                    repository_path=record.project_path,
                    ticket_reference=record.ticket.reference,
                    ticket_source=record.ticket.source,
                    title=record.ticket.title,
                    branch=dashboard.project.branch,
                    status=dashboard.status,
                    decision=dashboard.project.decision,
                    updated_at=record.updated_at,
                )
            )
        return WorkspacePayload(
            reviews=items,
            selected_review_id=items[0].id if items else None,
        )

    def action(
        self,
        review_id: str,
        action: Literal["sync_repository", "open_preview", "accept_review", "request_changes"],
        note: str | None = None,
    ) -> ActionResponse:
        record = self._record(review_id)
        if action == "accept_review":
            snapshot = inspect_repository(record.project_path, record.base_revision)
            dashboard = self._dashboard(record, snapshot)
            if snapshot.dirty:
                return self._blocked(
                    "Commit or discard working-tree changes before accepting this review.",
                    "Haz commit o descarta los cambios del working tree antes de aceptar la revisión.",
                )
            if dashboard.status != EvidenceState.VERIFIED:
                return self._blocked(
                    "The evidence is not complete enough to accept this review.",
                    "Las evidencias todavía no están completas para aceptar la revisión.",
                )
            record.decision = ReviewDecision.ACCEPTED
            record.decision_note = note
            record.accepted_revision = snapshot.head_revision
            self._record_decision(record, "Review accepted", note or f"Accepted at {snapshot.head_revision}")
            return ActionResponse(
                action_id=str(uuid4()),
                state="accepted",
                message=translated(
                    "Review accepted at the current Git revision.",
                    "Revisión aceptada en la revisión Git actual.",
                ),
            )
        if action == "request_changes":
            if not note or not note.strip():
                return self._blocked(
                    "Describe what needs to change before sending the request.",
                    "Describe qué debe cambiar antes de enviar la solicitud.",
                )
            record.decision = ReviewDecision.CHANGES_REQUESTED
            record.decision_note = note.strip()
            record.accepted_revision = None
            self._record_decision(record, "Changes requested", note.strip())
            return ActionResponse(
                action_id=str(uuid4()),
                state="accepted",
                message=translated(
                    "Change request recorded in the review timeline.",
                    "Solicitud de cambios registrada en el timeline.",
                ),
            )
        if action == "open_preview":
            if not record.preview_url:
                return self._blocked(
                    "No preview URL has been reported by the agent.",
                    "El agente todavía no ha reportado una URL de preview.",
                )
            return ActionResponse(
                action_id=str(uuid4()),
                state="accepted",
                target_url=record.preview_url,
                message=translated("Preview is ready.", "La preview está lista."),
            )
        self.sync(review_id, SyncReviewRequest())
        return ActionResponse(
            action_id=str(uuid4()),
            state="accepted",
            message=translated(
                "Git metadata and changes synchronized.",
                "Metadatos y cambios Git sincronizados.",
            ),
        )

    def _record_decision(self, record: ReviewRecord, title: str, detail: str) -> None:
        record.events.append(
            self._event(
                AgentEventInput(
                    actor="Reviewer",
                    title=title,
                    detail=detail,
                    kind="review",
                )
            )
        )
        record.updated_at = now_iso()
        self.store.save(record)

    @staticmethod
    def _blocked(en: str, es: str) -> ActionResponse:
        return ActionResponse(
            action_id=str(uuid4()),
            state="blocked",
            message=translated(en, es),
        )

    def _dashboard(self, record: ReviewRecord, snapshot: GitSnapshot) -> DashboardPayload:
        evidence_by_id = {item.criterion_id: item for item in record.criteria}
        tests = [self._test(item) for item in record.tests]
        criteria: list[AcceptanceCriterion] = []
        for item in record.ticket.acceptance_criteria:
            evidence = evidence_by_id.get(item.id)
            criteria.append(
                AcceptanceCriterion(
                    id=item.id,
                    title=text(item.title),
                    detail=text(item.detail),
                    state=evidence.state if evidence else EvidenceState.PENDING,
                    implementation=evidence.implementation if evidence else [],
                    test_count=sum(item.id in test.requirement_ids for test in tests),
                    evidence_label=(
                        text(evidence.evidence_label)
                        if evidence
                        else translated("No evidence reported", "Sin evidencias reportadas")
                    ),
                )
            )
        annotations = {item.path: item for item in record.changes}
        changes = [self._change(item, annotations.get(item.path)) for item in snapshot.changes]
        findings = [
            Finding(
                id=item.id,
                severity=item.severity,
                category=item.category,
                title=text(item.title),
                detail=text(item.detail),
                requirement_ids=item.requirement_ids,
                evidence=item.evidence,
                action=text(item.action),
            )
            for item in record.findings
        ]
        replay_steps = [
            ReplayStep(
                id=item.id,
                order=item.order,
                title=text(item.title),
                expectation=text(item.expectation),
                state=item.state,
                timestamp_seconds=item.timestamp_seconds,
                requirement_ids=item.requirement_ids,
            )
            for item in record.replay_steps
        ]
        status = self._status(criteria, tests, findings)
        verified_tests = sum(test.state == EvidenceState.VERIFIED for test in tests)
        return DashboardPayload(
            project=ProjectContext(
                project_id=record.project_id,
                review_id=record.id,
                repository_path=record.project_path,
                repository=snapshot.repository,
                branch=snapshot.branch,
                worktree=str(snapshot.root),
                base_revision=record.base_revision,
                head_revision=snapshot.head_revision,
                pull_request=record.pull_request,
                ticket_reference=record.ticket.reference,
                ticket_source=record.ticket.source,
                ticket_url=record.ticket.url,
                preview_url=record.preview_url,
                decision=self._decision(record, snapshot),
                decision_note=record.decision_note,
                accepted_revision=record.accepted_revision,
                dirty=snapshot.dirty,
                updated_at=record.updated_at,
            ),
            title=text(record.ticket.title),
            description=text(record.ticket.description),
            status=status,
            chain=self._chain(record, snapshot, status),
            criteria=criteria,
            changes=changes,
            tests=tests,
            replay_steps=replay_steps,
            findings=findings,
            activity=[self._activity(item) for item in reversed(record.events)],
            summary=DashboardSummary(
                acceptance_verified=sum(item.state == EvidenceState.VERIFIED for item in criteria),
                acceptance_total=len(criteria),
                checks_passed=verified_tests,
                checks_total=len(tests),
                additions=sum(item.additions for item in changes),
                deletions=sum(item.deletions for item in changes),
                findings_open=len(findings),
                replay_state=self._replay_state(replay_steps),
            ),
        )

    def _chain(
        self,
        record: ReviewRecord,
        snapshot: GitSnapshot,
        status: EvidenceState,
    ) -> list[ProductNode]:
        ticket = record.ticket
        feature = ticket.feature or ticket.title
        requirement = ticket.requirement or ticket.title
        return [
            ProductNode(
                kind="feature",
                eyebrow=translated("Feature", "Feature"),
                title=text(feature),
                reference=ticket.feature_reference or "—",
                state=status,
            ),
            ProductNode(
                kind="requirement",
                eyebrow=translated("Product requirement", "Requerimiento de producto"),
                title=text(requirement),
                reference=ticket.requirement_id or "—",
                state=status,
            ),
            ProductNode(
                kind="ticket",
                eyebrow=translated("Implementation ticket", "Ticket de implementación"),
                title=text(ticket.title),
                reference=ticket.reference,
                state=status,
            ),
            ProductNode(
                kind="revision",
                eyebrow=translated("Git revision", "Revisión Git"),
                title=text(snapshot.branch),
                reference=snapshot.head_revision,
                state=status,
            ),
        ]

    @staticmethod
    def _change(change: GitFileChange, annotation: ChangeAnnotationInput | None) -> ChangeSummary:
        return ChangeSummary(
            path=change.path,
            additions=change.additions,
            deletions=change.deletions,
            category=change.category,
            requirements=annotation.requirement_ids if annotation else [],
            summary=(
                text(annotation.summary)
                if annotation
                else translated("Changed in this review", "Modificado en esta revisión")
            ),
            rationale=(
                text(annotation.rationale)
                if annotation
                else translated("Rationale not reported yet", "Justificación todavía no reportada")
            ),
            diff=change.diff,
        )

    @staticmethod
    def _test(item: TestEvidenceInput) -> TestResult:
        return TestResult(
            id=item.id,
            name=text(item.name),
            command=item.command,
            kind=item.kind,
            state=item.state,
            duration_ms=item.duration_ms,
            assertions=item.assertions,
            requirement_ids=item.requirement_ids,
            detail=text(item.detail),
        )

    @staticmethod
    def _activity(item: StoredEvent) -> ActivityEvent:
        timestamp = datetime.fromisoformat(item.timestamp)
        return ActivityEvent(
            id=item.id,
            time=timestamp.strftime("%H:%M"),
            actor=text(item.actor),
            title=text(item.title),
            detail=text(item.detail),
            kind=item.kind,
        )

    @staticmethod
    def _event(item: AgentEventInput, timestamp: str | None = None) -> StoredEvent:
        return StoredEvent(
            id=str(uuid4()),
            timestamp=timestamp or now_iso(),
            actor=item.actor,
            title=item.title,
            detail=item.detail,
            kind=item.kind,
        )

    def _record(self, review_id: str) -> ReviewRecord:
        record = self.store.get(review_id)
        if not record:
            raise ReviewNotFoundError(review_id)
        return record

    @staticmethod
    def _status(
        criteria: list[AcceptanceCriterion],
        tests: list[TestResult],
        findings: list[Finding],
    ) -> EvidenceState:
        if not criteria:
            return EvidenceState.IN_REVIEW
        if any(item.state == EvidenceState.FAILED for item in criteria) or any(
            item.state == EvidenceState.FAILED for item in tests
        ):
            return EvidenceState.FAILED
        if any(item.severity == "required" for item in findings):
            return EvidenceState.NEEDS_EVIDENCE
        if not all(item.state == EvidenceState.VERIFIED for item in criteria):
            return (
                EvidenceState.NEEDS_EVIDENCE
                if any(item.state == EvidenceState.NEEDS_EVIDENCE for item in criteria)
                else EvidenceState.IN_REVIEW
            )
        if not tests or not all(item.state == EvidenceState.VERIFIED for item in tests):
            return EvidenceState.NEEDS_EVIDENCE
        return EvidenceState.VERIFIED

    @staticmethod
    def _decision(record: ReviewRecord, snapshot: GitSnapshot) -> ReviewDecision:
        if record.decision == ReviewDecision.ACCEPTED and (
            record.accepted_revision != snapshot.head_revision or snapshot.dirty
        ):
            return ReviewDecision.STALE
        return record.decision

    @staticmethod
    def _replay_state(steps: list[ReplayStep]) -> EvidenceState:
        if not steps:
            return EvidenceState.PENDING
        if all(item.state == EvidenceState.VERIFIED for item in steps):
            return EvidenceState.VERIFIED
        return EvidenceState.NEEDS_EVIDENCE
