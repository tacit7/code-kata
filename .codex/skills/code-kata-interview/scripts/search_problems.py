#!/usr/bin/env python3
"""Search Code Kata's local problem catalog for interview practice."""

import argparse
from contextlib import closing
import json
from pathlib import Path
import sqlite3


DEFAULT_DB = (
    Path.home() / "Library" / "Application Support" / "com.code-kata.app" / "kata.db"
)


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("query", nargs="?", default="", help="Title, topic, tag, or LeetCode number")
    parser.add_argument("--language")
    parser.add_argument("--difficulty", choices=("easy", "medium", "hard"))
    parser.add_argument("--limit", type=int, default=5)
    parser.add_argument("--db", type=Path, default=DEFAULT_DB)
    args = parser.parse_args()
    if not 1 <= args.limit <= 50:
        parser.error("--limit must be between 1 and 50")

    query = args.query.strip().lower()
    db = args.db.expanduser().resolve()
    try:
        with closing(sqlite3.connect(f"{db.as_uri()}?mode=ro", uri=True)) as conn:
            conn.row_factory = sqlite3.Row
            rows = conn.execute(
                """
                SELECT id, name, category, language, difficulty, leetcode_number
                FROM katas
                WHERE (:language IS NULL OR language = :language)
                  AND (:difficulty IS NULL OR difficulty = :difficulty)
                  AND (
                    :query = ''
                    OR instr(lower(name), :query) > 0
                    OR instr(replace(lower(category), '-', ' '), :topic) > 0
                    OR instr(replace(lower(coalesce(tags, '')), '-', ' '), :topic) > 0
                    OR CAST(leetcode_number AS TEXT) = :query
                  )
                ORDER BY name COLLATE NOCASE, language, id
                LIMIT :limit
                """,
                {
                    "language": args.language,
                    "difficulty": args.difficulty,
                    "query": query,
                    "topic": query.replace("-", " "),
                    "limit": args.limit,
                },
            ).fetchall()
    except sqlite3.Error as error:
        parser.exit(1, f"Could not read Code Kata's catalog at {db}: {error}\n")

    print(json.dumps([dict(row) for row in rows], indent=2, ensure_ascii=False))


if __name__ == "__main__":
    main()
