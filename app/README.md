# Aura Digital — Portal de Clientes

Portal web para clientes de Aura Digital donde gestionan su marca personal:
onboarding, briefing, branding, métricas de Instagram y reportes.

**URL producción:** https://app.digitalnextlevel.com

## Stack

- **Framework:** Next.js 16 (App Router, React 19, Turbopack)
- **Base de datos:** Supabase (PostgreSQL + Auth + Edge Functions)
- **Estilos:** Tailwind CSS 4
- **Deploy:** Vercel (deploy manual con `vercel --prod`)
- **Sync automático:** GitHub Actions cron cada 12 horas

## Variables de entorno

Crear `.env.local` con:

```env
# Meta / Instagram OAuth
META_APP_ID=<facebook-app-id>
META_APP_SECRET=<facebook-app-secret>
NEXT_PUBLIC_APP_URL=https://app.digitalnextlevel.com

# Admin
ADMIN_SECRET=<contraseña-panel-admin>

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://ixjeoplobqqckqhxisoo.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon-jwt-key>
SUPABASE_SERVICE_ROLE_KEY=<service-role-jwt-key>
```

- Supabase: dashboard de Supabase > Settings > API
- Meta: developers.facebook.com > aura-digital-connector > Configuración > Básica

## Desarrollo local

```bash
npm install
npm run dev    # http://localhost:3000
```

## Deploy a producción

Deploy manual desde la carpeta `app/`:

```bash
npx vercel --prod
```

No hay auto-deploy configurado. El dominio `app.digitalnextlevel.com`
está vinculado al proyecto `aura-digital-app` en Vercel.

## Rutas de la app

| Ruta | Tipo | Descripción |
|------|------|-------------|
| `/` | Server | Dashboard principal |
| `/login` | Static | Login (email + Google OAuth) |
| `/register` | Static | Registro de cuenta |
| `/dashboard` | Server | Métricas de Instagram |
| `/mi-marca` | Server | Progreso de marca (steps: Onboarding → Briefing → Branding) |
| `/mi-marca/onboarding` | Server | Formulario de onboarding (6 secciones, auto-save) |
| `/mi-marca/branding` | Server | Opciones de branding |
| `/conexiones` | Server | Grid de plataformas conectables (Instagram, TikTok, Facebook) |
| `/conexiones/instagram` | Server | Estado de conexión de Instagram + botón conectar |
| `/admin/login` | Static | Login del panel admin (contraseña, sin Supabase Auth) |
| `/admin` | Server | Panel admin: lista de clientes con estado |
| `/admin/clientes/[id]` | Server | Detalle de cliente: conexiones, onboarding, métricas |
| `/admin/clientes/[id]/conexiones` | Server | Gestión de conexiones + enviar invitación de tester |
| `/api/auth/instagram` | API | Inicia flujo OAuth con Meta (redirect a Facebook) |
| `/api/auth/instagram/callback` | API | Callback OAuth: intercambia código por token, guarda en Supabase |
| `/api/admin/login` | API | Autenticación admin (cookie httpOnly) |
| `/api/admin/logout` | API | Cerrar sesión admin |
| `/api/admin/invite-tester` | API | Envía invitación de tester vía Meta API |
| `/api/onboarding-save` | API | Fallback para `sendBeacon` (guarda borrador on page unload) |
| `/auth/callback` | API | Callback de OAuth (Supabase Auth) |
| `/auth/signout` | API | Cerrar sesión cliente |

## Base de datos (Supabase)

### Tablas

Scripts SQL en `app/scripts/`:

| Tabla | Script | Descripción |
|-------|--------|-------------|
| `clients` | `setup-db.sql` | Perfil de cliente (user_id FK → auth.users) |
| `client_apps` | `setup-db.sql` | Apps conectadas por cliente |
| `instagram_profiles` | `setup-db.sql` | Datos de perfil de IG (1 por cliente, incluye `account_type`) |
| `instagram_posts` | `setup-db.sql` | Posts con métricas de engagement |
| `instagram_daily_metrics` | `setup-db.sql` | Snapshot diario (followers, reach, etc.) |
| `instagram_comments` | `setup-comments.sql` | Comentarios y respuestas (threaded) |
| `client_onboarding` | `setup-onboarding.sql` | Datos del formulario de onboarding (JSONB) |

Todas las tablas tienen **Row Level Security (RLS)** activado — cada usuario
solo ve sus propios datos.

### Ejecutar los scripts

Desde el SQL Editor de Supabase, ejecutar en orden:

1. `setup-db.sql` — tablas base
2. `setup-onboarding.sql` — onboarding
3. `setup-comments.sql` — comentarios de IG
4. `add-account-type.sql` — columna `account_type` en `instagram_profiles`

### Ejecutar SQL remoto

Vía Supabase Management API (sin necesidad de psql):

```bash
source .env && curl -s -X POST \
  "https://api.supabase.com/v1/projects/ixjeoplobqqckqhxisoo/database/query" \
  -H "Authorization: Bearer $SUPABASE_MANAGEMENT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"query": "SELECT 1;"}'
```

O con psql (instalado localmente, PostgreSQL 17):

```bash
PGPASSWORD='<db-password>' psql \
  -h aws-0-us-east-1.pooler.supabase.com -p 6543 \
  -U postgres.ixjeoplobqqckqhxisoo -d postgres
```

## Sync de Instagram (Cron cada 12 horas)

### Arquitectura

```
GitHub Actions (cron: 0 0,12 * * *)
    │
    ├─ POST → Supabase Edge Function /sync-instagram?client=chanel-de-la-rosa
    ├─ POST → Supabase Edge Function /sync-instagram?client=maria-jose
    └─ POST → Supabase Edge Function /sync-instagram?client=guadalupe-acero
         │
         ├─ Fetch Meta Graph API v22.0 (perfil, posts, insights, comments)
         └─ Upsert → Supabase tables (instagram_profiles, _posts, _daily_metrics, _comments)
```

