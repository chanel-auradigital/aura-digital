"""
Fetch Instagram data for all clients and store in Supabase.
Extracts: profile info, all posts, per-post metrics.
"""
import json
import urllib.request
import psycopg2
import sys
from datetime import datetime

# Supabase DB
DB = dict(
    host='aws-0-eu-west-1.pooler.supabase.com',
    port=6543,
    dbname='postgres',
    user='postgres.ixjeoplobqqckqhxisoo',
    password='@5RJk2gh,@b7qS7'
)

# Client configs: (slug, ig_account_id, access_token)
CLIENTS = [
    (
        'chanel-de-la-rosa',
        '26061463690190519',
        'IGAAVIT4SFKpZABZAFl0NFJtd0tUcVBRQVRkdThSM25JVGFGTV9OdFQ0QkRrTFNBX21vNVBsZAHFFTjdvZA3d2VGt0R3pmbzRKZA1MzVTlyVEpsWFNEVF9aV1dGODJIVE93NE9DeEhsbHZA0WktoaVRxSXZABWFJqcGpYLVRvalo2WnpNVQZDZD'
    ),
    (
        'maria-jose',
        '26686366784320409',
        'IGAAUZBe8VqouVBZAGIyOUN2MUxsLVBfdXR1cWh0Y0F4ZADlCQ2YzN3ZA1d2ZA2MEhMNlZA4dHAza3ZAkcmJHUzlwYTlDbkRBdlNOMVZAxUWptMzZAEWHNRbUJoajhDNXdZAN20tNElFcTZAMTm8zUDRLT3RZAelNhbUJkd1N4U0Yxa09ILVE0YwZDZD'
    ),
    (
        'guadalupe-acero',
        '26806995438892448',
        'IGAAfWZAOCYZAfNBZAGFfaVlxaWlQRUwza3ZAEZAFAyU0pzSTBCUzl6VEFOY2ZAuOHdJWE5Xc0w2M3JIMkFYV1dLTWh0MWRncXZAtU2toWm1wNVZAkQ2Q3SGN1cWd2WTYzUVhycXotS28wT3lQN1hPaXRUU0VyUkNZAZA2tUOFRoRTlLeld5awZDZD'
    ),
]

GRAPH_URL = 'https://graph.instagram.com/v22.0'


def api_get(url):
    """Fetch JSON from Instagram Graph API."""
    req = urllib.request.Request(url)
    try:
        resp = urllib.request.urlopen(req, timeout=30)
        return json.loads(resp.read().decode())
    except urllib.error.HTTPError as e:
        body = e.read().decode()
        print(f'  API Error {e.code}: {body[:200]}')
        return None


def fetch_profile(account_id, token):
    """Get profile info."""
    fields = 'id,username,name,biography,profile_picture_url,followers_count,follows_count,media_count,website'
    url = f'{GRAPH_URL}/{account_id}?fields={fields}&access_token={token}'
    return api_get(url)


def fetch_all_media(account_id, token):
    """Get all media with pagination."""
    fields = 'id,media_type,media_url,thumbnail_url,permalink,caption,timestamp,like_count,comments_count'
    url = f'{GRAPH_URL}/{account_id}/media?fields={fields}&limit=50&access_token={token}'

    all_media = []
    page = 1
    while url:
        print(f'  Fetching media page {page}...')
        data = api_get(url)
        if not data:
            break
        all_media.extend(data.get('data', []))
        url = data.get('paging', {}).get('next')
        page += 1

    return all_media


def fetch_media_insights(media_id, token, media_type):
    """Get insights for a single media item."""
    if media_type == 'VIDEO' or media_type == 'REEL':
        metrics = 'reach,impressions,saved,shares,total_interactions,plays,likes,comments'
    elif media_type == 'CAROUSEL_ALBUM':
        metrics = 'reach,impressions,saved,shares,total_interactions,likes,comments'
    else:
        metrics = 'reach,impressions,saved,shares,total_interactions,likes,comments'

    url = f'{GRAPH_URL}/{media_id}/insights?metric={metrics}&access_token={token}'
    data = api_get(url)

    result = {}
    if data and 'data' in data:
        for item in data['data']:
            name = item['name']
            value = item['values'][0]['value'] if item.get('values') else item.get('total_value', {}).get('value', 0)
            result[name] = value

    return result


