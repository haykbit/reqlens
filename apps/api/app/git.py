from dataclasses import dataclass
from pathlib import Path
import subprocess
from typing import Literal
from urllib.parse import urlparse


class GitRepositoryError(ValueError):
    pass


ChangeCategory = Literal["implementation", "test", "migration", "configuration"]


@dataclass(frozen=True)
class GitFileChange:
    path: str
    additions: int
    deletions: int
    category: ChangeCategory
    diff: str


@dataclass(frozen=True)
class GitSnapshot:
    root: Path
    repository: str
    branch: str
    head_revision: str
    dirty: bool
    changes: list[GitFileChange]


def _run_git(path: Path, *args: str, check: bool = True) -> str:
    result = subprocess.run(
        ["git", "-C", str(path), *args],
        capture_output=True,
        check=False,
        text=True,
        timeout=10,
    )
    if check and result.returncode != 0:
        message = result.stderr.strip() or result.stdout.strip() or "Git command failed"
        raise GitRepositoryError(message)
    return result.stdout.strip()


def resolve_repository(project_path: str) -> Path:
    requested = Path(project_path).expanduser().resolve(strict=True)
    root_value = _run_git(requested, "rev-parse", "--show-toplevel")
    return Path(root_value).resolve(strict=True)


def resolve_revision(root: Path, revision: str) -> str:
    return _run_git(root, "rev-parse", "--short=12", f"{revision}^{{commit}}")


def inspect_repository(project_path: str, base_revision: str | None = None) -> GitSnapshot:
    root = resolve_repository(project_path)
    head = _run_git(root, "rev-parse", "--short=12", "HEAD")
    branch = _run_git(root, "branch", "--show-current", check=False) or f"detached@{head}"
    remote = _run_git(root, "config", "--get", "remote.origin.url", check=False)
    repository = _repository_label(remote, root.name)
    dirty = bool(_run_git(root, "status", "--porcelain", check=False))
    changes = _collect_changes(root, base_revision) if base_revision else []
    return GitSnapshot(root, repository, branch, head, dirty, changes)


def _repository_label(remote: str, fallback: str) -> str:
    if not remote:
        return fallback
    value = remote.removesuffix(".git")
    if value.startswith("git@") and ":" in value:
        host, path = value[4:].split(":", 1)
        return f"{host}/{path}"
    parsed = urlparse(value)
    if parsed.hostname:
        return f"{parsed.hostname}{parsed.path}"
    return value


def _collect_changes(root: Path, base_revision: str) -> list[GitFileChange]:
    resolved_base = resolve_revision(root, base_revision)
    output = _run_git(root, "diff", "--numstat", "--find-renames", resolved_base, check=False)
    files: dict[str, tuple[int, int]] = {}
    for line in output.splitlines():
        parts = line.split("\t", 2)
        if len(parts) != 3:
            continue
        additions = int(parts[0]) if parts[0].isdigit() else 0
        deletions = int(parts[1]) if parts[1].isdigit() else 0
        files[parts[2]] = (additions, deletions)

    untracked_output = _run_git(root, "ls-files", "--others", "--exclude-standard", check=False)
    untracked = {line for line in untracked_output.splitlines() if line}
    for relative_path in untracked:
        files.setdefault(relative_path, (_line_count(root / relative_path), 0))

    changes: list[GitFileChange] = []
    for relative_path, (additions, deletions) in sorted(files.items()):
        diff = (
            _untracked_diff(root / relative_path, relative_path)
            if relative_path in untracked
            else _run_git(
                root,
                "diff",
                "--no-ext-diff",
                "--unified=3",
                resolved_base,
                "--",
                relative_path,
                check=False,
            )
        )
        changes.append(
            GitFileChange(
                path=relative_path,
                additions=additions,
                deletions=deletions,
                category=_category(relative_path),
                diff=diff[:40_000],
            )
        )
    return changes


def _line_count(path: Path) -> int:
    try:
        return len(path.read_text(encoding="utf-8", errors="replace").splitlines())
    except OSError:
        return 0


def _untracked_diff(path: Path, relative_path: str) -> str:
    try:
        lines = path.read_text(encoding="utf-8", errors="replace").splitlines()[:400]
    except OSError:
        return "Binary or unreadable untracked file"
    header = (
        f"diff --git a/{relative_path} b/{relative_path}\n"
        "new file mode 100644\n--- /dev/null\n"
        f"+++ b/{relative_path}\n@@ -0,0 +1,{len(lines)} @@\n"
    )
    return (header + "\n".join(f"+{line}" for line in lines))[:40_000]


def _category(path: str) -> ChangeCategory:
    lowered = path.lower()
    parts = Path(lowered).parts
    name = Path(lowered).name
    if "tests" in parts or "test" in parts or name.startswith("test_") or name.endswith((".test.ts", ".spec.ts", ".test.tsx", ".spec.tsx")):
        return "test"
    if "migration" in lowered or "migrations" in parts:
        return "migration"
    if name in {"package.json", "pyproject.toml", "vite.config.ts", "tsconfig.json", "dockerfile"} or lowered.endswith((".yml", ".yaml", ".toml", ".json")):
        return "configuration"
    return "implementation"
