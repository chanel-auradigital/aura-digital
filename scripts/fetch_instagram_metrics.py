#!/usr/bin/env python3
"""
Fetch Instagram Business metrics via Meta Graph API.

Uso:
  python fetch_instagram_metrics.py [--client guadalupe-acero] [--days 30]

Requiere en .env (raiz del proyecto):
  META_ACCESS_TOKEN=...
  INSTAGRAM_ACCOUNT_ID=...

Output: JSON con todas las metricas en la carpeta del cliente
  clientes/{client}/08-reportes/instagram-data/
"""

import urllib.request
import json
import os
import sys
from datetime import datetime, timedelta
from pathlib import Path

# ---------------------------------------------------------------------------
# Config
# ---------------------------------------------------------------------------

PROJECT_ROOT = Path(__file__).resolve().parents[1]
DEFAULT_CLIENT = 'guadalupe-acero'
API_VERSION = 'v21.0'
BASE_URL_META = f'https://graph.facebook.com/{API_VERSION}'
BASE_URL_IG = f'https://graph.instagram.com/{API_VERSION}'
BASE_URL = BASE_URL_META  # se actualiza en main() segun el tipo de token


def load_env():
    env_path = PROJECT_ROOT / '.env'
    if not env_path.exists():
        print(f'ERROR: No se encontro .env en {env_path}')
        print('Copia .env.example a .env y agrega tus credenciales de Meta.')
        sys.exit(1)
    env = {}
    with open(env_path, encoding='utf-8') as f:
        for line in f:
            line = line.strip()
            if line and not line.startswith('#') and '=' in line:
                key, value = line.split('=', 1)
                env[key.strip()] = value.strip()
    return env


ENV = load_env()


def get_client_credentials(client_name):
    """
    Busca credenciales por cliente: META_ACCESS_TOKEN_{SUFFIX} / INSTAGRAM_ACCOUNT_ID_{SUFFIX}
    donde SUFFIX es el nombre del cliente en UPPER_SNAKE_CASE.
    Fallback a las claves genericas si no existen las del cliente.
    """
    suffix = client_name.upper().replace('-', '_')
    token = ENV.get(f'META_ACCESS_TOKEN_{suffix}', '') or ENV.get('META_ACCESS_TOKEN', '')
    account_id = ENV.get(f'INSTAGRAM_ACCOUNT_ID_{suffix}', '') or ENV.get('INSTAGRAM_ACCOUNT_ID', '')

    if not token or not account_id:
        print(f'ERROR: No se encontraron credenciales para "{client_name}"')
        print(f'  Buscado: META_ACCESS_TOKEN_{suffix} / INSTAGRAM_ACCOUNT_ID_{suffix}')
        print(f'  Tampoco hay credenciales genericas (META_ACCESS_TOKEN / INSTAGRAM_ACCOUNT_ID)')
        print(f'  Agrega las credenciales en .env')
        sys.exit(1)

    return token, account_id


# Se inicializan en main() segun el cliente seleccionado
ACCESS_TOKEN = ''
IG_ACCOUNT_ID = ''


# ---------------------------------------------------------------------------
# API helpers
# ---------------------------------------------------------------------------

def api_get(endpoint, params=None):
    """GET request to Graph API."""
    params = params or {}
    params['access_token'] = ACCESS_TOKEN
    query = '&'.join(f'{k}={v}' for k, v in params.items())
    url = f'{BASE_URL}/{endpoint}?{query}'
    try:
        req = urllib.request.Request(url)
        with urllib.request.urlopen(req, timeout=30) as r:
            return json.loads(r.read().decode('utf-8'))
    except urllib.error.HTTPError as e:
        body = e.read().decode('utf-8')
        print(f'API Error {e.code}: {body}')
        return None


# ---------------------------------------------------------------------------
# Data fetchers
# ---------------------------------------------------------------------------

def fetch_profile():
    """Basic profile info."""
    fields = 'id,username,name,biography,followers_count,follows_count,media_count,profile_picture_url,website'
    return api_get(IG_ACCOUNT_ID, {'fields': fields})


def fetch_account_insights(days=30):
    """Account-level insights (reach, profile views, etc.)."""
    now = datetime.utcnow()
    since = int((now - timedelta(days=days)).timestamp())
    until = int(now.timestamp())

    # Instagram API (IGAA tokens) soporta estas metricas con period=day
    if ACCESS_TOKEN.startswith('IGAA'):
        day_metrics = ','.join([
            'reach', 'profile_views', 'website_clicks',
            'accounts_engaged', 'follows_and_unfollows',
            'likes', 'comments', 'shares', 'saves',
            'replies', 'total_interactions'
        ])
    else:
        day_metrics = ','.join([
            'reach', 'impressions', 'profile_views',
            'website_clicks', 'accounts_engaged',
            'follows_and_unfollows', 'likes', 'comments',
            'shares', 'saves', 'replies', 'total_interactions'
        ])

    result = api_get(f'{IG_ACCOUNT_ID}/insights', {
        'metric': day_metrics,
        'period': 'day',
        'since': since,
        'until': until
    })
    return result


