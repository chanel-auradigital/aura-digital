#!/usr/bin/env python3
"""
HTML → PNG → Canva

Convierte un archivo HTML a imagen PNG y opcionalmente lo sube a Canva.

Uso:
    # Solo convertir a PNG
    python scripts/html_to_canva.py ruta/al/archivo.html

    # Convertir y subir a Canva
    python scripts/html_to_canva.py ruta/al/archivo.html --upload

    # Especificar tamaño personalizado
    python scripts/html_to_canva.py ruta/al/archivo.html --width 1080 --height 1350

    # Especificar nombre del archivo de salida
    python scripts/html_to_canva.py ruta/al/archivo.html -o portada.png

Requisitos:
    pip install playwright
    playwright install chromium
    CANVA_ACCESS_TOKEN en .env (para --upload)
"""

import argparse
import json
import os
import sys
import urllib.request
import urllib.error
from pathlib import Path


def load_env():
    env_path = Path(__file__).parent.parent / ".env"
    env = {}
    if env_path.exists():
        with open(env_path) as f:
            for line in f:
                line = line.strip()
                if line and not line.startswith("#") and "=" in line:
                    key, val = line.split("=", 1)
                    env[key.strip()] = val.strip()
    return env


def html_to_png(html_path, output_path, width=1080, height=1350):
    """Renderiza HTML a PNG usando Playwright."""
    from playwright.sync_api import sync_playwright

    html_path = Path(html_path).resolve()
    output_path = Path(output_path).resolve()

    if not html_path.exists():
        print(f"[ERROR] No se encontro: {html_path}")
        sys.exit(1)

    print(f"  Renderizando {html_path.name}...")
    print(f"  Tamano: {width}x{height}px")

    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page(viewport={"width": width, "height": height})
        page.goto(f"file:///{html_path}", wait_until="networkidle")

        # Esperar a que las fuentes de Google carguen
        page.wait_for_timeout(2000)

        # Buscar el contenedor principal para hacer screenshot solo de ese elemento
        # Intenta encontrar .reel-cover, .page, o body
        for selector in [".reel-cover", ".page", "body"]:
            el = page.query_selector(selector)
            if el:
                el.screenshot(path=str(output_path))
                break

        browser.close()

    size_kb = output_path.stat().st_size / 1024
    print(f"  PNG guardado: {output_path} ({size_kb:.0f} KB)")
    return output_path


def upload_to_canva(png_path, name=None):
    """Sube un asset a Canva via API."""
    import base64 as b64mod

    env = load_env()
    token = env.get("CANVA_ACCESS_TOKEN", "")

    if not token:
        print("[ERROR] CANVA_ACCESS_TOKEN no encontrado en .env")
        print("  Ejecuta: python scripts/canva_auth.py")
        sys.exit(1)

    png_path = Path(png_path)
    if not name:
        name = png_path.stem

    print(f"\n  Subiendo a Canva como '{name}'...")

    file_data = png_path.read_bytes()
    metadata = json.dumps({"name_base64": b64mod.b64encode(name.encode()).decode()})

    req = urllib.request.Request(
        "https://api.canva.com/rest/v1/asset-uploads",
        data=file_data,
        headers={
            "Authorization": f"Bearer {token}",
            "Content-Type": "application/octet-stream",
            "Asset-Upload-Metadata": metadata,
        },
        method="POST",
    )

    try:
        with urllib.request.urlopen(req) as resp:
            result = json.loads(resp.read().decode())
            job = result.get("job", {})
            job_id = job.get("id", "?")
            status = job.get("status", "?")
            print(f"  Upload iniciado. Job ID: {job_id} (status: {status})")
            print(f"  El asset aparecera en tu cuenta de Canva en unos segundos.")
            return result
    except urllib.error.HTTPError as e:
        err_body = e.read().decode()
        print(f"[ERROR] Upload fallo ({e.code}):")
        print(f"  {err_body}")

        if e.code == 401:
            print("\n  Token expirado. Ejecuta: python scripts/canva_auth.py")
        elif e.code == 403:
            print("\n  Scope 'asset:write' no habilitado en tu app de Canva.")
            print("  Ve a https://www.canva.com/developers y activa el scope.")
        return None


def refresh_token_if_needed():
    """Intenta renovar el token si hay refresh_token disponible."""
    import base64 as b64mod
    import urllib.parse

    env = load_env()
    refresh = env.get("CANVA_REFRESH_TOKEN", "")
    client_id = env.get("CANVA_CLIENT_ID", "")
    client_secret = env.get("CANVA_CLIENT_SECRET", "")

    if not all([refresh, client_id, client_secret]):
        return False

    credentials = b64mod.b64encode(f"{client_id}:{client_secret}".encode()).decode()

    data = urllib.parse.urlencode({
        "grant_type": "refresh_token",
        "refresh_token": refresh,
    }).encode()

    req = urllib.request.Request(
        "https://api.canva.com/rest/v1/oauth/token",
        data=data,
        headers={
            "Content-Type": "application/x-www-form-urlencoded",
            "Authorization": f"Basic {credentials}",
        },
    )

    try:
        with urllib.request.urlopen(req) as resp:
            result = json.loads(resp.read().decode())
            new_token = result.get("access_token", "")
            new_refresh = result.get("refresh_token", refresh)
            if new_token:
                # Save to .env
                env_path = Path(__file__).parent.parent / ".env"
                lines = env_path.read_text().splitlines(keepends=True)
                new_lines = []
                for line in lines:
                    if line.strip().startswith("CANVA_ACCESS_TOKEN="):
                        new_lines.append(f"CANVA_ACCESS_TOKEN={new_token}\n")
                    elif line.strip().startswith("CANVA_REFRESH_TOKEN="):
                        new_lines.append(f"CANVA_REFRESH_TOKEN={new_refresh}\n")
                    else:
                        new_lines.append(line)
                env_path.write_text("".join(new_lines))
                print("  Token renovado automaticamente.")
                return True
    except Exception:
        pass
    return False


def main():
    parser = argparse.ArgumentParser(
        description="Convierte HTML a PNG y opcionalmente sube a Canva"
    )
    parser.add_argument("html", help="Ruta al archivo HTML")
    parser.add_argument("-o", "--output", help="Ruta del PNG de salida")
    parser.add_argument("--width", type=int, default=1080, help="Ancho en px (default: 1080)")
    parser.add_argument("--height", type=int, default=1350, help="Alto en px (default: 1350)")
    parser.add_argument("--upload", action="store_true", help="Subir a Canva despues de convertir")
    parser.add_argument("--name", help="Nombre del asset en Canva")

    args = parser.parse_args()

    html_path = Path(args.html)
    if not args.output:
        output_path = html_path.with_suffix(".png")
    else:
        output_path = Path(args.output)

    print(f"\n=== HTML to PNG {'+ Canva' if args.upload else ''} ===\n")

    # 1. Render
    png = html_to_png(html_path, output_path, args.width, args.height)

    # 2. Upload (optional)
    if args.upload:
        result = upload_to_canva(png, name=args.name or html_path.stem)
        if result is None:
            print("\n  Intentando renovar token...")
            if refresh_token_if_needed():
                upload_to_canva(png, name=args.name or html_path.stem)

    print("\n  Listo.\n")


if __name__ == "__main__":
    main()
