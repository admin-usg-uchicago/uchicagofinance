"""Pull a Google Drive spreadsheet (native Sheets or uploaded .xlsx) into pandas.

First run opens a browser to authorize; token caches to .secrets/authorized_user.json.

Usage:
    python backend/load_sheet.py <FILE_ID> [WORKSHEET_NAME]

    WORKSHEET_NAME optional. If omitted, returns a dict of all tabs and prints each.
"""
from __future__ import annotations

import sys
from io import BytesIO
from pathlib import Path

import pandas as pd
import requests
from google.auth.transport.requests import Request
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import InstalledAppFlow

REPO_ROOT = Path(__file__).resolve().parent.parent
SECRETS = REPO_ROOT / ".secrets"
CLIENT_SECRETS = SECRETS / "oauth_client.json"
TOKEN_CACHE = SECRETS / "authorized_user.json"

SCOPES = ["https://www.googleapis.com/auth/drive.readonly"]
XLSX_MIME = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
NATIVE_SHEET_MIME = "application/vnd.google-apps.spreadsheet"


def get_creds() -> Credentials:
    if not CLIENT_SECRETS.exists():
        raise FileNotFoundError(f"Missing OAuth client at {CLIENT_SECRETS}")

    creds: Credentials | None = None
    if TOKEN_CACHE.exists():
        creds = Credentials.from_authorized_user_file(str(TOKEN_CACHE), SCOPES)

    if creds and creds.valid:
        return creds
    if creds and creds.expired and creds.refresh_token:
        creds.refresh(Request())
        TOKEN_CACHE.write_text(creds.to_json())
        return creds

    flow = InstalledAppFlow.from_client_secrets_file(str(CLIENT_SECRETS), SCOPES)
    creds = flow.run_local_server(port=0)
    TOKEN_CACHE.write_text(creds.to_json())
    return creds


def _get_mime(file_id: str, token: str) -> str:
    r = requests.get(
        f"https://www.googleapis.com/drive/v3/files/{file_id}",
        params={"fields": "mimeType,name", "supportsAllDrives": "true"},
        headers={"Authorization": f"Bearer {token}"},
    )
    if r.status_code == 404:
        raise RuntimeError(
            f"File {file_id} not visible to the authenticated account. "
            "Check: (1) you signed in with the uchicago.edu account that has access, "
            "(2) the file is shared with that account, "
            "(3) if it's in a Shared Drive, that you're a member."
        )
    r.raise_for_status()
    return r.json()["mimeType"]


def _download_xlsx_bytes(file_id: str, token: str) -> bytes:
    mime = _get_mime(file_id, token)
    headers = {"Authorization": f"Bearer {token}"}
    common = {"supportsAllDrives": "true"}
    if mime == NATIVE_SHEET_MIME:
        r = requests.get(
            f"https://www.googleapis.com/drive/v3/files/{file_id}/export",
            params={"mimeType": XLSX_MIME, **common},
            headers=headers,
        )
    else:
        r = requests.get(
            f"https://www.googleapis.com/drive/v3/files/{file_id}",
            params={"alt": "media", **common},
            headers=headers,
        )
    r.raise_for_status()
    return r.content


def load_sheet(file_id: str, worksheet: str | None = None) -> pd.DataFrame | dict[str, pd.DataFrame]:
    creds = get_creds()
    data = _download_xlsx_bytes(file_id, creds.token)
    return pd.read_excel(BytesIO(data), sheet_name=worksheet)


def main() -> None:
    if len(sys.argv) < 2:
        print("usage: python backend/load_sheet.py <FILE_ID> [WORKSHEET_NAME]")
        sys.exit(1)

    file_id = sys.argv[1]
    worksheet = sys.argv[2] if len(sys.argv) > 2 else None

    result = load_sheet(file_id, worksheet)

    if isinstance(result, dict):
        print(f"Loaded {len(result)} tabs:")
        for name, df in result.items():
            print(f"\n── {name} ── {len(df)} rows × {len(df.columns)} cols")
            print(df.head())
    else:
        print(f"Loaded {len(result)} rows × {len(result.columns)} cols")
        print(result.head())


if __name__ == "__main__":
    main()
