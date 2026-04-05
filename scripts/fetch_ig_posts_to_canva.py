#!/usr/bin/env python3
"""
Recupera todos los posts de imagen de Instagram y los sube a Canva.

Uso:
    python scripts/fetch_ig_posts_to_canva.py --client maria-jose

Flujo:
    1. Obtiene todos los media de la cuenta (paginado)
    2. Filtra solo IMAGE y CAROUSEL_ALBUM (excluye VIDEO/REELS)
    3. Descarga las imagenes
    4. Sube cada una a Canva en la carpeta indicada
"""

import json
import os
import sys
import urllib.request
import urllib.error
import time
from pathlib import Path

# Fix Windows console encoding
if sys.stdout.encoding != "utf-8":
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")
    sys.stderr.reconfigure(encoding="utf-8", errors="replace")

PROJECT_ROOT = Path(__file__).resolve().parents[1]
API_VERSION = "v21.0"
BASE_URL = f"https://graph.instagram.com/{API_VERSION}"

# Canva folder IDs por cliente
CANVA_FOLDERS = {
    "maria-jose": "FAHFwLuAmPI",       # Posts Instagram
    "guadalupe-acero": "FAHFwFGGc1o",  # Posts Instagram
    "chanel-de-la-rosa": "FAHFwCCKBHA", # Posts Instagram
}


def load_env():
    env_path = PROJECT_ROOT / ".env"
    env = {}
    if env_path.exists():
        with open(env_path) as f:
            for line in f:
                line = line.strip()
                if line and not line.startswith("#") and "=" in line:
                    key, val = line.split("=", 1)
                    env[key.strip()] = val.strip()
    return env


def get_credentials(env, client):
    suffix = client.upper().replace("-", "_")
    token = env.get(f"META_ACCESS_TOKEN_{suffix}", "") or env.get("META_ACCESS_TOKEN", "")
    account_id = env.get(f"INSTAGRAM_ACCOUNT_ID_{suffix}", "") or env.get("INSTAGRAM_ACCOUNT_ID", "")
    return token, account_id


def api_get(url):
    req = urllib.request.Request(url)
    with urllib.request.urlopen(req) as resp:
        return json.loads(resp.read().decode())


def fetch_all_media(account_id, token):
    """Obtiene TODOS los media paginando."""
    all_media = []
    url = f"{BASE_URL}/{account_id}/media?fields=id,media_type,media_url,thumbnail_url,caption,timestamp,permalink&limit=50&access_token={token}"

    page = 1
    while url:
        print(f"  Pagina {page}...")
        data = api_get(url)
        items = data.get("data", [])
        all_media.extend(items)
        print(f"    {len(items)} items (total: {len(all_media)})")

        # Next page
        paging = data.get("paging", {})
        url = paging.get("next")
        page += 1

    return all_media


def download_image(url, dest_path):
    """Descarga una imagen."""
    req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
    with urllib.request.urlopen(req, timeout=30) as resp:
        dest_path.write_bytes(resp.read())


def upload_to_canva(file_path, name, canva_token, folder_id=None):
    """Sube un asset a Canva y lo mueve a la carpeta indicada."""
    import base64

    file_data = file_path.read_bytes()

    # Canva metadata header limit ~100 chars. Truncate name to fit.
    max_name = 50
    if len(name.encode("utf-8")) > max_name:
        name = name[:max_name].rstrip()

    metadata = {"name_base64": base64.b64encode(name.encode()).decode()}
    meta_json = json.dumps(metadata)

    req = urllib.request.Request(
        "https://api.canva.com/rest/v1/asset-uploads",
        data=file_data,
        headers={
            "Authorization": f"Bearer {canva_token}",
            "Content-Type": "application/octet-stream",
            "Asset-Upload-Metadata": meta_json,
        },
        method="POST",
    )

    try:
        with urllib.request.urlopen(req) as resp:
            result = json.loads(resp.read().decode())
    except urllib.error.HTTPError as e:
        err = e.read().decode()
        print(f"    [CANVA ERROR {e.code}] {err[:200]}")
        return None

    # Poll job until complete to get asset_id
    job_id = result.get("job", {}).get("id", "")
    if not job_id:
        return result

    asset_id = None
    for _ in range(20):
        time.sleep(1)
        try:
            jreq = urllib.request.Request(
                f"https://api.canva.com/rest/v1/asset-uploads/{job_id}",
                headers={"Authorization": f"Bearer {canva_token}"},
            )
            with urllib.request.urlopen(jreq) as jresp:
                job = json.loads(jresp.read().decode()).get("job", {})
                status = job.get("status", "")
                if status == "success":
                    asset_id = job.get("asset", {}).get("id", "")
                    break
                elif status == "failed":
                    print(f"    [CANVA JOB FAILED] {job.get('error', {})}")
                    return None
        except urllib.error.HTTPError:
            pass

    # Move asset to folder
    if asset_id and folder_id:
        try:
            move_data = json.dumps({"item_id": asset_id, "to_folder_id": folder_id}).encode()
            mreq = urllib.request.Request(
                "https://api.canva.com/rest/v1/folders/move",
                data=move_data,
                headers={
                    "Authorization": f"Bearer {canva_token}",
                    "Content-Type": "application/json",
                },
                method="POST",
            )
            with urllib.request.urlopen(mreq) as mresp:
                mresp.read()
        except urllib.error.HTTPError as e:
            print(f"    [MOVE ERROR {e.code}] {e.read().decode()[:200]}")

    result["asset_id"] = asset_id or ""
    return result


