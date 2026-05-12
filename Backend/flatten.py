"""Flatten the central USG allocation sheet into Frontend-consumable CSVs.

Reads:
  data/raw/central_2025-2026__25-26_Annall_Allocation.csv
  data/raw/central_2025-2026__25-26_Recurring_Allocation.csv

Writes:
  Frontend/public/annual_allocations.csv
  Frontend/public/yearly_allocations.csv

Run after `python Backend/load_sheet.py --all`.
"""
from __future__ import annotations

from pathlib import Path

import pandas as pd

REPO_ROOT = Path(__file__).resolve().parent.parent
RAW_DIR = REPO_ROOT / "data" / "raw"
OUT_DIR = REPO_ROOT / "Frontend" / "public"

ANNUAL_RAW = RAW_DIR / "central_2025-2026__25-26_Annall_Allocation.csv"
RECURRING_RAW = RAW_DIR / "central_2025-2026__25-26_Recurring_Allocation.csv"
BUDGET_RAW = RAW_DIR / "central_2025-2026__25-26_Revenues_and_Expenditures.csv"
ANNUAL_OUT = OUT_DIR / "annual_allocations.csv"
RECURRING_OUT = OUT_DIR / "yearly_allocations.csv"
BUDGET_OUT = OUT_DIR / "budget.csv"

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


def _load(path: Path) -> pd.DataFrame:
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


def main() -> int:
    OUT_DIR.mkdir(parents=True, exist_ok=True)

    annual = _load(ANNUAL_RAW)
    annual = annual[["RSO Name", "Committee", "Requested", "Final Allocation"]]
    annual.to_csv(ANNUAL_OUT, index=False)
    print(f"wrote {ANNUAL_OUT.relative_to(REPO_ROOT)}  ({len(annual)} rows)")

    recurring = _load(RECURRING_RAW)
    # Type column does not exist in the central sheet yet; emit blank so the
    # frontend schema stays stable. Once the source sheet adds a Type column
    # for SGFC rows, drop this assignment and let _load carry it through.
    recurring["Type"] = ""
    recurring = recurring[
        ["RSO Name", "Committee", "Request Description", "Type", "Requested", "Final Allocation"]
    ]
    recurring.to_csv(RECURRING_OUT, index=False)
    print(f"wrote {RECURRING_OUT.relative_to(REPO_ROOT)}  ({len(recurring)} rows)")

    budget = _load_budget(BUDGET_RAW)
    budget.to_csv(BUDGET_OUT, index=False)
    print(f"wrote {BUDGET_OUT.relative_to(REPO_ROOT)}  ({len(budget)} rows)")

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
