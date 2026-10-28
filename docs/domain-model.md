# Initial domain model

This document defines the product vocabulary. Some entities are implemented in the current vertical slice and others describe the intended model; it is not a persistence schema.

## Core entities

### Project

An application repository registered with ReqLens. ReqLens is installed separately and can track multiple projects without copying its source or dependencies into them.

### Review

The revision-bound workspace for one ticket in one project. It records the base revision, normalized ticket, reported evidence, current Git snapshot, activity, and human decision.

### Feature

A coherent product capability that groups requirements and work items. A feature can carry labels, dependencies, and an overall review state without replacing the more precise status of its acceptance criteria.

### Requirement

A product behavior, constraint, or outcome that the implementation is expected to satisfy.

Key fields:

- Stable ID
- Original text
- Source document and location
- Status

### Acceptance criterion

An observable condition used to decide whether a requirement has been satisfied. A requirement contains one or more acceptance criteria.

### Work item

A bounded implementation task derived from one or more acceptance criteria. It can reference Linear, Jira, Asana, GitHub, or a request supplied directly in conversation.

### Work context

The explicit connection between a work item and a Git repository, worktree, branch, base revision, and active implementation session. It defines the point from which changes and evidence are calculated.

### Agent run

One recorded execution session in which a coding agent works on a work item. It identifies the agent, model when available, repository state, start and end time, and ordered events.

### Decision

A choice declared during an agent run, including the alternatives or constraints available at that moment. Decisions captured directly from the run must remain distinguishable from explanations inferred later.

### Change

A modification to an implementation artifact. The first version may store Git hunks and file paths; symbol- or line-level mappings can be derived later.

### Verification

A reproducible check and its result, such as a test command, type check, linter, build, or security scanner.

### Test plan

A required or proposed verification attached to an acceptance criterion. It describes the kind of test, approved execution profile, expected outcome, and safety constraints without storing secret values.

### Test run

One execution of a test plan against a specific Git revision. It records timestamps, command identity, exit state, selected output, and generated artifacts.

### Acceptance scenario

An approved sequence of product actions, expected visible outcomes, and deterministic assertions derived from one or more acceptance criteria.

### Visual run

One execution of an acceptance scenario in a configured browser or simulator against a specific Git revision. It records step timing, environment identity, status, and evidence artifacts.

### Evidence artifact

A revision-bound output such as a video, screenshot, log, report, or test result. Artifacts record their source, retention policy, redaction state, and whether they remain local or were explicitly published.

### Preview profile

A repository-owned definition for preparing dependencies, starting an application, checking readiness, allocating ports, referencing environment configuration, and cleaning up a preview safely.

### Preview instance

One isolated execution of a preview profile against an exact pull-request revision. It identifies the disposable worktree, services, allocated URLs, lifecycle state, logs, approvals, and retention policy.

### Evaluation

A judgment against a requirement or acceptance criterion. Evaluations may be deterministic, model-based, or human-authored and must declare which kind they are.

### Evidence link

An explicit relationship between a claim and the artifact or event that supports it.

Every evidence link has provenance:

- `observed` — captured directly from an event or tool result;
- `declared` — stated by the agent or user during the run;
- `inferred` — proposed later by an evaluator;
- `confirmed` — reviewed and accepted by a human.

### Review decision

The human outcome for a requirement or work item: accepted, rejected, or changes requested, together with an optional explanation.

## Relationships

```text
Project
  └─ contains -> Feature
        └─ contains -> Requirement
              └─ contains -> Acceptance criterion
                    └─ scoped by -> Work item
                          └─ activated in -> Work context
                                └─ attempted in -> Agent run
                                      ├─ emits -> Decision
                                      ├─ produces -> Change
                                      └─ executes -> Test run / Verification

Acceptance criterion
  ├─ supported by -> Evidence link -> Change / Verification / Decision
  ├─ requires -> Test plan
  ├─ demonstrated by -> Acceptance scenario -> Visual run
  ├─ assessed by -> Evaluation
  └─ resolved by -> Review decision

Pull-request revision
  └─ executed as -> Preview instance
        ├─ configured by -> Preview profile
        ├─ exercised by -> Test run
        └─ recorded by -> Visual run
```

## Coverage states

Coverage should not be a single opaque percentage. The initial states are:

- `missing` — no implementation evidence is linked;
- `implemented` — implementation evidence exists but has not been verified;
- `partial` — some expected behavior or verification is absent;
- `verified` — the configured evidence conditions pass;
- `failed` — verification contradicts the criterion;
- `needs_review` — evidence is ambiguous or relies on an unconfirmed inference;
- `accepted` — a human has approved the result.

These states describe evidence, not absolute correctness.

