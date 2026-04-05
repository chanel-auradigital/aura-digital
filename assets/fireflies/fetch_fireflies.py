"""
Descarga transcripciones de Fireflies y las guarda como .md

Uso:
  py fetch_fireflies.py --output <carpeta> [--ids ID1 ID2 ...] [--filter texto]
  py fetch_fireflies.py --list                 # lista todos los transcripts
  py fetch_fireflies.py --list --filter guadalupe  # filtra por titulo

Env vars requeridas en .env (raiz del proyecto):
  FIREFLIES_API_KEY=tu-api-key
"""
import urllib.request
import json
import os
import sys
import argparse
from datetime import datetime, timezone
from pathlib import Path


def load_env():
    env_path = Path(__file__).resolve().parents[2] / '.env'
    if not env_path.exists():
        raise FileNotFoundError(
            f'No se encontro .env en {env_path}. '
            'Copia .env.example a .env y agrega tu API key.'
        )
    env = {}
    with open(env_path, encoding='utf-8') as f:
        for line in f:
            line = line.strip()
            if line and not line.startswith('#') and '=' in line:
                key, value = line.split('=', 1)
                env[key.strip()] = value.strip()
    return env


_env = load_env()
API_KEY = _env.get('FIREFLIES_API_KEY')
if not API_KEY:
    raise ValueError('FIREFLIES_API_KEY no definida en .env')

URL = 'https://api.fireflies.ai/graphql'


def gql(payload):
    data = json.dumps(payload).encode('utf-8')
    req = urllib.request.Request(
        URL,
        data=data,
        headers={
            'Content-Type': 'application/json',
            'Authorization': f'Bearer {API_KEY}'
        }
    )
    with urllib.request.urlopen(req, timeout=30) as r:
        return json.loads(r.read().decode('utf-8'))


def list_transcripts(filter_text=None):
    result = gql({"query": "{ transcripts { id title date duration participants } }"})
    transcripts = result['data']['transcripts']
    if filter_text:
        filter_text = filter_text.lower()
        transcripts = [t for t in transcripts if filter_text in t['title'].lower()]
    return transcripts


def fetch_transcript(tid):
    payload = {
        "query": """
        query GetTranscript($id: String!) {
          transcript(id: $id) {
            id title date duration participants
            summary { overview action_items keywords }
            sentences { speaker_name text start_time }
          }
        }
        """,
        "variables": {"id": tid}
    }
    result = gql(payload)
    return result['data']['transcript']


def format_time(ms):
    s = int(ms / 1000)
    m, s = divmod(s, 60)
    return f"{m:02d}:{s:02d}"


def slugify(text):
    return (text.lower()
            .replace(' ', '-')
            .replace('á', 'a').replace('é', 'e')
            .replace('í', 'i').replace('ó', 'o')
            .replace('ú', 'u'))


def to_md(t):
    date_str = datetime.fromtimestamp(t['date'] / 1000, tz=timezone.utc).strftime('%Y-%m-%d')
    duration_min = round(t['duration'])
    participants = ', '.join(t.get('participants') or [])

    summary = t.get('summary') or {}
    overview = summary.get('overview') or ''
    action_items = summary.get('action_items') or []
    keywords = summary.get('keywords') or []

    lines = [
        '---',
        f'titulo: {t["title"]}',
        f'fecha: {date_str}',
        f'duracion: {duration_min} min',
        f'participantes: {participants}',
        f'fuente: fireflies',
        f'id: {t["id"]}',
        '---', '',
        f'# {t["title"]} — {date_str}', '',
    ]

    if overview:
        lines += ['## Resumen', '', overview, '']

    if keywords:
        lines += ['## Palabras clave', '', ', '.join(keywords), '']

    if action_items:
        lines += ['## Acciones', '']
        if isinstance(action_items, list):
            lines += [f'- {item}' for item in action_items]
        else:
            lines.append(action_items)
        lines.append('')

    sentences = t.get('sentences') or []
    if sentences:
        lines += ['## Transcripcion', '']
        current_speaker = None
        for s in sentences:
            speaker = s.get('speaker_name') or 'Desconocido'
            text = s.get('text', '').strip()
            t_ms = s.get('start_time', 0)
            if speaker != current_speaker:
                lines.append(f'**{speaker}** `{format_time(t_ms)}`')
                current_speaker = speaker
            lines.append(text)
        lines.append('')

    return '\n'.join(lines)


def main():
    parser = argparse.ArgumentParser(description='Descarga transcripciones de Fireflies')
    parser.add_argument('--list', action='store_true', help='Listar transcripts disponibles')
    parser.add_argument('--filter', type=str, default=None, help='Filtrar por titulo')
    parser.add_argument('--ids', nargs='+', help='IDs especificos a descargar')
    parser.add_argument('--output', type=str, default='.', help='Carpeta de salida')
    args = parser.parse_args()

    if args.list:
        transcripts = list_transcripts(args.filter)
        for t in transcripts:
            date_str = datetime.fromtimestamp(t['date'] / 1000, tz=timezone.utc).strftime('%Y-%m-%d')
            dur = round(t['duration'])
            parts = ', '.join(t.get('participants') or [])
            print(f'{t["id"]}  {date_str}  {dur:3d}min  {t["title"]:40s}  [{parts}]')
        print(f'\nTotal: {len(transcripts)} transcripts')
        return

    # Determinar que descargar
    if args.ids:
        ids = args.ids
    elif args.filter:
        transcripts = list_transcripts(args.filter)
        ids = [t['id'] for t in transcripts]
        if not ids:
            print(f'No se encontraron transcripts con filtro "{args.filter}"')
            return
        print(f'Encontrados {len(ids)} transcripts con filtro "{args.filter}"')
    else:
        print('Usa --ids o --filter para especificar que descargar, o --list para ver disponibles')
        return

    os.makedirs(args.output, exist_ok=True)

    for tid in ids:
        print(f'Descargando {tid}...')
        t = fetch_transcript(tid)
        if not t:
            print(f'  ERROR: no se pudo obtener {tid}')
            continue
        date_str = datetime.fromtimestamp(t['date'] / 1000, tz=timezone.utc).strftime('%Y-%m-%d')
        filename = f'{date_str}-{slugify(t["title"])}.md'
        filepath = os.path.join(args.output, filename)
        md = to_md(t)
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(md)
        print(f'  Guardado: {filename}')

    print('\nListo.')


if __name__ == '__main__':
    main()
