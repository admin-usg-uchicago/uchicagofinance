"""Flatten USG central allocation sheets into Frontend-consumable CSVs.

Each cycle becomes its own folder under Frontend/public/cycles/<slug>/.
Missing input files are skipped silently (so the next-cycle sheet, which
currently has only annual data, flattens cleanly).

Run after `python Backend/load_sheet.py --all`.
"""
from __future__ import annotations

from dataclasses import dataclass, field
from pathlib import Path

import pandas as pd

REPO_ROOT = Path(__file__).resolve().parent.parent
RAW_DIR = REPO_ROOT / "data" / "raw"
OUT_ROOT = REPO_ROOT / "Frontend" / "public" / "cycles"


@dataclass(frozen=True)
class Cycle:
    slug: str
    annual: str
    recurring: str | None = None
    budget: str | None = None
    awards: str | None = None
    expenditures: str | None = None
    tags: tuple[str, ...] = field(default_factory=tuple)


CYCLES: tuple[Cycle, ...] = (
    Cycle(
        slug="2025-26",
        annual="central_2025-2026__25-26_Annall_Allocation.csv",
        recurring="central_2025-2026__25-26_Recurring_Allocation.csv",
        budget="central_2025-2026__25-26_Revenues_and_Expenditures.csv",
        awards="central_2025-2026__25-26_RSO_Awards.csv",
        expenditures="central_2025-2026__25-26_Detailed_USG_expenditures.csv",
    ),
    Cycle(
        slug="2026-27",
        annual="central_2026-2027__26-27_Annall_Allocation.csv",
    ),
)

# Maps normalized committee names (lower-case, whitespace-collapsed, typo-corrected)
# to the short codes the frontend uses.
COMMITTEE_CODE: dict[str, str] = {
    "committee on academic teams": "cat",
    "community service fund": "csf",
    "program coordinating council": "pcc",
    "sports club finance committee": "scf",
    "sports club fund": "scf",
    "student government finance committee": "sgfc",
}


def _committee_code(raw: object) -> str | None:
    if not isinstance(raw, str):
        return None
    norm = " ".join(raw.lower().split())
    norm = norm.replace("commitee", "committee")
    norm = norm.replace("programming coordinating", "program coordinating")
    return COMMITTEE_CODE.get(norm)


def _load_allocations(path: Path) -> pd.DataFrame:
    df = pd.read_csv(path)
    df = df.rename(columns={"Requested Allocation": "Requested"})
    df["Committee"] = df["Committee"].map(_committee_code)
    df = df[df["Committee"].notna()]
    df = df[df["RSO Name"].notna() & (df["RSO Name"].astype(str).str.strip() != "")]
    return df


def _load_budget(path: Path) -> pd.DataFrame:
    df = pd.read_csv(path)
    df = df.rename(
        columns={
            "Accounts": "Account",
            "Beginning Balance (before 25/26)": "Beginning Balance",
            "Allocated (for 25/26 year)": "Allocated 25-26",
            "Expenditures (for 25/26 year)": "Expenditures 25-26",
            "Ending Balance (after 25/26 year)": "Ending Balance",
            "Allocated 26-27": "Allocated 26-27",
        }
    )
    df = df[df["Account"].notna() & (df["Account"].astype(str).str.strip() != "")]
    df = df[df["Account"].astype(str).str.strip().str.lower() != "total"]
    return df[
        [
            "Account",
            "Beginning Balance",
            "Allocated 25-26",
            "Expenditures 25-26",
            "Ending Balance",
            "Allocated 26-27",
        ]
    ]


def _emit_cycle(cycle: Cycle) -> None:
    out_dir = OUT_ROOT / cycle.slug
    out_dir.mkdir(parents=True, exist_ok=True)

    annual_path = RAW_DIR / cycle.annual
    if annual_path.exists():
        annual = _load_allocations(annual_path)[
            ["RSO Name", "Committee", "Requested", "Final Allocation"]
        ]
        out = out_dir / "annual_allocations.csv"
        annual.to_csv(out, index=False)
        print(f"wrote {out.relative_to(REPO_ROOT)}  ({len(annual)} rows)")
    else:
        print(f"skip annual for {cycle.slug}: {annual_path.name} not present")

    if cycle.recurring:
        path = RAW_DIR / cycle.recurring
        if path.exists():
            df = _load_allocations(path)
            df["Type"] = ""
            df = df[
                ["RSO Name", "Committee", "Request Description", "Type", "Requested", "Final Allocation"]
            ]
            out = out_dir / "yearly_allocations.csv"
            df.to_csv(out, index=False)
            print(f"wrote {out.relative_to(REPO_ROOT)}  ({len(df)} rows)")

    if cycle.budget:
        path = RAW_DIR / cycle.budget
        if path.exists():
            df = _load_budget(path)
            out = out_dir / "budget.csv"
            df.to_csv(out, index=False)
            print(f"wrote {out.relative_to(REPO_ROOT)}  ({len(df)} rows)")

    if cycle.awards:
        path = RAW_DIR / cycle.awards
        if path.exists():
            df = pd.read_csv(path)
            df = df[
                df["RSO Name"].notna()
                & (df["RSO Name"].astype(str).str.strip() != "")
            ]
            df = df[["RSO Name", "Award", "Description"]]
            out = out_dir / "awards.csv"
            df.to_csv(out, index=False)
            print(f"wrote {out.relative_to(REPO_ROOT)}  ({len(df)} rows)")

    if cycle.expenditures:
        path = RAW_DIR / cycle.expenditures
        if path.exists():
            df = pd.read_csv(path)
            df = df[
                df["Division"].notna()
                & (df["Division"].astype(str).str.strip() != "")
                & df["Amount"].notna()
            ]
            df = df[["Division", "Category", "Description", "Amount"]]
            out = out_dir / "expenditures.csv"
            df.to_csv(out, index=False)
            print(f"wrote {out.relative_to(REPO_ROOT)}  ({len(df)} rows)")


def main() -> int:
    OUT_ROOT.mkdir(parents=True, exist_ok=True)
    for cycle in CYCLES:
        _emit_cycle(cycle)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