def fetch_audience_demographics():
    """Audience demographics (lifetime).

    La API requiere llamadas separadas por cada combinacion de metrica + breakdown.
    Breakdowns validos: country, city, age, gender.
    """
    demo_metrics = ['follower_demographics', 'reached_audience_demographics', 'engaged_audience_demographics']
    breakdowns = ['country', 'city', 'age', 'gender']

    results = {}
    for metric in demo_metrics:
        results[metric] = {}
        for breakdown in breakdowns:
            result = api_get(f'{IG_ACCOUNT_ID}/insights', {
                'metric': metric,
                'period': 'lifetime',
                'metric_type': 'total_value',
                'timeframe': 'last_90_days',
                'breakdown': breakdown
            })
            if result and 'data' in result and result['data']:
                entry = result['data'][0]
                tv = entry.get('total_value', {})
                bk_results = []
                for bk in tv.get('breakdowns', []):
                    for r in bk.get('results', []):
                        bk_results.append(r)
                results[metric][breakdown] = bk_results
            else:
                results[metric][breakdown] = []

    return results


def fetch_media(limit=50):
    """Recent media with basic fields."""
    fields = 'id,caption,media_type,media_url,thumbnail_url,permalink,timestamp,like_count,comments_count'
    result = api_get(f'{IG_ACCOUNT_ID}/media', {
        'fields': fields,
        'limit': limit
    })
    return result


def fetch_media_insights(media_id, media_type='IMAGE'):
    """Per-media insights."""
    if ACCESS_TOKEN.startswith('IGAA'):
        # Instagram API: no soporta impressions ni plays
        if media_type in ('VIDEO', 'REELS'):
            metrics = 'reach,likes,comments,shares,saved,total_interactions,views'
        else:
            metrics = 'reach,likes,comments,shares,saved,total_interactions'
    else:
        if media_type in ('VIDEO', 'REELS'):
            metrics = 'reach,impressions,likes,comments,shares,saved,plays,total_interactions'
        elif media_type == 'CAROUSEL_ALBUM':
            metrics = 'reach,impressions,likes,comments,shares,saved,total_interactions'
        else:
            metrics = 'reach,impressions,likes,comments,shares,saved,total_interactions'

    result = api_get(f'{media_id}/insights', {'metric': metrics})
    return result


def fetch_stories_insights(days=7):
    """Recent stories."""
    fields = 'id,caption,media_type,permalink,timestamp'
    result = api_get(f'{IG_ACCOUNT_ID}/stories', {'fields': fields})
    if not result or 'data' not in result:
        return []

    stories = []
    for story in result['data']:
        metrics = api_get(f'{story["id"]}/insights', {
            'metric': 'reach,impressions,replies,taps_forward,taps_back,exits'
        })
        story['insights'] = metrics
        stories.append(story)
    return stories


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------

def main():
    global ACCESS_TOKEN, IG_ACCOUNT_ID, BASE_URL

    import argparse
    parser = argparse.ArgumentParser(description='Fetch Instagram metrics')
    parser.add_argument('--client', default=DEFAULT_CLIENT, help='Client folder name')
    parser.add_argument('--days', type=int, default=30, help='Days of historical data')
    args = parser.parse_args()

    ACCESS_TOKEN, IG_ACCOUNT_ID = get_client_credentials(args.client)

    # Tokens IGAA usan graph.instagram.com, tokens EAA usan graph.facebook.com
    if ACCESS_TOKEN.startswith('IGAA'):
        BASE_URL = BASE_URL_IG
        print(f'Cliente: {args.client} (Instagram API)')
    else:
        BASE_URL = BASE_URL_META
        print(f'Cliente: {args.client} (Meta Graph API)')

    output_dir = PROJECT_ROOT / 'clientes' / args.client / '08-reportes' / 'instagram-data'
    output_dir.mkdir(parents=True, exist_ok=True)

    timestamp = datetime.utcnow().strftime('%Y-%m-%d')
    data = {
        'fetch_date': timestamp,
        'days_requested': args.days,
        'client': args.client,
    }

    # 1. Profile
    print('Fetching profile...')
    data['profile'] = fetch_profile()

    # 2. Account insights
    print(f'Fetching account insights ({args.days} days)...')
    data['account_insights'] = fetch_account_insights(args.days)

    # 3. Demographics
    print('Fetching audience demographics...')
    data['demographics'] = fetch_audience_demographics()

    # 4. Media
    print('Fetching recent media...')
    media_result = fetch_media(limit=50)
    media_list = media_result.get('data', []) if media_result else []

    # 5. Per-media insights
    print(f'Fetching insights for {len(media_list)} posts...')
    for i, m in enumerate(media_list):
        insights = fetch_media_insights(m['id'], m.get('media_type', 'IMAGE'))
        m['insights'] = insights
        if (i + 1) % 10 == 0:
            print(f'  {i + 1}/{len(media_list)}...')
    data['media'] = media_list

    # 6. Stories
    print('Fetching stories...')
    data['stories'] = fetch_stories_insights()

    # Save
    output_file = output_dir / f'instagram-metrics-{timestamp}.json'
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2, ensure_ascii=False, default=str)

    print(f'\nGuardado: {output_file}')
    print(f'Profile: @{data["profile"].get("username", "?")} | '
          f'{data["profile"].get("followers_count", "?")} followers | '
          f'{data["profile"].get("media_count", "?")} posts')

    # Also save a latest symlink / copy for easy access
    latest_file = output_dir / 'latest.json'
    with open(latest_file, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2, ensure_ascii=False, default=str)
    print(f'Copia: {latest_file}')


if __name__ == '__main__':
    main()
