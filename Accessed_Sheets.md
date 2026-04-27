<!-- AUTO-GENERATED FROM ingestion/sources.yaml — DO NOT EDIT BY HAND -->
<!-- To update: edit ingestion/sources.yaml, then run `python ingestion/load_sheet.py --regen-docs` -->

# Accessed Sheets

Google Sheets registered with the loader. Pull any of them with:

```bash
python ingestion/load_sheet.py <key>
```

> **Listing a sheet here does not grant Google Drive access.** Each contributor's
> uchicago.edu account must be share-listed on the actual file in Drive before they
> can pull it. The registry only tells the loader where to look — Google enforces
> who can read what.

## Registered sources

| Key | Description | Committee | Link |
| --- | --- | --- | --- |
| `sgfc_annall_2025-2026` | sgfc_ annall_2025-2026 | — | [open](https://docs.google.com/spreadsheets/d/1d0ckfnoHobP251pVqunVgF3pOPuZ9FzXSAUhmXtS5kk/edit?gid=0#gid=0) |
| `sgfc_yearly_2025-2026` | sgfc_yearly_2025-2026 | — | [open](https://docs.google.com/spreadsheets/d/1f2n9PmRvkbiNfqvRUX3C3Vu_ja62RWk7xn0hmvRcuvs/edit?gid=0#gid=0) |

## Adding a new sheet

1. Share the Google Sheet with every uchicago.edu account that needs access (read is enough).
2. Add an entry to [`ingestion/sources.yaml`](ingestion/sources.yaml) with a short `key`, the full URL, and a one-line description.
3. Regenerate this file:

   ```bash
   python ingestion/load_sheet.py --regen-docs
   ```

4. Verify the loader can reach it:

   ```bash
   python ingestion/load_sheet.py <your-new-key>
   ```
