"""
Sync incremental de una carpeta compartida de Drive a una carpeta propia.
Copia archivos nuevos o modificados, crea carpetas faltantes.
Todo cloud-to-cloud via API, sin descargar nada al disco.

Uso:
  python sync_drive_folder.py [--dry-run]

Variables de entorno requeridas:
  GOOGLE_DRIVE_CREDENTIALS  — JSON del client_secret (contenido, no path)
  GOOGLE_DRIVE_TOKEN        — JSON del token OAuth (contenido, no path)
"""
import sys, os, json, time, argparse

sys.stdout.reconfigure(encoding="utf-8")

from google.oauth2.credentials import Credentials
from google.auth.transport.requests import Request
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError

SOURCE_ID = "1uZn9gTEYdjM9y0C3Djy8D1poBkCzqsWH"
DEST_ID = "1tBJgmtomM83sO7XJX-f6UegvajIB4r2d"

FOLDER_MIME = "application/vnd.google-apps.folder"
GOOGLE_DOC_MIMES = {
    "application/vnd.google-apps.document",
    "application/vnd.google-apps.spreadsheet",
    "application/vnd.google-apps.presentation",
    "application/vnd.google-apps.drawing",
    "application/vnd.google-apps.form",
}

def get_credentials():
    token_env = os.environ.get("GOOGLE_DRIVE_TOKEN")
    if token_env:
        token_data = json.loads(token_env)
        creds = Credentials.from_authorized_user_info(token_data)
    else:
        from pathlib import Path
        token_path = Path(__file__).parent / "drive_token.json"
        creds = Credentials.from_authorized_user_file(str(token_path))

    if creds.expired and creds.refresh_token:
        creds.refresh(Request())
    return creds


def list_folder_recursive(service, folder_id, path=""):
    items = {}
    page_token = None
    while True:
        r = service.files().list(
            q=f"'{folder_id}' in parents and trashed = false",
            fields="nextPageToken, files(id, name, mimeType, modifiedTime)",
            pageSize=200,
            pageToken=page_token,
        ).execute()
        for f in r.get("files", []):
            rel_path = f"{path}/{f['name']}" if path else f["name"]
            items[rel_path] = {
                "id": f["id"],
                "name": f["name"],
                "mimeType": f["mimeType"],
                "modifiedTime": f["modifiedTime"],
                "parent_id": folder_id,
            }
            if f["mimeType"] == FOLDER_MIME:
                items.update(list_folder_recursive(service, f["id"], rel_path))
        page_token = r.get("nextPageToken")
        if not page_token:
            break
    return items


def retry_api(fn, max_retries=3):
    for attempt in range(max_retries):
        try:
            return fn()
        except HttpError as e:
            if e.resp.status in (403, 429, 500, 503) and attempt < max_retries - 1:
                wait = 2 ** (attempt + 1)
                print(f"  Rate limited, waiting {wait}s...")
                time.sleep(wait)
            else:
                raise


def sync(dry_run=False):
    creds = get_credentials()
    service = build("drive", "v3", credentials=creds)

    print("Scanning source folder...")
    try:
        source = list_folder_recursive(service, SOURCE_ID)
    except HttpError as e:
        if e.resp.status in (404, 403):
            print(f"ERROR: Source folder inaccessible (HTTP {e.resp.status}).")
            print("Sharing may have been revoked. Aborting to protect existing copy.")
            sys.exit(1)
        raise
    print(f"  Source: {len(source)} items")

    if len(source) == 0:
        print("ERROR: Source returned 0 items. Possible deletion or access revoked.")
        print("Aborting to protect existing copy.")
        sys.exit(1)

    MIN_EXPECTED = 200
    if len(source) < MIN_EXPECTED:
        print(f"WARNING: Source has {len(source)} items (expected ~342).")
        print("Possible partial deletion. Proceeding with copy-only (no updates).")

    print("Scanning destination folder...")
    dest = list_folder_recursive(service, DEST_ID)
    print(f"  Dest:   {len(dest)} items")

    source_folders = {k: v for k, v in source.items() if v["mimeType"] == FOLDER_MIME}
    source_files = {k: v for k, v in source.items() if v["mimeType"] != FOLDER_MIME}

    dest_folder_map = {}
    for path, info in dest.items():
        if info["mimeType"] == FOLDER_MIME:
            dest_folder_map[path] = info["id"]

    created_folders = 0
    copied_files = 0
    updated_files = 0
    skipped_files = 0

    for path in sorted(source_folders.keys()):
        if path not in dest_folder_map:
            parts = path.rsplit("/", 1)
            if len(parts) == 2:
                parent_path, folder_name = parts
                parent_id = dest_folder_map.get(parent_path, DEST_ID)
            else:
                folder_name = parts[0]
                parent_id = DEST_ID

            print(f"  + Folder: {path}")
            if not dry_run:
                body = {"name": folder_name, "mimeType": FOLDER_MIME, "parents": [parent_id]}
                result = retry_api(lambda: service.files().create(body=body, fields="id").execute())
                dest_folder_map[path] = result["id"]
            created_folders += 1

    for path, src_info in source_files.items():
        dest_info = dest.get(path)

        if dest_info and dest_info["modifiedTime"] >= src_info["modifiedTime"]:
            skipped_files += 1
            continue

        parts = path.rsplit("/", 1)
        if len(parts) == 2:
            parent_path, file_name = parts
            parent_id = dest_folder_map.get(parent_path, DEST_ID)
        else:
            file_name = parts[0]
            parent_id = DEST_ID

        if dest_info:
            print(f"  ~ Update: {path}")
            if not dry_run:
                retry_api(lambda: service.files().delete(fileId=dest_info["id"]).execute())
            updated_files += 1
        else:
            print(f"  + Copy:   {path}")
            copied_files += 1

        if not dry_run:
            if src_info["mimeType"] in GOOGLE_DOC_MIMES:
                body = {"name": file_name, "parents": [parent_id]}
                retry_api(lambda: service.files().copy(
                    fileId=src_info["id"], body=body, fields="id"
                ).execute())
            else:
                body = {"name": file_name, "parents": [parent_id]}
                retry_api(lambda: service.files().copy(
                    fileId=src_info["id"], body=body, fields="id"
                ).execute())

    print(f"\n{'[DRY RUN] ' if dry_run else ''}Sync complete:")
    print(f"  Folders created: {created_folders}")
    print(f"  Files copied:    {copied_files}")
    print(f"  Files updated:   {updated_files}")
    print(f"  Files skipped:   {skipped_files}")


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--dry-run", action="store_true", help="Show changes without applying")
    args = parser.parse_args()
    sync(dry_run=args.dry_run)
