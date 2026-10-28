# Product definition

## Product statement

ReqLens helps product and engineering determine whether a ticket delivered its source product requirement. It connects requirements and acceptance criteria to code, deterministic checks, observed product evidence, findings, and an explicit human decision.

ReqLens is an evidence-based acceptance product, not primarily a code-review product. Technical analysis belongs in the product when it changes confidence in requirement coverage, scope, correctness, risk, maintainability, or architecture fit.

## Initial user

The first user is an individual product engineer or technically minded product owner who:

- starts work from a written requirement or ticket;
- delegates implementation to a coding agent;
- can inspect a diff but cannot confidently reconstruct the whole delivery story;
- wants to review product coverage, not only code style;
- needs a local workflow for private repositories.

The initial product is not an enterprise-governance, compliance, or employee-monitoring system.

## Job to be done

> When an agent finishes implementing a feature, help me determine whether it built what I requested and show me the evidence, without making me replay the entire coding session.

The same job applies to human or mixed human-agent implementation.

## Acceptance chain

```text
Product feature
  -> Product requirement
    -> Acceptance criteria
      -> Ticket
        -> Implementation
          -> Verification evidence
            -> Human review decision
```

ReqLens asks:

- Does the ticket preserve the source requirement's intent?
- Are its acceptance criteria observable and verifiable?
- Can material changes be related to the declared scope?
- Does every acceptance claim point to implementation and verification evidence?
- Are failures, assumptions, findings, and missing evidence visible?
- Is a human decision attached to the exact reviewed Git revision?

## Product surface

ReqLens is installed once and can track multiple local repositories. `reqlens serve` starts a loopback-only service and browser workspace. A coding agent registers the active repository and ticket through the CLI; the target application does not need ReqLens source code or dependencies.

ReqLens Studio combines six contexts that normally live in separate tools:

- **Product** — feature, requirement, acceptance criterion, and ticket.
- **Delivery** — repository, worktree, branch, base revision, current revision, and diff.
- **Agent** — observable actions, reported decisions, failures, and handoff evidence.
- **Verification** — deterministic checks, results, findings, and missing proof.
- **Visual** — observed product journeys and revision-bound replay steps.
- **Review** — requested changes, acceptance, and decision validity after Git changes.

Agent context enriches the evidence but is not the source of Git facts. ReqLens can inspect any registered Git change. Retrospective explanations must remain distinct from captured rationale.

## Current end-to-end workflow

Version `0.3.0` supports this flow:

1. Install ReqLens and start the local service.
2. Give a real ticket to a coding agent with the ReqLens skill.
3. The agent normalizes the product context and starts an idempotent review against the target repository.
4. ReqLens records the base revision and reads repository facts directly from Git.
5. The person or agent implements the ticket and runs appropriate checks.
6. The agent reports requirement mappings, test outcomes, findings, activity, and any product journey it actually observed.
7. Studio shows the acceptance chain, real diff, checks, findings, replay, and activity.
8. The human requests changes with a reason or accepts a clean, evidence-complete revision.
9. ReqLens marks the decision outdated if the reviewed Git state changes.

## Evidence and decision rules

Evidence states and review decisions are separate.

A review is evidence-verified only when:

- the ticket has at least one acceptance criterion;
- every criterion is verified;
- at least one deterministic check is recorded;
- every recorded check passes;
- no required finding remains open.

Recommended and optional findings remain visible but do not block evidence verification. Acceptance Replay is optional unless a future repository policy requires it.

A human can accept only when evidence is verified and the working tree is clean. Acceptance stores the exact Git revision. Later commits or uncommitted changes make that decision outdated. Requesting changes requires a note and returns the review to a human-owned changes-requested state.

These states describe available evidence, not absolute correctness.

## Current capabilities

- One local installation tracking multiple Git repositories.
- One normalized ticket and evidence contract for Linear, Jira, Asana, GitHub, or conversation-based work.
- Direct Git inspection from a recorded base revision.
- Local SQLite persistence across restarts.
- Requirement-to-file annotations and real diffs.
- Agent-reported deterministic check results kept separate from semantic findings.
- Optional observed replay steps and preview URL.
- Review decisions with notes and revision validity.
- English and Spanish product interface.

## Explicit current limitations

ReqLens does not yet:

- import or edit a full PRD inside Studio;
- execute arbitrary target-project commands;
- capture full agent tool streams automatically;
- record browser video or screenshots automatically;
- create isolated pull-request previews;
- publish evidence to GitHub or an issue tracker;
- provide remote collaboration, accounts, or authorization.

Those are roadmap capabilities, not hidden behavior in the current interface. See [the feature map](features.md).

## Product principles

### Evidence over assertions

No criterion is complete merely because an agent says it is. Every conclusion should point to inspectable evidence and provenance.

### Git is authoritative for repository facts

The agent never supplies branch names, revisions, dirty state, file counts, or diff content.

### Deterministic checks stay distinct

Tests, builds, type checks, and lint results are displayed separately from model judgments and human observations.

### Local-first by default

Source and evidence stay on the machine unless a future user-authorized action publishes them.

### Humans remain accountable

Agents report evidence and findings. A human accepts or requests changes.

## Success signals for the vertical slice

- A new user can install and diagnose ReqLens with documented commands.
- An agent can register and update a real ticket without provider credentials in ReqLens.
- Git evidence remains correct across uncommitted changes and commits.
- Missing tests or required findings prevent a verified state.
- Acceptance is impossible on a dirty or incomplete revision.
- A decision becomes visibly outdated after Git changes.
- Every interactive control in Studio has a real product outcome.
- The complete flow passes against a separate temporary repository through the public CLI.

## Open product questions

- What is the smallest event format that preserves useful provenance without becoming generic observability?
- At which code granularity do requirement links provide value: file, symbol, hunk, or line?
- Which repository policies should make visual evidence mandatory?
- How should a reviewer resolve or dismiss findings while preserving their history?
- Which parts of the evidence report should be safe to publish back to a pull request?