### GitHub Actions workflow

**Archivo:** `.github/workflows/sync-instagram.yml`

- **Schedule:** `0 0,12 * * *` (cada 12 horas, 00:00 y 12:00 UTC)
- **Trigger manual:** `workflow_dispatch` habilitado
- **Estrategia:** Matrix con `max-parallel: 1` (secuencial para evitar rate limits)
- **Clientes:** chanel-de-la-rosa, maria-jose, guadalupe-acero
- **Auth:** Bearer token desde `secrets.SYNC_SECRET`

### Supabase Edge Function

**Archivo:** `supabase/functions/sync-instagram/index.ts`

Deploy: `SUPABASE_ACCESS_TOKEN=$SUPABASE_MANAGEMENT_TOKEN npx supabase functions deploy sync-instagram --project-ref ixjeoplobqqckqhxisoo --no-verify-jwt`

**Importante:** usar `--no-verify-jwt` porque la función tiene su propia
verificación con `SYNC_SECRET` (no usa JWT de Supabase).

Para cada cliente:

1. Valida el Bearer token (`SYNC_SECRET`)
2. Obtiene el token de Meta API del env (`META_ACCESS_TOKEN_{CLIENTE}`)
3. Fetch de perfil (incluye `account_type`), últimos 50 posts con insights, y comentarios/respuestas
4. Upsert en las 4 tablas de Instagram
5. Responde con JSON: `{ ok, client, duration, followers, posts_synced, comments_synced }`

### Mapping de clientes

| Cliente | IG Account ID | Variable de token |
|---------|--------------|-------------------|
| chanel-de-la-rosa | `26061463690190519` | `META_ACCESS_TOKEN_CHANEL_DE_LA_ROSA` |
| maria-jose | `26686366784320409` | `META_ACCESS_TOKEN_MARIA_JOSE` |
| guadalupe-acero | `26806995438892448` | `META_ACCESS_TOKEN_GUADALUPE_ACERO` |

### Tokens de Meta API

Los tokens de larga duración expiran cada **60 días**. Renovar con:

```bash
python scripts/renew_meta_token.py --client chanel-de-la-rosa
```

Después actualizar manualmente en:
- `.env` local
- Supabase Dashboard > Edge Functions > Environment Variables

Las fechas de expiración están registradas en
`clientes/{cliente}/01-onboarding/accesos/instagram.md`.

## Scripts locales (Python)

| Script | Uso |
|--------|-----|
| `scripts/fetch_instagram_metrics.py` | Fetch local → JSON en `clientes/{cliente}/08-reportes/instagram-data/` |
| `scripts/renew_meta_token.py` | Renueva token de Meta API (60 días) |

```bash
# Fetch métricas locales (independiente del cron)
python scripts/fetch_instagram_metrics.py --client guadalupe-acero --days 30

# Renovar token
python scripts/renew_meta_token.py --client guadalupe-acero
```

## Formulario de onboarding

6 secciones con auto-save (debounce 1.5s):

1. **Datos del Negocio** — nombre, nicho, experiencia, redes sociales
2. **Voz de Marca** — 4 sliders de personalidad + adjetivos de tono
3. **Cliente Ideal** — problema, solución, demografía, psicografía
4. **Oferta Irresistible** — causa, enemigo, metodología, programa, precio
5. **Demostración de Valor** — tipo de lead magnet, destino
6. **Competencia** — hasta 8 competidores + ventaja competitiva

Los datos se guardan como JSONB en `client_onboarding`. El paso se marca
como completado solo cuando todas las secciones están completas y el usuario
pulsa "Completar Onboarding" (escribe `completed_at`).

## Conexiones (OAuth Instagram)

Flujo centralizado desde la app de Meta `aura-digital-connector` (ID: 985046680747003).
Los clientes no necesitan tocar developers.facebook.com.

### Flujo para el cliente

1. Portal → Conexiones → Instagram → "Conectar"
2. Redirect a Facebook OAuth → acepta permisos
3. Callback recibe código → intercambia por token de larga duración (60 días)
4. Token + account ID se guardan en `client_apps` (JSONB metadata)
5. El cron sincroniza automáticamente cada 12h

### Permisos solicitados

- `instagram_basic` — perfil, foto, bio
- `instagram_manage_insights` — métricas y analytics
- `pages_show_list` — listar páginas de Facebook
- `pages_read_engagement` — engagement de la página

### Redirect URI (configurada en Meta)

```
https://app.digitalnextlevel.com/api/auth/instagram/callback
```

### Modo Development vs Live

- **Development** (actual): solo testers pueden conectar. Se añaden desde
  el panel admin o manualmente en developers.facebook.com
- **Live** (requiere verificación de empresa): cualquier cliente conecta
  sin intervención

## Panel de administración

Acceso independiente de Supabase Auth. Protegido con contraseña (`ADMIN_SECRET`).

**URL:** https://app.digitalnextlevel.com/admin

### Funcionalidades

- Lista de todos los clientes con badges de estado (onboarding, IG)
- Detalle por cliente: Conexiones, Onboarding, Métricas
- Gestión de conexiones: ver estado, token, última sync
- Enviar invitación de tester a nuevos clientes vía Meta API
  (requiere el Facebook User ID del cliente)

### Flujo para nuevo cliente (modo Development)

1. Admin → seleccionar cliente → Conexiones → "Enviar invitación"
2. Introducir Facebook User ID del cliente
3. El cliente acepta la invitación desde Facebook
4. El cliente entra al portal → Conexiones → Conectar Instagram
