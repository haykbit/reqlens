# ReqLens agent contracts

All input objects are strict. Omit optional sections rather than adding unknown keys.

## Start contract

Pass this object to `reqlens start --project "$PWD" --ticket -`:

```json
{
  "source": "linear",
  "reference": "ENG-123",
  "url": "https://linear.app/example/issue/ENG-123",
  "title": "Add account lockout",
  "description": "Lock an account after repeated invalid sign-in attempts.",
  "feature": "Authentication safety",
  "feature_reference": "AUTH",
  "requirement": "Protect accounts from credential attacks",
  "requirement_id": "REQ-AUTH-4",
  "acceptance_criteria": [
    {
      "id": "AC-1",
      "title": "Lock after five failed attempts",
      "detail": "A sixth attempt is rejected while the lock is active."
    }
  ]
}
```

Allowed `source` values: `linear`, `jira`, `asana`, `github`, `manual`. `url`, feature fields, requirement fields, descriptions, and acceptance criteria are optional.

## Evidence sync contract

Pass any subset of these sections to `reqlens sync REVIEW_ID --evidence -`:

```json
{
  "criteria": [
    {
      "criterion_id": "AC-1",
      "state": "verified",
      "implementation": ["src/auth/lockout.ts"],
      "evidence_label": "Covered by the lockout integration test"
    }
  ],
  "changes": [
    {
      "path": "src/auth/lockout.ts",
      "requirement_ids": ["AC-1", "REQ-AUTH-4"],
      "summary": "Counts failed attempts and enforces the lock window.",
      "rationale": "The policy remains in the domain layer so every sign-in entrypoint shares it."
    }
  ],
  "tests": [
    {
      "id": "auth-lockout-integration",
      "name": "Account lockout integration test",
      "command": "npm test -- auth-lockout",
      "kind": "integration",
      "state": "verified",
      "duration_ms": 842,
      "assertions": 4,
      "requirement_ids": ["AC-1"],
      "detail": "Exercises five failures and the rejected sixth attempt."
    }
  ],
  "findings": [],
  "replay_steps": [
    {
      "id": "lockout-message",
      "order": 1,
      "title": "Trigger the account lock",
      "expectation": "The lock message appears after the configured threshold.",
      "state": "verified",
      "timestamp_seconds": 14,
      "requirement_ids": ["AC-1"]
    }
  ],
  "events": [
    {
      "actor": "Codex",
      "title": "Integration evidence recorded",
      "detail": "The lockout test passed locally.",
      "kind": "test"
    }
  ],
  "preview_url": "http://127.0.0.1:4173",
  "pull_request": 42
}
```

Evidence states: `verified`, `needs_evidence`, `in_review`, `pending`, `failed`.

Test kinds: `unit`, `integration`, `api`, `database`, `e2e`, `lint`, `typecheck`.

Finding severity: `required`, `recommended`, `optional`.

Finding category: `coverage`, `scope`, `correctness`, `verification`, `maintainability`.

Event kinds: `product`, `agent`, `git`, `test`, `review`.
