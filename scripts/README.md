# Scripts — Aura Digital

## Setup: Instagram Graph API (OAuth)

### Prerequisitos
- Cuenta de Instagram **Business** o **Creator** conectada a una Facebook Page
- Meta Business Suite configurado

### Paso 1 — Crear Meta App
1. Ir a https://developers.facebook.com/apps/
2. "Create App" → tipo "Business"
3. Agregar producto "Instagram Graph API"
4. Ir a Settings → Basic → anotar **App ID** y **App Secret**
5. Pegar en `.env`:
   ```
   META_APP_ID=tu-app-id
   META_APP_SECRET=tu-app-secret
   ```

### Paso 2 — Obtener token (una sola vez)
1. Abrir en el navegador (reemplazar {APP_ID}):
   ```
   https://www.facebook.com/v21.0/dialog/oauth?client_id={APP_ID}&redirect_uri=https://localhost&scope=instagram_basic,instagram_manage_insights,pages_show_list,pages_read_engagement,business_management&response_type=code
   ```
2. Autorizar la app
3. El browser redirige a `https://localhost?code=XXXXX` (da error de conexion, es normal)
4. Copiar el `code` de la URL

### Paso 3 — Intercambiar por token corto
```bash
curl -s "https://graph.facebook.com/v21.0/oauth/access_token?client_id={APP_ID}&redirect_uri=https://localhost&client_secret={APP_SECRET}&code={CODE}"
```
Devuelve `{"access_token": "...", "token_type": "bearer"}`

### Paso 4 — Convertir a token largo (60 dias)
```bash
curl -s "https://graph.facebook.com/v21.0/oauth/access_token?grant_type=fb_exchange_token&client_id={APP_ID}&client_secret={APP_SECRET}&fb_exchange_token={SHORT_TOKEN}"
```
Pegar en `.env`:
```
META_ACCESS_TOKEN=el-token-largo
```

### Paso 5 — Obtener Instagram Account ID
```bash
# Primero obtener Page ID
curl -s "https://graph.facebook.com/v21.0/me/accounts?access_token={LONG_TOKEN}"

# Con el Page ID, obtener IG Business Account ID
curl -s "https://graph.facebook.com/v21.0/{PAGE_ID}?fields=instagram_business_account&access_token={LONG_TOKEN}"
```
Pegar en `.env`:
```
INSTAGRAM_ACCOUNT_ID=el-ig-id
```

### Paso 6 — Verificar que funciona
```bash
python scripts/fetch_instagram_metrics.py --client guadalupe-acero --days 30
```

### Renovar token (cada ~55 dias)
```bash
python scripts/renew_meta_token.py
```
Copiar el nuevo token a `.env`.

---

## Scripts disponibles

| Script | Funcion | Uso |
|--------|---------|-----|
| `fetch_instagram_metrics.py` | Descarga metricas de IG a JSON | `python scripts/fetch_instagram_metrics.py --client guadalupe-acero --days 30` |
| `renew_meta_token.py` | Renueva token de Meta (60 dias) | `python scripts/renew_meta_token.py` |
