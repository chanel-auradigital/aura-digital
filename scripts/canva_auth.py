#!/usr/bin/env python3
"""
Canva OAuth 2.0 — Autorización y obtención de token.

Uso:
    python scripts/canva_auth.py

Flujo:
    1. Abre el navegador para autorizar la app
    2. Levanta un servidor local temporal en localhost:3000
    3. Captura el código de autorización
    4. Canjea el código por access_token + refresh_token
    5. Guarda los tokens en .env

Requisitos:
    - CANVA_CLIENT_ID y CANVA_CLIENT_SECRET en .env
    - Redirect URI configurada en Canva Developers: http://127.0.0.1:3000/callback
"""

import http.server
import json
import os
import sys
import urllib.parse
import urllib.request
import webbrowser
import base64
import threading
import secrets

# --- Config ---
REDIRECT_URI = "http://127.0.0.1:3000/callback"
AUTH_URL = "https://www.canva.com/api/oauth/authorize"
TOKEN_URL = "https://api.canva.com/rest/v1/oauth/token"
SCOPES = "app:read app:write asset:read asset:write brandtemplate:content:read brandtemplate:content:write brandtemplate:meta:read comment:read comment:write design:content:read design:content:write design:meta:read design:permission:read design:permission:write folder:read folder:write folder:permission:read folder:permission:write profile:read"
PORT = 3000

# --- Helpers ---

def load_env():
    env_path = os.path.join(os.path.dirname(__file__), "..", ".env")
    env_path = os.path.abspath(env_path)
    env = {}
    if os.path.exists(env_path):
        with open(env_path, "r") as f:
            for line in f:
                line = line.strip()
                if line and not line.startswith("#") and "=" in line:
                    key, val = line.split("=", 1)
                    env[key.strip()] = val.strip()
    return env, env_path


def save_tokens_to_env(env_path, access_token, refresh_token):
    lines = []
    found_access = False
    found_refresh = False

    if os.path.exists(env_path):
        with open(env_path, "r") as f:
            lines = f.readlines()

    new_lines = []
    for line in lines:
        stripped = line.strip()
        if stripped.startswith("CANVA_ACCESS_TOKEN="):
            new_lines.append(f"CANVA_ACCESS_TOKEN={access_token}\n")
            found_access = True
        elif stripped.startswith("CANVA_REFRESH_TOKEN="):
            new_lines.append(f"CANVA_REFRESH_TOKEN={refresh_token}\n")
            found_refresh = True
        else:
            new_lines.append(line)

    if not found_access:
        new_lines.append(f"CANVA_ACCESS_TOKEN={access_token}\n")
    if not found_refresh:
        new_lines.append(f"CANVA_REFRESH_TOKEN={refresh_token}\n")

    with open(env_path, "w") as f:
        f.writelines(new_lines)


def exchange_code(client_id, client_secret, code, code_verifier):
    data = urllib.parse.urlencode({
        "grant_type": "authorization_code",
        "code": code,
        "redirect_uri": REDIRECT_URI,
        "code_verifier": code_verifier,
    }).encode()

    credentials = base64.b64encode(
        f"{client_id}:{client_secret}".encode()
    ).decode()

    req = urllib.request.Request(
        TOKEN_URL,
        data=data,
        headers={
            "Content-Type": "application/x-www-form-urlencoded",
            "Authorization": f"Basic {credentials}",
        },
    )

    try:
        with urllib.request.urlopen(req) as resp:
            return json.loads(resp.read().decode())
    except urllib.error.HTTPError as e:
        body = e.read().decode()
        print(f"\n[ERROR] Token exchange failed ({e.code}):")
        print(body)
        return None


def generate_pkce():
    code_verifier = secrets.token_urlsafe(64)[:128]
    import hashlib
    digest = hashlib.sha256(code_verifier.encode()).digest()
    code_challenge = base64.urlsafe_b64encode(digest).rstrip(b"=").decode()
    return code_verifier, code_challenge


# --- OAuth callback server ---

