#!/usr/bin/env python3
"""
Limpia assets huerfanos de la raiz de Canva que ya existen en una carpeta destino.

Compara los assets en la carpeta destino con los de la raiz ("root")
y elimina los duplicados de la raiz (mismo nombre).

Uso:
    python scripts/canva_cleanup_root.py --folder FAHFwLuAmPI --dry-run
    python scripts/canva_cleanup_root.py --folder FAHFwLuAmPI --delete
"""

import json
import sys
import time
import urllib.request
import urllib.error
from pathlib import Path

if sys.stdout.encoding != "utf-8":
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")
    sys.stderr.reconfigure(encoding="utf-8", errors="replace")

PROJECT_ROOT = Path(__file__).resolve().parents[1]


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


def api_get(url, token):
    req = urllib.request.Request(url, headers={"Authorization": f"Bearer {token}"})
    with urllib.request.urlopen(req) as resp:
        return json.loads(resp.read().decode())


def api_delete(url, token):
    req = urllib.request.Request(url, headers={"Authorization": f"Bearer {token}"}, method="DELETE")
    with urllib.request.urlopen(req) as resp:
        return resp.status


def list_folder_items(folder_id, token):
    """Lista TODOS los items de una carpeta (paginado)."""
    items = []
    url = f"https://api.canva.com/rest/v1/folders/{folder_id}/items?count=50"
    while url:
        data = api_get(url, token)
        items.extend(data.get("items", []))
        cont = data.get("continuation")
        url = f"https://api.canva.com/rest/v1/folders/{folder_id}/items?count=50&continuation={cont}" if cont else None
    return items


def list_root_items(token):
    """Lista items en la raiz (root)."""
    items = []
    url = "https://api.canva.com/rest/v1/folders/root/items?count=50"
    while url:
        data = api_get(url, token)
        items.extend(data.get("items", []))
        cont = data.get("continuation")
        url = f"https://api.canva.com/rest/v1/folders/root/items?count=50&continuation={cont}" if cont else None
    return items


def get_item_name(item):
    """Extrae el nombre de un item independientemente de su tipo."""
    for key in ("image", "video", "design", "folder"):
        if key in item:
            return item[key].get("name", "")
    return ""


def get_item_id(item):
    """Extrae el ID de un item."""
    for key in ("image", "video", "design", "folder"):
        if key in item:
            return item[key].get("id", "")
    return ""


def main():
    import argparse
    parser = argparse.ArgumentParser()
    parser.add_argument("--folder", required=True, help="Canva folder ID destino")
    parser.add_argument("--delete", action="store_true", help="Eliminar duplicados (sin esto solo muestra)")
    parser.add_argument("--dry-run", action="store_true", help="Solo mostrar que se eliminaria")
    args = parser.parse_args()

    env = load_env()
    token = env.get("CANVA_ACCESS_TOKEN", "")
    if not token:
        print("[ERROR] CANVA_ACCESS_TOKEN no encontrado")
        sys.exit(1)

    print("=== Canva Cleanup: duplicados en raiz ===\n")

    # 1. Listar items en la carpeta destino
    print(f"1. Listando items en carpeta {args.folder}...")
    folder_items = list_folder_items(args.folder, token)
    folder_names = {get_item_name(i) for i in folder_items}
    print(f"   {len(folder_items)} items en carpeta destino")

    # 2. Listar items en root
    print("2. Listando items en raiz...")
    root_items = list_root_items(token)
    print(f"   {len(root_items)} items en raiz")

    # 3. Encontrar duplicados (mismo nombre, tipo image)
    duplicates = []
    for item in root_items:
        name = get_item_name(item)
        item_id = get_item_id(item)
        if name and name in folder_names and item.get("type") == "image":
            duplicates.append({"id": item_id, "name": name})

    print(f"\n3. Duplicados encontrados: {len(duplicates)}")

    if not duplicates:
        print("   No hay duplicados. Nada que limpiar.")
        return

    for d in duplicates[:10]:
        print(f"   - {d['name']}")
    if len(duplicates) > 10:
        print(f"   ... y {len(duplicates) - 10} mas")

    # 4. Eliminar
    if args.delete and not args.dry_run:
        print(f"\n4. Eliminando {len(duplicates)} duplicados...")
        deleted = 0
        errors = 0
        for i, d in enumerate(duplicates):
            try:
                api_delete(f"https://api.canva.com/rest/v1/assets/{d['id']}", token)
                deleted += 1
                if (i + 1) % 10 == 0:
                    print(f"   {i+1}/{len(duplicates)} eliminados...")
                time.sleep(0.3)
            except urllib.error.HTTPError as e:
                print(f"   [ERROR] {d['id']}: {e.code} {e.read().decode()[:100]}")
                errors += 1
        print(f"\n   Eliminados: {deleted}")
        print(f"   Errores: {errors}")
    else:
        print(f"\n   Modo dry-run. Usa --delete para eliminar.")


if __name__ == "__main__":
    main()
