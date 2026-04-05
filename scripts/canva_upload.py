#!/usr/bin/env python3
"""
Canva Upload — Sube assets y los mueve a una carpeta.

Uso:
    python scripts/canva_upload.py <FOLDER_ID> <archivo1> [archivo2] ...

Ejemplo:
    python scripts/canva_upload.py FAHFwJ5_cG8 foto1.jpg foto2.png

Notas:
    - Lee CANVA_ACCESS_TOKEN, CANVA_REFRESH_TOKEN, CANVA_CLIENT_ID y
      CANVA_CLIENT_SECRET desde .env (raiz del proyecto)
    - Si el token expiro, lo refresca automaticamente y actualiza .env
    - Rate limit: 30 uploads/min, el script espera 1s entre cada uno
    - Videos no se pueden mover a carpetas (limitacion de la API)
"""

import base64
import json
import os
import sys
import time
import urllib.request
import urllib.error

ENV_PATH = os.path.join(os.path.dirname(__file__), "..", ".env")
ENV_PATH = os.path.abspath(ENV_PATH)
API = "https://api.canva.com/rest/v1"


def load_env():
    env = {}
    if os.path.exists(ENV_PATH):
        with open(ENV_PATH, "r") as f:
            for line in f:
                line = line.strip()
                if line and not line.startswith("#") and "=" in line:
                    key, val = line.split("=", 1)
                    env[key.strip()] = val.strip()
    return env


def save_tokens(access_token, refresh_token):
    lines = open(ENV_PATH).readlines()
    new = []
    for l in lines:
        if l.startswith("CANVA_ACCESS_TOKEN="):
            new.append(f"CANVA_ACCESS_TOKEN={access_token}\n")
        elif l.startswith("CANVA_REFRESH_TOKEN="):
            new.append(f"CANVA_REFRESH_TOKEN={refresh_token}\n")
        else:
            new.append(l)
    open(ENV_PATH, "w").writelines(new)


def refresh_token(env):
    cid = env["CANVA_CLIENT_ID"]
    csec = env["CANVA_CLIENT_SECRET"]
    rt = env["CANVA_REFRESH_TOKEN"]
    creds = base64.b64encode(f"{cid}:{csec}".encode()).decode()
    data = f"grant_type=refresh_token&refresh_token={rt}".encode()
    req = urllib.request.Request(
        f"{API}/oauth/token",
        data=data,
        headers={
            "Content-Type": "application/x-www-form-urlencoded",
            "Authorization": f"Basic {creds}",
        },
    )
    with urllib.request.urlopen(req) as resp:
        r = json.loads(resp.read().decode())
    save_tokens(r["access_token"], r["refresh_token"])
    return r["access_token"]


def get_valid_token():
    env = load_env()
    token = env.get("CANVA_ACCESS_TOKEN", "")
    # Test token
    req = urllib.request.Request(
        f"{API}/users/me",
        headers={"Authorization": f"Bearer {token}"},
    )
    try:
        with urllib.request.urlopen(req) as resp:
            resp.read()
        return token
    except urllib.error.HTTPError:
        print("  Token expirado, refrescando...")
        try:
            new_token = refresh_token(env)
            print("  Token refrescado OK")
            return new_token
        except Exception as e:
            print(f"  ERROR refresh: {e}")
            print("  Ejecuta: python scripts/canva_auth.py")
            sys.exit(1)


def upload_and_move(filepath, folder_id, token):
    name = os.path.basename(filepath)
    name_b64 = base64.b64encode(name.encode()).decode()

    with open(filepath, "rb") as f:
        data = f.read()

    metadata = json.dumps({"name_base64": name_b64})
    req = urllib.request.Request(
        f"{API}/asset-uploads",
        data=data,
        headers={
            "Authorization": f"Bearer {token}",
            "Content-Type": "application/octet-stream",
            "Asset-Upload-Metadata": metadata,
        },
    )

    try:
        with urllib.request.urlopen(req) as resp:
            result = json.loads(resp.read().decode())
    except urllib.error.HTTPError as e:
        body = e.read().decode()
        print(f"  ERROR upload {name}: {e.code} - {body[:100]}")
        return False

    job = result.get("job", {})
    job_id = job.get("id", "")
    status = job.get("status", "")
    asset_id = None

    for _ in range(30):
        if status == "success":
            asset_id = job.get("asset", {}).get("id")
            break
        elif status == "failed":
            print(f"  ERROR job failed: {name}")
            return False
        time.sleep(2)
        try:
            req2 = urllib.request.Request(
                f"{API}/asset-uploads/{job_id}",
                headers={"Authorization": f"Bearer {token}"},
            )
            with urllib.request.urlopen(req2) as resp2:
                job = json.loads(resp2.read().decode()).get("job", {})
                status = job.get("status", "")
                asset_id = job.get("asset", {}).get("id")
        except urllib.error.HTTPError:
            pass

    if not asset_id:
        print(f"  ERROR no asset_id: {name}")
        return False

    # Move to folder
    move_data = json.dumps({"to_folder_id": folder_id, "item_id": asset_id}).encode()
    req3 = urllib.request.Request(
        f"{API}/folders/move",
        data=move_data,
        headers={
            "Authorization": f"Bearer {token}",
            "Content-Type": "application/json",
        },
    )
    try:
        with urllib.request.urlopen(req3) as resp3:
            pass
        print(f"  OK: {name}")
        return True
    except urllib.error.HTTPError as e:
        print(f"  UPLOADED (move fail): {name}")
        return True


if __name__ == "__main__":
    if len(sys.argv) < 3:
        print("Uso: python scripts/canva_upload.py <FOLDER_ID> <archivo1> [archivo2] ...")
        sys.exit(1)

    folder_id = sys.argv[1]
    files = sys.argv[2:]

    token = get_valid_token()

    ok = 0
    total = 0
    for f in files:
        if os.path.isfile(f) and not f.endswith("desktop.ini"):
            total += 1
            if upload_and_move(f, folder_id, token):
                ok += 1
            time.sleep(1)

    print(f"\n  Total: {ok}/{total}")
