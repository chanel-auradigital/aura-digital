---
name: canva
description: Gestionar assets en Canva — sincronizar posts de Instagram, subir diseños, listar carpetas. Usar para actualizar contenido de IG en Canva o subir assets.
user-invocable: true
argument-hint: [accion] [cliente]
allowed-tools: Read, Write, Edit, Glob, Grep, Bash, Agent
---

# Canva — Aura Digital

Gestiona assets de Canva para los clientes: sincroniza posts de Instagram, sube diseños, y mantiene las carpetas organizadas.

## Acciones disponibles

| Accion | Descripcion | Ejemplo |
|--------|-------------|---------|
| `sync` | Sincronizar posts nuevos de Instagram a Canva | `/canva sync maria-jose` |
| `upload` | Subir un archivo HTML/PNG a Canva | `/canva upload chanel archivo.html` |
| `list` | Listar contenido de una carpeta Canva | `/canva list guadalupe-acero` |
| `cleanup` | Eliminar duplicados de la raiz | `/canva cleanup maria-jose` |

Si no se indica accion, asumir `sync`.

## Antes de cualquier accion

1. **Verificar token Canva**: el access token expira cada 4 horas.
   ```bash
   "C:\Users\maxic\AppData\Local\Programs\Python\Python312\python.exe" -c "
   import urllib.request, json
   env = {}
   with open('C:/Users/maxic/Workspace/aura-digital/.env') as f:
       for line in f:
           line = line.strip()
           if line and not line.startswith('#') and '=' in line:
               k, v = line.split('=', 1)
               env[k.strip()] = v.strip()
   token = env.get('CANVA_ACCESS_TOKEN', '')
   req = urllib.request.Request('https://api.canva.com/rest/v1/users/me', headers={'Authorization': f'Bearer {token}'})
   try:
       with urllib.request.urlopen(req) as resp:
           print('OK:', json.loads(resp.read().decode()))
   except: print('EXPIRED')
   "
   ```

2. **Si expirado, refrescar**:
   ```bash
   "C:\Users\maxic\AppData\Local\Programs\Python\Python312\python.exe" -c "
   import urllib.request, urllib.parse, json, base64
   env = {}
   env_path = 'C:/Users/maxic/Workspace/aura-digital/.env'
   with open(env_path) as f:
       for line in f:
           line = line.strip()
           if line and not line.startswith('#') and '=' in line:
               k, v = line.split('=', 1)
               env[k.strip()] = v.strip()
   creds = base64.b64encode(f\"{env['CANVA_CLIENT_ID']}:{env['CANVA_CLIENT_SECRET']}\".encode()).decode()
   data = urllib.parse.urlencode({'grant_type': 'refresh_token', 'refresh_token': env['CANVA_REFRESH_TOKEN']}).encode()
   req = urllib.request.Request('https://api.canva.com/rest/v1/oauth/token', data=data, headers={'Content-Type': 'application/x-www-form-urlencoded', 'Authorization': f'Basic {creds}'})
   with urllib.request.urlopen(req) as resp:
       r = json.loads(resp.read().decode())
   with open(env_path) as f: lines = f.readlines()
   new = []
   for l in lines:
       if l.strip().startswith('CANVA_ACCESS_TOKEN='): new.append(f\"CANVA_ACCESS_TOKEN={r['access_token']}\n\")
       elif l.strip().startswith('CANVA_REFRESH_TOKEN='): new.append(f\"CANVA_REFRESH_TOKEN={r.get('refresh_token', env['CANVA_REFRESH_TOKEN'])}\n\")
       else: new.append(l)
   with open(env_path, 'w') as f: f.writelines(new)
   print(f\"Token refrescado, expira en {r.get('expires_in')}s\")
   "
   ```

3. **Verificar credenciales de Instagram del cliente** en `.env`:
   - `META_ACCESS_TOKEN_{CLIENTE}` e `INSTAGRAM_ACCOUNT_ID_{CLIENTE}`
   - Si no existen, pedir al usuario que las proporcione

## Accion: sync

Sincroniza posts NUEVOS de Instagram a Canva (no re-sube los que ya estan).

### Procedimiento

1. Leer el manifest existente para saber que ya se subio:
   ```
   clientes/{cliente}/08-reportes/instagram-data/manifest.json
   ```

2. Ejecutar el script de fetch:
   ```bash
   "C:\Users\maxic\AppData\Local\Programs\Python\Python312\python.exe" scripts/fetch_ig_posts_to_canva.py --client {cliente}
   ```

