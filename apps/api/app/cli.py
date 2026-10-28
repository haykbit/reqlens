import argparse
import json
import os
from pathlib import Path
import sys
from typing import Any
from urllib.error import HTTPError, URLError
from urllib.request import Request, urlopen


def _json_input(path: str) -> dict[str, Any]:
    content = sys.stdin.read() if path == "-" else Path(path).read_text(encoding="utf-8")
    value = json.loads(content)
    if not isinstance(value, dict):
        raise ValueError("Input JSON must be an object")
    return value


def _request(method: str, endpoint: str, payload: dict[str, Any] | None = None) -> Any:
    base_url = os.environ.get("REQLENS_API_URL", "http://127.0.0.1:7332").rstrip("/")
    data = json.dumps(payload).encode() if payload is not None else None
    request = Request(
        f"{base_url}{endpoint}",
        data=data,
        method=method,
        headers={"Content-Type": "application/json"} if data else {},
    )
    try:
        with urlopen(request, timeout=10) as response:  # noqa: S310 - local API is intentional
            return json.loads(response.read())
    except HTTPError as error:
        body = error.read().decode(errors="replace")
        raise RuntimeError(f"ReqLens API returned {error.code}: {body}") from error
    except URLError as error:
        raise RuntimeError(f"ReqLens API is unavailable at {base_url}: {error.reason}") from error


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(
        prog="reqlens",
        description="Report real ticket and repository evidence to ReqLens",
    )
    subparsers = parser.add_subparsers(dest="command", required=True)
    subparsers.add_parser("health", help="Check the local ReqLens API")
    subparsers.add_parser("list", help="List tracked reviews")

    start = subparsers.add_parser("start", help="Start or refresh a review from a normalized ticket")
    start.add_argument("--project", required=True, help="Path inside the target Git repository")
    start.add_argument("--ticket", required=True, help="Ticket JSON file, or - for stdin")
    start.add_argument("--base-revision", help="Git base revision; defaults to the current HEAD")

    sync = subparsers.add_parser("sync", help="Sync Git and optional agent evidence")
    sync.add_argument("review_id")
    sync.add_argument("--evidence", help="Evidence JSON file, or - for stdin")

    show = subparsers.add_parser("show", help="Return a complete review dashboard as JSON")
    show.add_argument("review_id")
    return parser


def _summary(command: str, result: Any) -> Any:
    if not isinstance(result, dict):
        return result
    if command == "start":
        dashboard = result.get("dashboard")
        if not isinstance(dashboard, dict):
            return result
        project = dashboard.get("project")
        return {
            "review_id": result.get("review_id"),
            "created": result.get("created"),
            "status": dashboard.get("status"),
            "project": project,
        }
    if command == "sync":
        project = result.get("project")
        review_id = project.get("review_id") if isinstance(project, dict) else None
        return {
            "review_id": review_id,
            "status": result.get("status"),
            "project": project,
            "summary": result.get("summary"),
        }
    return result


def main() -> None:
    parser = build_parser()
    args = parser.parse_args()
    try:
        if args.command == "health":
            result = _request("GET", "/api/health")
        elif args.command == "list":
            result = _request("GET", "/api/workspace")
        elif args.command == "show":
            result = _request("GET", f"/api/reviews/{args.review_id}")
        elif args.command == "start":
            payload: dict[str, Any] = {
                "project_path": str(Path(args.project).expanduser().resolve()),
                "ticket": _json_input(args.ticket),
            }
            if args.base_revision:
                payload["base_revision"] = args.base_revision
            result = _request("POST", "/api/reviews/start", payload)
        else:
            payload = _json_input(args.evidence) if args.evidence else {}
            result = _request("POST", f"/api/reviews/{args.review_id}/sync", payload)
        print(json.dumps(_summary(args.command, result), ensure_ascii=False, indent=2))
    except (OSError, ValueError, RuntimeError, json.JSONDecodeError) as error:
        parser.exit(1, f"reqlens: {error}\n")


if __name__ == "__main__":
    main()
