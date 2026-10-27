# Initial domain model

This document proposes a deliberately small vocabulary for the first ReqLens prototype. It is a product model, not yet a persistence schema.

## Core entities

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

A bounded implementation task derived from one or more acceptance criteria. It can later reference an external GitHub or Linear issue, but does not require an issue tracker in the MVP.

### Agent run

One recorded execution session in which a coding agent works on a work item. It identifies the agent, model when available, repository state, start and end time, and ordered events.

### Decision

A choice declared during an agent run, including the alternatives or constraints available at that moment. Decisions captured directly from the run must remain distinguishable from explanations inferred later.

### Change

A modification to an implementation artifact. The first version may store Git hunks and file paths; symbol- or line-level mappings can be derived later.

### Verification

A reproducible check and its result, such as a test command, type check, linter, build, or security scanner.

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
Requirement
  └─ contains -> Acceptance criterion
        └─ scoped by -> Work item
              └─ attempted in -> Agent run
                    ├─ emits -> Decision
                    ├─ produces -> Change
                    └─ executes -> Verification

Acceptance criterion
  ├─ supported by -> Evidence link -> Change / Verification / Decision
  ├─ assessed by -> Evaluation
  └─ resolved by -> Review decision
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

