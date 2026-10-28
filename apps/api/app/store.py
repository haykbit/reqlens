from pathlib import Path
import sqlite3

from .models import ReviewRecord


class ReviewStore:
    def __init__(self, data_dir: Path) -> None:
        data_dir.mkdir(parents=True, exist_ok=True)
        self.database_path = data_dir / "reqlens.db"
        self._initialize()

    def _connect(self) -> sqlite3.Connection:
        connection = sqlite3.connect(self.database_path)
        connection.row_factory = sqlite3.Row
        return connection

    def _initialize(self) -> None:
        with self._connect() as connection:
            connection.execute("PRAGMA journal_mode=WAL")
            connection.execute(
                """
                CREATE TABLE IF NOT EXISTS reviews (
                    id TEXT PRIMARY KEY,
                    project_id TEXT NOT NULL,
                    project_path TEXT NOT NULL,
                    ticket_reference TEXT NOT NULL,
                    updated_at TEXT NOT NULL,
                    document TEXT NOT NULL
                )
                """
            )
            connection.execute(
                "CREATE UNIQUE INDEX IF NOT EXISTS reviews_project_ticket ON reviews(project_path, ticket_reference)"
            )

    def save(self, record: ReviewRecord) -> None:
        with self._connect() as connection:
            connection.execute(
                """
                INSERT INTO reviews(id, project_id, project_path, ticket_reference, updated_at, document)
                VALUES (?, ?, ?, ?, ?, ?)
                ON CONFLICT(id) DO UPDATE SET
                    project_id = excluded.project_id,
                    project_path = excluded.project_path,
                    ticket_reference = excluded.ticket_reference,
                    updated_at = excluded.updated_at,
                    document = excluded.document
                """,
                (
                    record.id,
                    record.project_id,
                    record.project_path,
                    record.ticket.reference,
                    record.updated_at,
                    record.model_dump_json(),
                ),
            )

    def get(self, review_id: str) -> ReviewRecord | None:
        with self._connect() as connection:
            row = connection.execute("SELECT document FROM reviews WHERE id = ?", (review_id,)).fetchone()
        return ReviewRecord.model_validate_json(row["document"]) if row else None

    def find(self, project_path: str, ticket_reference: str) -> ReviewRecord | None:
        with self._connect() as connection:
            row = connection.execute(
                "SELECT document FROM reviews WHERE project_path = ? AND ticket_reference = ?",
                (project_path, ticket_reference),
            ).fetchone()
        return ReviewRecord.model_validate_json(row["document"]) if row else None

    def list(self) -> list[ReviewRecord]:
        with self._connect() as connection:
            rows = connection.execute("SELECT document FROM reviews ORDER BY updated_at DESC").fetchall()
        return [ReviewRecord.model_validate_json(row["document"]) for row in rows]