def main():
    import argparse
    parser = argparse.ArgumentParser()
    parser.add_argument("--client", default="maria-jose")
    parser.add_argument("--no-upload", action="store_true", help="Solo descargar, no subir a Canva")
    parser.add_argument("--limit", type=int, default=0, help="Limitar numero de posts (0=todos)")
    args = parser.parse_args()

    env = load_env()
    token, account_id = get_credentials(env, args.client)
    canva_token = env.get("CANVA_ACCESS_TOKEN", "")
    folder_id = CANVA_FOLDERS.get(args.client)

    if not token or not account_id:
        print(f"[ERROR] No hay credenciales de Instagram para '{args.client}'")
        sys.exit(1)

    if not args.no_upload and not canva_token:
        print("[ERROR] CANVA_ACCESS_TOKEN no encontrado. Ejecuta: python scripts/canva_auth.py")
        sys.exit(1)

    # Output folders — separar por tipo
    base_dir = PROJECT_ROOT / "clientes" / args.client / "08-reportes" / "instagram-data"
    dir_posts = base_dir / "posts"
    dir_carousels = base_dir / "carousels"
    dir_posts.mkdir(parents=True, exist_ok=True)
    dir_carousels.mkdir(parents=True, exist_ok=True)

    print(f"\n=== Recuperar posts de Instagram -> Canva ===")
    print(f"  Cliente: {args.client}")
    print(f"  Account: {account_id}")
    print(f"  Canva folder: {folder_id}")
    print(f"  Posts dir: {dir_posts}")
    print(f"  Carousels dir: {dir_carousels}")
    print()

    # 1. Fetch all media
    print("1. Obteniendo todos los media...")
    all_media = fetch_all_media(account_id, token)
    print(f"   Total media: {len(all_media)}")

    # 2. Filter non-video
    images = [m for m in all_media if m.get("media_type") in ("IMAGE", "CAROUSEL_ALBUM")]
    print(f"   Imagenes/carruseles: {len(images)}")
    print(f"   Videos excluidos: {len(all_media) - len(images)}")

    if args.limit:
        images = images[:args.limit]
        print(f"   Limitado a: {args.limit}")

    # 3. Download and upload
    print(f"\n2. Descargando y {'subiendo a Canva' if not args.no_upload else 'guardando local'}...\n")

    results = {"downloaded": 0, "uploaded": 0, "errors": 0}
    manifest = []

    for i, media in enumerate(images):
        media_id = media["id"]
        media_type = media["media_type"]
        media_url = media.get("media_url", "")
        caption = (media.get("caption", "") or "")[:80].replace("\n", " ")
        timestamp = media.get("timestamp", "")[:10]
        permalink = media.get("permalink", "")

        if not media_url:
            print(f"  [{i+1}/{len(images)}] {media_id} — sin URL, saltando")
            results["errors"] += 1
            continue

        # Filename — guardar en carpeta segun tipo
        safe_caption = "".join(c if c.isalnum() or c in "-_ " else "" for c in caption)[:40].strip()
        filename = f"{timestamp}_{media_id}_{safe_caption}.jpg"
        if media_type == "CAROUSEL_ALBUM":
            filepath = dir_carousels / filename
        else:
            filepath = dir_posts / filename

        print(f"  [{i+1}/{len(images)}] {timestamp} — {caption[:50]}...")

        # Download
        try:
            if not filepath.exists():
                download_image(media_url, filepath)
            results["downloaded"] += 1
        except Exception as e:
            print(f"    [ERROR descarga] {e}")
            results["errors"] += 1
            continue

        # Upload to Canva
        if not args.no_upload:
            name = f"IG {timestamp} — {safe_caption}" if safe_caption else f"IG {timestamp} — {media_id}"
            result = upload_to_canva(filepath, name, canva_token, folder_id)
            if result:
                results["uploaded"] += 1
                asset_id = result.get("asset_id", "")
                manifest.append({
                    "ig_id": media_id,
                    "date": timestamp,
                    "caption": caption,
                    "permalink": permalink,
                    "type": media_type,
                    "local_file": str(filepath.relative_to(PROJECT_ROOT)),
                    "canva_asset_id": asset_id,
                })
            else:
                results["errors"] += 1

            # Rate limit: small delay between uploads
            if i < len(images) - 1:
                time.sleep(0.5)

    # 4. Save manifest (separado por tipo)
    manifest_posts = [m for m in manifest if m["type"] == "IMAGE"]
    manifest_carousels = [m for m in manifest if m["type"] == "CAROUSEL_ALBUM"]

    manifest_path = base_dir / "manifest.json"
    with open(manifest_path, "w", encoding="utf-8") as f:
        json.dump({
            "client": args.client,
            "total": len(manifest),
            "posts": len(manifest_posts),
            "carousels": len(manifest_carousels),
            "items": manifest,
        }, f, indent=2, ensure_ascii=False)

    print(f"\n=== Resultado ===")
    print(f"  Descargados: {results['downloaded']}")
    print(f"    Posts (IMAGE): {len(manifest_posts)}")
    print(f"    Carruseles (CAROUSEL_ALBUM): {len(manifest_carousels)}")
    print(f"  Subidos a Canva: {results['uploaded']}")
    print(f"  Errores: {results['errors']}")
    print(f"  Manifest: {manifest_path}")
    print()


if __name__ == "__main__":
    main()