3. El script automaticamente:
   - Obtiene todos los media de Instagram (paginado)
   - Filtra IMAGE y CAROUSEL_ALBUM (excluye VIDEO/REELS)
   - Descarga imagenes nuevas (salta las que ya existen localmente)
   - Sube a Canva y mueve a la carpeta Posts Instagram
   - Guarda manifest.json con metadata

4. Reportar resultado: cuantos nuevos se descargaron/subieron

### Estructura local de archivos

```
clientes/{cliente}/08-reportes/instagram-data/
├── posts/          (imagenes individuales — media_type: IMAGE)
├── carousels/      (portadas de carrusel — media_type: CAROUSEL_ALBUM)
└── manifest.json   (indice con ig_id, date, caption, permalink, type, canva_asset_id)
```

### IMPORTANTE: El script re-sube si ya existe localmente

Actualmente el script salta la descarga si el archivo ya existe, pero SIEMPRE re-sube a Canva. Para evitar duplicados al hacer sync incremental, verificar el manifest antes de subir: si un `ig_id` ya tiene `canva_asset_id`, saltarlo.

## Accion: upload

Sube un archivo HTML o PNG a Canva.

```bash
# HTML -> PNG -> Canva
"C:\Users\maxic\AppData\Local\Programs\Python\Python312\python.exe" scripts/html_to_canva.py ruta/archivo.html --upload --name "Nombre del diseno" --folder {FOLDER_ID}

# Solo PNG -> Canva (si ya tienes el PNG)
"C:\Users\maxic\AppData\Local\Programs\Python\Python312\python.exe" scripts/html_to_canva.py ruta/archivo.png --upload --name "Nombre"
```

## Accion: list

Lista items en la carpeta Posts Instagram del cliente.

## Accion: cleanup

Ejecuta el script de limpieza para eliminar duplicados en la raiz:
```bash
"C:\Users\maxic\AppData\Local\Programs\Python\Python312\python.exe" scripts/canva_cleanup_root.py --folder {FOLDER_ID} --dry-run
```

Mostrar resultado del dry-run al usuario. Solo ejecutar `--delete` con confirmacion.

## Carpetas Canva por cliente

### Maria Jose (FAHFwCD0_rQ)

| Carpeta | ID | Uso |
|---------|-----|-----|
| Logo & Branding | `FAHFwJbdZ6I` | Logos, paleta |
| Fotos & Videos | `FAHFwHrfKMM` | Fotos de MJ |
| Posts Instagram | `FAHFwLuAmPI` | Posts/carruseles de IG |
| Stories & Reels | `FAHFwChPE5U` | Portadas de reel |
| Masterclass | `FAHFwJB-nRM` | Material masterclass |

### Guadalupe Acero (FAHFwM4cBpQ)

| Carpeta | ID | Uso |
|---------|-----|-----|
| Logo & Branding | `FAHFwBITNtg` | Logo, isotipo |
| Fotos & Videos | `FAHFwFiG-Gg` | Fotos de Guadalupe |
| Posts Instagram | `FAHFwFGGc1o` | Posts/carruseles de IG |
| Stories & Reels | `FAHFwArgI2s` | Portadas de reel |

### Chanel de la Rosa (FAHFwGDXFpU)

| Carpeta | ID | Uso |
|---------|-----|-----|
| Logo & Branding | `FAHFwGQCZaw` | Logos, branding |
| Fotos & Videos | `FAHFwJ5_cG8` | Fotos de Chanel |
| Posts Instagram | `FAHFwCCKBHA` | Posts/carruseles de IG |
| Stories & Reels | `FAHFwMlXnDE` | Portadas de reel |
| Ads | `FAHFwMemGSE` | Anuncios Meta Ads |

## Gotchas de la API (lecciones aprendidas)

1. **Metadata header ~100 chars max**: truncar nombre a ~50 chars antes de base64
2. **folder_id en metadata NO funciona**: subir y luego mover con `POST /v1/folders/move`
3. **Upload es async**: polling a `GET /v1/asset-uploads/{jobId}` hasta status=success
4. **Token 4h**: refrescar con refresh_token antes de operaciones largas
5. **Formato**: `application/octet-stream`, NO multipart (da 415)
6. **Windows encoding**: `sys.stdout.reconfigure(encoding="utf-8", errors="replace")`
7. **Assets NO editables**: la API sube fotos, no disenos editables

## Python a usar

Siempre usar la ruta completa:
```
"C:\Users\maxic\AppData\Local\Programs\Python\Python312\python.exe"
```
