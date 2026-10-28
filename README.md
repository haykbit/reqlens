# ReqLens

**See how requirements become code.**

ReqLens is a local review workspace that connects a product ticket to the repository changes, tests, findings, and observed product evidence used to implement it.

The central question is not “Does this diff look elegant?” It is:

> Did this ticket deliver the product requirement it came from, and what evidence supports that conclusion?

Version `0.3.0` provides one working vertical slice: a coding agent normalizes the ticket and reports semantic evidence, ReqLens reads Git directly, and ReqLens Studio persists and displays the complete review locally.

## Quick start

Prerequisites: Git, Node.js 22+, npm, and [uv](https://docs.astral.sh/uv/).

```bash
git clone https://github.com/haykbit/reqlens.git
cd reqlens
./scripts/install.sh
reqlens doctor
reqlens serve --open
```

`reqlens serve` binds to `127.0.0.1`. It prefers port `7331` and selects the next available port when necessary. The command prints the exact Studio URL and data location.

See [installation and troubleshooting](docs/installation.md) for upgrades, environment variables, and development setup.

## Start a real review

The recommended workflow is to tell Codex:

```text
Use ReqLens for this ticket.
```

The included [ReqLens skill](skills/reqlens/SKILL.md) reads the ticket through the agent's existing Linear, Jira, Asana, or GitHub connection. ReqLens does not store provider credentials.

The agent then starts an idempotent review:

```bash
reqlens start --project /absolute/path/to/application --ticket ticket.json
```

After implementation and verification it reports evidence:

```bash
reqlens sync REVIEW_ID --evidence evidence.json
```

The exact ticket and evidence schemas are versioned in [the agent contract](skills/reqlens/references/contracts.md).

## What is real in the current version

- Git repository root, remote, branch, base revision, head revision, working-tree state, changed files, line counts, and diffs come directly from Git.
- Tickets, acceptance evidence, change annotations, test results, findings, replay steps, review decisions, and activity are persisted in local SQLite.
- A review can only become evidence-verified when it has acceptance criteria, all criteria are verified, at least one deterministic check is present, all checks pass, and no required finding remains.
- A reviewer can request changes with a recorded reason.
- Acceptance is allowed only for complete evidence on a clean working tree and is attached to the exact accepted Git revision.
- A later commit or uncommitted change marks that decision as outdated.
- Studio and the agent endpoints run from one local process in installed mode.

ReqLens never treats a model explanation as Git evidence or a passing test as absolute proof of product correctness.

## Product flow

```text
Linear / Jira / Asana / GitHub / conversation
                         ↓
                    coding agent
                         ↓ normalized ticket and evidence
                    ReqLens service
                    ↙             ↘
          SQLite review             Git inspection
                    ↘             ↙
                    ReqLens Studio
                         ↓
              human review decision
```

Studio provides five focused views:

- **Overview** connects product intent, acceptance criteria, findings, and the human decision.
- **Changes** shows the real diff with requirement mappings and reported rationale.
- **Tests** keeps deterministic checks separate from agent judgment.
- **Replay** shows an observed product journey when one has been reported.
- **Activity** records product, agent, Git, test, and review events.

## CLI

| Command | Purpose |
| --- | --- |
| `reqlens doctor` | Validate the local installation and locate Studio and data. |
| `reqlens serve --open` | Start the local product and optionally open Studio. |
| `reqlens health` | Check the running service. |
| `reqlens list` | List tracked reviews. |
| `reqlens start` | Register or refresh a ticket for a Git repository. |
| `reqlens sync` | Read Git again and optionally record new agent evidence. |
| `reqlens show` | Return the complete review as JSON. |

Set `REQLENS_API_URL` when connecting the CLI to a non-default local URL, `REQLENS_DATA_DIR` to choose the data directory, or `REQLENS_WEB_DIR` to use a different Studio build.

## Local data and privacy

ReqLens binds to loopback by default and keeps its data on the machine. New installations use the operating system's application-data directory. Existing development installations that already contain `.reqlens/data/reqlens.db` continue using that database.

The local database and runtime state are ignored by Git. Source code and evidence are not uploaded by ReqLens. External provider access remains in the user's coding agent.

## Development

```bash
npm ci
uv sync --directory apps/api
npm run dev
```

Development mode runs Vite at `127.0.0.1:7331` and FastAPI at `127.0.0.1:7332`. The CLI automatically tries both addresses.

Run the complete verification suite with:

```bash
npm run typecheck
npm test
npm run build
```

The API suite creates real temporary Git repositories. The CLI integration test starts a real HTTP server, registers a separate repository, reports evidence, and verifies the resulting diff through the public CLI interface.

## Scope and next steps

ReqLens does not yet execute arbitrary project test commands, record browser video automatically, create isolated pull-request previews, or publish evidence back to an external provider. Those capabilities are designed but remain outside this vertical slice.

Product and architecture references:

- [Product definition](docs/product.md)
- [Feature map](docs/features.md)
- [Domain model](docs/domain-model.md)
- [Build and review protocol](docs/review-protocol.md)
- [Visual acceptance](docs/visual-acceptance.md)
- [PR previews](docs/pr-preview.md)

ReqLens is not a replacement for an issue tracker, CI, GitHub review, or human accountability. It is the evidence layer connecting them.
