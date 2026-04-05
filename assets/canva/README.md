---
titulo: Canva API — Configuración
fecha: 2026-04-03
---

# Canva API — Aura Digital

## Credenciales

Las credenciales están en `.env` (raíz del proyecto):

- `CANVA_CLIENT_ID` — Client ID de la app
- `CANVA_CLIENT_SECRET` — Client Secret
- `CANVA_ACCESS_TOKEN` — Token de acceso (expira cada 4 horas)
- `CANVA_REFRESH_TOKEN` — Token para renovar el access token

## Token — Refresh obligatorio

El access token expira cada **4 horas** (14400 seg). Antes de cualquier operación con la API de Canva, se debe verificar si el token sigue activo y refrescarlo si es necesario.

**Procedimiento:**

1. Ejecutar `python scripts/canva_auth.py` para re-autorizar desde cero (abre navegador)
2. O usar el refresh token programáticamente (el script `html_to_canva.py` ya incluye auto-refresh)

**Importante:** Cada vez que se usa el refresh token, Canva invalida el anterior y genera uno nuevo. No se puede reutilizar un refresh token.

## Scopes activos

app:read, app:write, asset:read, asset:write, brandtemplate:content:read, brandtemplate:content:write, brandtemplate:meta:read, comment:read, comment:write, design:content:read, design:content:write, design:meta:read, design:permission:read, design:permission:write, folder:read, folder:write, folder:permission:read, folder:permission:write, profile:read

## Estructura de carpetas en Canva

```
Aura Digital (FAHFwBcdB80)
├── Chanel de la Rosa (FAHFwGDXFpU)
│   ├── Logo & Branding (FAHFwGQCZaw)
│   ├── Fotos & Videos (FAHFwJ5_cG8)
│   ├── Posts Instagram (FAHFwCCKBHA)
│   ├── Stories & Reels (FAHFwMlXnDE)
│   └── Ads (FAHFwMemGSE)
├── Guadalupe Acero (FAHFwM4cBpQ)
│   ├── Logo & Branding (FAHFwBITNtg)
│   ├── Fotos & Videos (FAHFwFiG-Gg)
│   ├── Posts Instagram (FAHFwFGGc1o)
│   └── Stories & Reels (FAHFwArgI2s)
└── Maria Jose (FAHFwCD0_rQ)
    ├── Logo & Branding (FAHFwJbdZ6I)
    ├── Fotos & Videos (FAHFwHrfKMM)
    ├── Posts Instagram (FAHFwLuAmPI)
    ├── Stories & Reels (FAHFwChPE5U)
    └── Masterclass (FAHFwJB-nRM)
```

## Fuentes de archivos multimedia (Drive → Canva)

Rutas de origen en Google Drive (montado como `G:`) para subir assets a Canva.
En scripts de Python usar `G:/` (no `/g/`).

### Chanel de la Rosa

| Tipo | Ruta en Drive | Carpeta Canva |
|------|--------------|---------------|
| **Fotos & Videos** | `G:/.shortcut-targets-by-id/1uZn9gTEYdjM9y0C3Djy8D1poBkCzqsWH/Aura Digital-Espacio/FOTOS & VIDEOS/` | FAHFwJ5_cG8 |
| **B-roll** | `...FOTOS & VIDEOS/B-roll/` | FAHFwJ5_cG8 |
| **Historia personal** | `...FOTOS & VIDEOS/Ftos Historia personal/` | FAHFwJ5_cG8 |
| **Logos (local)** | `clientes/chanel-de-la-rosa/03-branding/logo/` | FAHFwGQCZaw |
| **Foto perfil (local)** | `clientes/chanel-de-la-rosa/03-branding/selling-system/foto-perfil.jpg` | FAHFwGQCZaw |

### Guadalupe Acero

| Tipo | Ruta en Drive | Carpeta Canva |
|------|--------------|---------------|
| **Logo (local)** | `clientes/guadalupe-acero/03-branding/identidad-visual/logo-guadalupe.jpg` | FAHFwBITNtg |

> Guadalupe no tiene carpeta de fotos en Drive todavía.

### Maria Jose

| Tipo | Ruta en Drive | Carpeta Canva |
|------|--------------|---------------|
| **Fotos & Videos** | `G:/.shortcut-targets-by-id/1uZn9gTEYdjM9y0C3Djy8D1poBkCzqsWH/Aura Digital-Espacio/Maria Jose- Marca espacio/FOTOS VIDEOS/` | FAHFwHrfKMM |
| **Círculo de mujeres** | `...FOTOS VIDEOS/Circulo de mujeres/` | FAHFwHrfKMM |
| **MJ trabajando** | `...FOTOS VIDEOS/MJ trabajando/` | FAHFwHrfKMM |
| **Pareja MJ** | `...FOTOS VIDEOS/Pareja MJ/` | FAHFwHrfKMM |
| **Fotos Videos (sub)** | `...FOTOS VIDEOS/Fotos Videos/` | FAHFwHrfKMM |
| **Branding/Paleta (local)** | `clientes/maria-jose/03-branding/paleta/` | FAHFwJbdZ6I |
| **Fotos local** | `clientes/maria-jose/10-assets/fotos/` | FAHFwHrfKMM |

### Ruta base de Drive

```
G:/.shortcut-targets-by-id/1uZn9gTEYdjM9y0C3Djy8D1poBkCzqsWH/Aura Digital-Espacio/
```

### Cómo subir nuevos archivos

```bash
cd /c/Users/maxic/Workspace/aura-digital
python scripts/canva_auth.py          # refrescar token si expiró
export CANVA_ACCESS_TOKEN=$(python3 -c "
for line in open('.env'):
    if line.startswith('CANVA_ACCESS_TOKEN='):
        print(line.strip().split('=',1)[1]); break
")
python3 /tmp/canva_upload.py <FOLDER_ID> <archivo1> <archivo2> ...
```

## Códigos de recuperación

Guardados en `assets/canva/recovery-codes.txt` (excluido de git).

## Recursos

- Documentación API: https://www.canva.dev/docs/connect/
- Dashboard de apps: https://www.canva.com/developers
- Script de autenticación: `scripts/canva_auth.py`
- Script de upload: `scripts/html_to_canva.py`