def process_client(slug, account_id, token, cur):
    """Process one client: fetch profile + all posts + insights."""
    print(f'\n{"="*60}')
    print(f'Processing: {slug}')
    print(f'{"="*60}')

    # Get client_id from DB
    cur.execute("SELECT id FROM clients WHERE slug = %s", (slug,))
    row = cur.fetchone()
    if not row:
        print(f'  ERROR: Client {slug} not found in DB')
        return
    client_id = row[0]

    # 1. Fetch and store profile
    print('  Fetching profile...')
    profile = fetch_profile(account_id, token)
    if profile:
        cur.execute('''
            UPDATE instagram_profiles SET
                username = %s, name = %s, biography = %s,
                profile_picture_url = %s, followers_count = %s,
                follows_count = %s, media_count = %s, website = %s,
                updated_at = now()
            WHERE client_id = %s
        ''', (
            profile.get('username'), profile.get('name'),
            profile.get('biography'), profile.get('profile_picture_url'),
            profile.get('followers_count', 0), profile.get('follows_count', 0),
            profile.get('media_count', 0), profile.get('website'),
            client_id
        ))
        print(f'  Profile: @{profile.get("username")} | {profile.get("followers_count", 0)} followers | {profile.get("media_count", 0)} posts')

        # Store today's daily metrics
        cur.execute('''
            INSERT INTO instagram_daily_metrics (client_id, date, followers_count, follows_count, media_count)
            VALUES (%s, CURRENT_DATE, %s, %s, %s)
            ON CONFLICT (client_id, date) DO UPDATE SET
                followers_count = EXCLUDED.followers_count,
                follows_count = EXCLUDED.follows_count,
                media_count = EXCLUDED.media_count
        ''', (client_id, profile.get('followers_count', 0), profile.get('follows_count', 0), profile.get('media_count', 0)))

    # 2. Fetch all media
    print('  Fetching all posts...')
    media_list = fetch_all_media(account_id, token)
    print(f'  Found {len(media_list)} posts')

    # 3. For each post, get insights and store
    for i, media in enumerate(media_list):
        media_id = media['id']
        media_type = media.get('media_type', 'IMAGE')

        # Get insights
        insights = fetch_media_insights(media_id, token, media_type)

        ts = media.get('timestamp')
        if ts:
            ts = ts.replace('+0000', '+00:00') if '+0000' in ts else ts

        cur.execute('''
            INSERT INTO instagram_posts (
                client_id, ig_media_id, media_type, media_url, thumbnail_url,
                permalink, caption, timestamp, like_count, comments_count,
                shares_count, saves_count, reach, impressions, engagement
            ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
            ON CONFLICT (ig_media_id) DO UPDATE SET
                like_count = EXCLUDED.like_count,
                comments_count = EXCLUDED.comments_count,
                shares_count = EXCLUDED.shares_count,
                saves_count = EXCLUDED.saves_count,
                reach = EXCLUDED.reach,
                impressions = EXCLUDED.impressions,
                engagement = EXCLUDED.engagement
        ''', (
            client_id, media_id, media_type,
            media.get('media_url'), media.get('thumbnail_url'),
            media.get('permalink'), media.get('caption'),
            ts,
            insights.get('likes', media.get('like_count', 0)),
            insights.get('comments', media.get('comments_count', 0)),
            insights.get('shares', 0),
            insights.get('saved', 0),
            insights.get('reach', 0),
            insights.get('impressions', 0),
            insights.get('total_interactions', 0)
        ))

        if (i + 1) % 10 == 0 or i == len(media_list) - 1:
            print(f'  Stored {i + 1}/{len(media_list)} posts')

    print(f'  Done! {len(media_list)} posts stored for {slug}')


def main():
    conn = psycopg2.connect(**DB)
    conn.autocommit = True
    cur = conn.cursor()

    for slug, account_id, token in CLIENTS:
        try:
            process_client(slug, account_id, token, cur)
        except Exception as e:
            print(f'  ERROR processing {slug}: {e}')

    cur.close()
    conn.close()
    print('\n\nAll done!')


if __name__ == '__main__':
    main()
