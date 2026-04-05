---
name: credenciales
description: Almacenar, consultar o actualizar credenciales y accesos de un cliente. Usar cuando se reciban tokens, passwords, API keys o accesos a plataformas.
user-invocable: true
disable-model-invocation: false
argument-hint: [cliente] [plataforma]
allowed-tools: Read, Write, Edit, Glob, Grep, Bash
---

# Gestión de Credenciales — Aura Digital

Almacena y gestiona credenciales de clientes de forma segura y consistente.

## Principio fundamental

- **Tokens y secrets** → solo en `.env` (nunca en archivos trackeados por git)
- **Metadata de acceso** → `clientes/{cliente}/01-onboarding/accesos/{plataforma}.md`
- **Config técnica web** → `clientes/{cliente}/13-web/config.json` (si tiene sitio web)

## Formato estándar de archivo de acceso

Cada plataforma tiene su propio archivo en `clientes/$0/01-onboarding/accesos/`:

```markdown
---
plataforma: [Nombre de la plataforma]
cliente: [slug-del-cliente]
actualizado: [YYYY-MM-DD]
expira: [YYYY-MM-DD si aplica]
---

# [Plataforma] — [Nombre del cliente]

| Campo | Valor |
|-------|-------|
| **Usuario** | @usuario o email |
| **Account ID** | ID numérico |
| **Tipo** | Business / Creator / etc. |
| **Variable .env (token)** | `META_ACCESS_TOKEN_CLIENTE` |
| **Variable .env (ID)** | `INSTAGRAM_ACCOUNT_ID_CLIENTE` |

## Comandos

\```bash
# Comando relevante para usar esta credencial
\```
```

## Convención de nombres en .env

Las variables siguen el patrón: `{SERVICIO}_{TIPO}_{CLIENTE_UPPER_SNAKE}`

El slug del cliente se convierte a UPPER_SNAKE_CASE:
- `chanel-de-la-rosa` → `CHANEL_DE_LA_ROSA`
- `guadalupe-acero` → `GUADALUPE_ACERO`
- `maria-jose` → `MARIA_JOSE`

Ejemplos:
- `META_ACCESS_TOKEN_GUADALUPE_ACERO`
- `INSTAGRAM_ACCOUNT_ID_GUADALUPE_ACERO`

## Plataformas conocidas y sus campos

### instagram.md
| Campo | Requerido | Fuente |
|-------|:---------:|--------|
| Usuario (@) | Sí | Se obtiene del token via API |
| Nombre | Sí | Se obtiene del token via API |
| Account ID | Sí | Se obtiene del token via API |
| Tipo (Business/Creator) | Sí | Se obtiene del token via API |
| Variable .env (token) | Sí | Convención de nombres |
| Variable .env (ID) | Sí | Convención de nombres |
| Fecha de expiración | Sí | Token + 60 días |

**Al recibir un token de Instagram:**
1. Guardar el token en `.env` como `META_ACCESS_TOKEN_{CLIENTE}`
2. Obtener Account ID con:
   ```bash
   curl -s "https://graph.instagram.com/v21.0/me?fields=id,username,name,account_type&access_token={TOKEN}"
   ```
3. Guardar el Account ID en `.env` como `INSTAGRAM_ACCOUNT_ID_{CLIENTE}`
4. Crear/actualizar `accesos/instagram.md` con la metadata
5. Calcular fecha de expiración (hoy + 60 días) y ponerla en el frontmatter

### wordpress.md
| Campo | Requerido |
|-------|:---------:|
| URL del sitio | Sí |
| URL wp-admin | Sí |
| Usuario | Sí |
| Application Password | Sí |
| API REST URL | Sí |
| Tema | Sí |
| Page Builder | Sí |
| Cache plugin | Si aplica |
| Hosting | Sí |

### cpanel.md
| Campo | Requerido |
|-------|:---------:|
| Host | Sí |
| Puerto | Sí (default 2083) |
| URL completa | Sí |
| Usuario | Sí |
| API Token | Sí |
| Ruta public_html | Sí |

### Otras plataformas (meta-ads.md, tiktok.md, email.md, etc.)
Seguir el mismo formato: frontmatter YAML + tabla de campos + comandos relevantes.

## Flujo al recibir una credencial nueva

1. **Identificar** la plataforma y el cliente
2. **Verificar** si ya existe `clientes/{cliente}/01-onboarding/accesos/{plataforma}.md`
3. **Si el token va en .env**: añadirlo con la convención de nombres
4. **Si se puede obtener metadata del token** (como Instagram): hacer la llamada API
5. **Crear/actualizar** el archivo de acceso con el formato estándar
6. **Calcular expiración** si aplica y ponerla en el frontmatter
7. **Confirmar** al usuario qué se guardó y dónde

## Qué NO hacer

- Nunca guardar tokens/secrets directamente en archivos `.md` (solo referenciar la variable de `.env`)
- Nunca commitear `.env` a git
- Nunca duplicar credenciales en múltiples ubicaciones
- Nunca inventar Account IDs — siempre obtenerlos de la API
