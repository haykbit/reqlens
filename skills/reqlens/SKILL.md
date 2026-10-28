---
name: reqlens
description: Track a real implementation in the local ReqLens dashboard by normalizing a ticket from Linear, Jira, Asana, GitHub, or the conversation, then reporting Git-linked criteria, tests, findings, and replay evidence. Use when the user asks to use ReqLens, track a ticket in ReqLens, make work visible in ReqLens, or continue a repository that already has a ReqLens review.
---

# ReqLens

Use ReqLens as the evidence bridge between product intent and the actual repository. Keep provider access in the coding agent; never ask the user to add Linear, Jira, Asana, or GitHub credentials to ReqLens.

## Start the review

1. Run `reqlens health`. If the command is missing, install it from the ReqLens checkout with `uv tool install --editable apps/api`. If the local API is unavailable and the ReqLens checkout is known, start `npm run dev` there and keep it running.
2. Read the real ticket with the connected provider tool. If the request came directly from the user and has no provider ticket, use source `manual` and a stable, descriptive reference.
3. Inspect the target path and confirm it is a Git repository.
4. Normalize the ticket using the start contract in [references/contracts.md](references/contracts.md). Preserve the ticket wording; do not invent acceptance criteria.
5. Pipe the JSON to `reqlens start --project "$PWD" --ticket -` before implementation. Record the returned `review_id`. Starting the same ticket in the same repository is idempotent.

## Report evidence

After each meaningful implementation or verification milestone, run:

```bash
reqlens sync REVIEW_ID --evidence -
```

Use the evidence contract in [references/contracts.md](references/contracts.md).

- Report implementation paths only when they actually exist.
- Map each annotation and test to its real requirement identifiers.
- Derive test state from command results: `verified` for a successful relevant check, `failed` for a failed check, and `needs_evidence` or `pending` when it was not run.
- Keep deterministic command output separate from agent judgment.
- Report findings only when they are actionable and evidence-backed. An empty findings list is valid.
- Report a preview URL only after confirming it opens.
- Report replay steps only after observing or executing the product journey. Do not describe a hypothetical run as recorded evidence.
- Let ReqLens read branch, revision, dirty state, changed files, and diffs directly from Git. Never fabricate those fields.

## Finish the work

Run the relevant tests, then perform one final evidence sync. Use `reqlens show REVIEW_ID` to inspect the resulting dashboard payload. The final user response should state the ticket reference, the review ID, and any missing evidence without claiming completion beyond the recorded facts.

ReqLens may be unavailable. Continue the engineering work when safe, retain the normalized ticket and evidence payload, then sync once the local service is available. Do not block implementation only because the dashboard is down.
