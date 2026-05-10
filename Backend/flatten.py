"""Flatten per-committee raw CSVs into unified annual/yearly CSVs for the frontend.

Reads data/raw/*.csv produced by load_sheet.py and writes:
  Frontend/public/annual_allocations.csv  (annual / annall summaries, all committees)
  Frontend/public/yearly_allocations.csv  (yearly / recurring event summaries, all committees)

Each output row carries a Committee column (cat/csf/pcc/scf/sgfc) so the
frontend can filter and group by committee.

Run after `python Backend/load_sheet.py --all`.
"""
from __future__ import annotations

from pathlib import Path

import pandas as pd

REPO_ROOT = Path(__file__).resolve().parent.parent
RAW_DIR = REPO_ROOT / "data" / "raw"
OUT_DIR = REPO_ROOT / "Frontend" / "public"

ANNUAL_SOURCES: list[tuple[str, str, dict[str, str]]] = [
    ("cat_annall_2025-2026__cat_annall_summary_2025-2026.csv",   "cat",  {"Requested Allocation": "Requested"}),
    ("csf_annall_2025-2026__csf_annall_summary_2025-2026.csv",   "csf",  {}),
    ("pcc_annall_2025-2026__pcc_annall_summary_2025-2026.csv",   "pcc",  {"Requested Allocation": "Requested"}),
    ("scf_annall_2025-2026__scf_annall_summary_2025-2026.csv",   "scf",  {"Requested Allocation": "Requested"}),
    ("sgfc_annall_2025-2026__sgfc_annall_summary_2025-2026.csv", "sgfc", {}),
]

YEARLY_SOURCES: list[tuple[str, str, dict[str, str]]] = [
    ("csf_recurring_2025-2026__csf_yearly_summary_2025-2026.csv", "csf",  {"Event Name": "Request Description", "Requested Allocation": "Requested"}),
    ("scf_recurring_2025-2026__scf_yearly_summary_2025-2026.csv", "scf",  {}),
    ("sgfc_yearly_2025-2026__sgfc_yearly_summary_2025-2026.csv",  "sgfc", {}),
]

ANNUAL_COLS = ["RSO Name", "Committee", "Requested", "Final Allocation"]
YEARLY_COLS = ["RSO Name", "Committee", "Request Description", "Type", "Requested", "Final Allocation"]


def _flatten(
    sources: list[tuple[str, str, dict[str, str]]],
    out_cols: list[str],
    out_path: Path,
    label: str,
) -> None:
    print(f"{label}:")
    frames: list[pd.DataFrame] = []
    for fname, committee, renames in sources:
        path = RAW_DIR / fname
        if not path.exists():
            print(f"  skip (missing): {fname}")
            continue
        df = pd.read_csv(path)
        if renames:
            df = df.rename(columns=renames)
        df["Committee"] = committee
        for col in out_cols:
            if col not in df.columns:
                df[col] = ""
        df = df[out_cols]
        df = df[df["RSO Name"].notna() & (df["RSO Name"].astype(str).str.strip() != "")]
        frames.append(df)
        print(f"  {committee}: {len(df)} rows ← {fname}")

    if not frames:
        print(f"  no rows — {out_path.name} not written")
        return

    merged = pd.concat(frames, ignore_index=True)
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    merged.to_csv(out_path, index=False)
    print(f"  wrote {out_path.relative_to(REPO_ROOT)}  ({len(merged)} rows × {len(merged.columns)} cols)")


def main() -> int:
    _flatten(ANNUAL_SOURCES, ANNUAL_COLS, OUT_DIR / "annual_allocations.csv", "annual")
    _flatten(YEARLY_SOURCES, YEARLY_COLS, OUT_DIR / "yearly_allocations.csv", "yearly")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