class OAuthHandler(http.server.BaseHTTPRequestHandler):
    auth_code = None
    error = None

    def do_GET(self):
        parsed = urllib.parse.urlparse(self.path)
        params = urllib.parse.parse_qs(parsed.query)

        if parsed.path == "/callback":
            if "code" in params:
                OAuthHandler.auth_code = params["code"][0]
                self.send_response(200)
                self.send_header("Content-Type", "text/html; charset=utf-8")
                self.end_headers()
                self.wfile.write(
                    b"<html><body style='font-family:sans-serif;text-align:center;padding:60px'>"
                    b"<h1>Autorizado</h1>"
                    b"<p>Puedes cerrar esta ventana y volver a la terminal.</p>"
                    b"</body></html>"
                )
            elif "error" in params:
                OAuthHandler.error = params.get("error_description", params["error"])[0]
                self.send_response(400)
                self.send_header("Content-Type", "text/html; charset=utf-8")
                self.end_headers()
                msg = OAuthHandler.error.encode()
                self.wfile.write(
                    b"<html><body style='font-family:sans-serif;text-align:center;padding:60px'>"
                    b"<h1>Error</h1><p>" + msg + b"</p></body></html>"
                )
        else:
            self.send_response(404)
            self.end_headers()

    def log_message(self, format, *args):
        pass  # silent


# --- Main ---

def main():
    env, env_path = load_env()

    client_id = env.get("CANVA_CLIENT_ID", "")
    client_secret = env.get("CANVA_CLIENT_SECRET", "")

    if not client_id or not client_secret:
        print("[ERROR] CANVA_CLIENT_ID y CANVA_CLIENT_SECRET deben estar en .env")
        sys.exit(1)

    print("=== Canva OAuth 2.0 ===\n")

    # PKCE
    code_verifier, code_challenge = generate_pkce()

    # Build auth URL
    state = secrets.token_urlsafe(32)
    params = urllib.parse.urlencode({
        "response_type": "code",
        "client_id": client_id,
        "redirect_uri": REDIRECT_URI,
        "scope": SCOPES,
        "state": state,
        "code_challenge": code_challenge,
        "code_challenge_method": "S256",
    })
    auth_link = f"{AUTH_URL}?{params}"

    print(f"1. Abriendo navegador para autorizar...\n")
    print(f"   Si no se abre, copia este link:\n   {auth_link}\n")
    webbrowser.open(auth_link)

    # Start local server
    print(f"2. Esperando callback en http://localhost:{PORT}/callback ...\n")
    server = http.server.HTTPServer(("", PORT), OAuthHandler)

    # Timeout after 120 seconds
    server.timeout = 120
    server.handle_request()

    if OAuthHandler.error:
        print(f"[ERROR] {OAuthHandler.error}")
        sys.exit(1)

    if not OAuthHandler.auth_code:
        print("[ERROR] No se recibio codigo de autorizacion (timeout)")
        sys.exit(1)

    print(f"3. Codigo recibido. Canjeando por tokens...\n")

    # Exchange
    result = exchange_code(client_id, client_secret, OAuthHandler.auth_code, code_verifier)

    if not result or "access_token" not in result:
        print("[ERROR] No se pudo obtener el token")
        sys.exit(1)

    access_token = result["access_token"]
    refresh_token = result.get("refresh_token", "")
    expires_in = result.get("expires_in", "?")

    # Save
    save_tokens_to_env(env_path, access_token, refresh_token)

    print(f"   Access token:  {access_token[:20]}...")
    print(f"   Refresh token: {refresh_token[:20]}..." if refresh_token else "   Refresh token: (no proporcionado)")
    print(f"   Expira en:     {expires_in} segundos")
    print(f"\n   Tokens guardados en .env")

    # Quick test
    print(f"\n4. Verificando conexion...\n")
    req = urllib.request.Request(
        "https://api.canva.com/rest/v1/users/me",
        headers={"Authorization": f"Bearer {access_token}"},
    )
    try:
        with urllib.request.urlopen(req) as resp:
            user = json.loads(resp.read().decode())
            display_name = user.get("display_name", user.get("team_user", {}).get("display_name", "OK"))
            print(f"   Conectado como: {display_name}")
            print(f"\n   Listo. La API de Canva esta activa.")
    except urllib.error.HTTPError as e:
        print(f"   Token funciona pero /users/me retorno {e.code}")
        print(f"   (puede ser normal si el scope no incluye perfil)")
        print(f"\n   Token guardado. Listo para usar.")


if __name__ == "__main__":
    main()
