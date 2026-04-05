#!/usr/bin/env python3
"""
Renueva el Meta long-lived token antes de que expire (60 dias).
Ejecutar cada ~55 dias.

Uso:
  python renew_meta_token.py

Lee META_ACCESS_TOKEN, META_APP_ID, META_APP_SECRET de .env
Imprime el nuevo token para que lo copies a .env manualmente.
"""

import urllib.request
import json
import sys
from pathlib import Path

PROJECT_ROOT = Path(__file__).resolve().parents[1]


def load_env():
    env_path = PROJECT_ROOT / '.env'
    env = {}
    with open(env_path, encoding='utf-8') as f:
        for line in f:
            line = line.strip()
            if line and not line.startswith('#') and '=' in line:
                key, value = line.split('=', 1)
                env[key.strip()] = value.strip()
    return env


def main():
    import argparse
    parser = argparse.ArgumentParser(description='Renew Meta long-lived token')
    parser.add_argument('--client', default=None, help='Client folder name (e.g. chanel-de-la-rosa). Si no se indica, usa META_ACCESS_TOKEN generico.')
    args = parser.parse_args()

    env = load_env()
    app_id = env.get('META_APP_ID', '')
    app_secret = env.get('META_APP_SECRET', '')

    if args.client:
        suffix = args.client.upper().replace('-', '_')
        token_key = f'META_ACCESS_TOKEN_{suffix}'
        current_token = env.get(token_key, '')
        if not current_token:
            print(f'ERROR: {token_key} no definido en .env')
            sys.exit(1)
        print(f'Renovando token para cliente: {args.client} ({token_key})')
    else:
        token_key = 'META_ACCESS_TOKEN'
        current_token = env.get('META_ACCESS_TOKEN', '')

    if not all([app_id, app_secret, current_token]):
        print(f'ERROR: META_APP_ID, META_APP_SECRET y {token_key} deben estar en .env')
        sys.exit(1)

    url = (
        f'https://graph.facebook.com/v21.0/oauth/access_token?'
        f'grant_type=fb_exchange_token&'
        f'client_id={app_id}&'
        f'client_secret={app_secret}&'
        f'fb_exchange_token={current_token}'
    )

    try:
        req = urllib.request.Request(url)
        with urllib.request.urlopen(req, timeout=30) as r:
            result = json.loads(r.read().decode('utf-8'))
    except urllib.error.HTTPError as e:
        body = e.read().decode('utf-8')
        print(f'Error {e.code}: {body}')
        sys.exit(1)

    new_token = result.get('access_token', '')
    expires_in = result.get('expires_in', 0)
    days = expires_in // 86400

    if new_token:
        print(f'Nuevo token obtenido (expira en {days} dias)')
        print(f'\n{token_key}={new_token}')
        print(f'\nCopia la linea de arriba y reemplazala en .env')
    else:
        print(f'Respuesta inesperada: {result}')
        sys.exit(1)


if __name__ == '__main__':
    main()
