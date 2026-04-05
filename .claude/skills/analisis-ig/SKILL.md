---
name: analisis-ig
description: Analizar métricas de Instagram de un cliente y generar un informe HTML completo con diagnóstico, hallazgos y plan de acción. Usar cuando se pida análisis de métricas, rendimiento de contenido, qué funciona o insights de Instagram.
user-invocable: true
argument-hint: [cliente] [dias]
allowed-tools: Read, Write, Glob, Grep, Bash, Agent
---

# Análisis de Instagram — Aura Digital

Genera un informe HTML interactivo y completo del rendimiento de Instagram de un cliente.

## Referencia visual

Usar como referencia de estructura y diseño:
- `clientes/maria-jose/08-reportes/instagram-data/analisis-dic2025-mar2026.html`
- `clientes/guadalupe-acero/08-reportes/instagram-data/analisis-dic2025-mar2026.html`

El informe debe seguir ese mismo nivel de calidad, con gráficos Chart.js, animaciones, diseño oscuro profesional y navegación sticky.

## Procedimiento optimizado

### Paso 1: Obtener métricas

```bash
# SIEMPRE usar 120 días para tener suficientes datos de tendencia
python scripts/fetch_instagram_metrics.py --client $0 --days 120
```

### Paso 2: Pre-analizar datos con Python

IMPORTANTE: Antes de generar el HTML, analizar los datos con un script Python para extraer todas las métricas. Esto evita errores al parsear manualmente.

```bash
# SIEMPRE usar PYTHONIOENCODING=utf-8 en Windows para evitar UnicodeEncodeError
PYTHONIOENCODING=utf-8 python3 script_analisis.py
```

El script debe extraer:
- Profile stats
- Daily reach aggregated by month
- Post metrics parsed correctly (ver "Estructura del JSON" abajo)
- Top posts by reach and engagement
- Format comparison (VIDEO vs IMAGE vs CAROUSEL)
- Theme classification by caption keywords
- Posting frequency by month
- Posts with 0 engagement count

### Paso 3: Leer contexto del cliente

- `clientes/$0/08-reportes/instagram-data/latest.json` — datos crudos
- `clientes/$0/08-reportes/` — reportes anteriores (para comparar)
- `clientes/$0/06-contenido/calendario-editorial/` — qué se publicó y cuándo
- `clientes/$0/05-estrategia/` — KPIs, público objetivo, pilares de contenido
- `clientes/$0/03-branding/` — paleta de colores para personalizar el informe
- `prompts/06-contenido/skill-analisis-instagram.md`

### Paso 4: Generar HTML completo

Lanzar un agente dedicado (model: sonnet) con TODOS los datos pre-analizados en el prompt para que genere el archivo HTML de una sola vez. No intentar escribirlo incrementalmente.

## Estructura del JSON (CRÍTICO — errores comunes)

El archivo `latest.json` tiene esta estructura:

```
{
  "profile": { "username", "followers_count", "follows_count", ... },
  "account_insights": {
    "data": [
      { "name": "reach", "period": "day", "values": [ {"value": N, "end_time": "..."} ] }
    ]
  },
  "media": [   // ← ES UN ARRAY, no un objeto con "data"
    {
      "id", "caption", "media_type", "timestamp", "permalink",
      "like_count", "comments_count",
      "insights": {
        "data": [   // ← Array de objetos, NO claves planas
          { "name": "reach", "values": [{"value": N}] },
          { "name": "likes", "values": [{"value": N}] },
          { "name": "comments", "values": [{"value": N}] },
          { "name": "shares", "values": [{"value": N}] },
          { "name": "saved", "values": [{"value": N}] },
          { "name": "total_interactions", "values": [{"value": N}] }
        ]
      }
    }
  ],
  "demographics": { ... }  // Puede estar vacío si la cuenta tiene <100 seguidores por desglose
}
```

### Cómo parsear insights de un post (JS):

```javascript
function getInsight(post, name) {
    const data = post.insights?.data || [];
    const item = data.find(d => d.name === name);
    return item?.values?.[0]?.value || 0;
}
// Uso: getInsight(post, 'reach'), getInsight(post, 'likes'), etc.
```

### Cómo parsear insights de un post (Python):

```python
def get_insight(post, name):
    ins = post.get('insights', {})
    if not isinstance(ins, dict):
        return 0
    for item in ins.get('data', []):
        if item.get('name') == name:
            vals = item.get('values', [])
            return vals[0].get('value', 0) if vals else 0
    return 0
# Uso: get_insight(post, 'reach'), get_insight(post, 'likes'), etc.
```

### Errores a evitar:

- `media` es una LISTA, no un dict. NO hacer `media.get('data')` → hacer `d.get('media', [])`
- Los insights NO son claves planas. NO hacer `insights.get('reach')` → usar `getInsight()`
- `like_count` y `comments_count` existen como campos del post pero los insights son más completos (incluyen shares, saves)
- `demographics` puede estar vacío o dar error 3006 "Not enough users" — siempre verificar antes de graficar
- En Windows usar `PYTHONIOENCODING=utf-8` para evitar `UnicodeEncodeError: 'charmap' codec`

## Secciones obligatorias del informe

### 1. Header del perfil
- Avatar (iniciales del cliente en círculo con gradiente)
- Nombre, @usuario, bio
- Seguidores, siguiendo, publicaciones (contadores animados)
- Ratio seguidos/seguidores
- Link del website

### 2. Salud general de la cuenta
- Gauge semi-circular dibujado con Canvas API (NO Chart.js)
- Niveles: Crítico (0-20%) / Bajo (20-40%) / Medio (40-60%) / Bueno (60-80%) / Excelente (80-100%)
- Justificación en una línea debajo
- Factores a considerar: engagement rate, consistencia de publicación, crecimiento, ratio seguidores, tendencia de alcance

### 3. KPIs principales
- 6 tarjetas principales: seguidores, alcance total del periodo, posts analizados, ER por post, alcance promedio/post, engagement total
- 4 tarjetas de desglose: likes, comentarios, shares, guardados (con % del total)
- Color coding: verde = bueno, rojo = malo, accent = neutro

### 4. Alcance diario
- Gráfico de línea (Chart.js) con TODOS los puntos de datos del JSON
- Línea de media móvil 7 días superpuesta
- Gradient fill debajo de la línea
- Identificar y anotar picos que coincidan con publicaciones

### 5. Alcance mensual
- Gráfico de barras comparando meses
- Incluir alcance promedio diario por mes
- Calcular % de cambio entre meses
- Insight card debajo con la tendencia

### 6. Comparativa de formatos
- Comparación lado a lado: VIDEO vs IMAGE vs CAROUSEL
- Métricas por formato: posts count, avg reach, avg engagement, shares, saves
- Pie/doughnut chart de distribución de formatos
- Barra horizontal de alcance por formato
- Insight card con cuál formato gana y por cuánto

### 7. Top posts
- Top 5 por alcance
- Tarjetas rankeadas con: posición, badge de formato (video/carrusel/imagen), caption truncado, fecha, métricas completas
- Identificar patrones comunes

### 8. Análisis de contenido por temas
- Clasificar automáticamente por palabras clave en captions
- Barra horizontal de rendimiento promedio por tema
- Pie chart de distribución temática por mes

#### 8b. Evolución temática en el tiempo
- Gráfico de área apilada o líneas múltiples: eje X = meses, series = cada tema
- Mostrar qué temas se publicaron en cada periodo y su rendimiento
- Detectar correlaciones: ¿cambió el rendimiento cuando cambió la temática?
- Identificar:
  - Temas que rendían bien y dejaron de publicarse
  - Temas nuevos que mejoraron o empeoraron las métricas
  - Periodos donde un cambio temático coincide con un pico o caída
- Key insight card con la conclusión principal

### 9. Embudo de conversión
- Flujo horizontal con flechas: Alcance total → Alcance posts → Engagement → Shares → Saves
- Tasa de conversión entre cada paso
- Nota si link clicks no están disponibles

### 10. Demografía
- Si hay datos: gráficos de género (doughnut), edad (barras), países (horizontal bar), ciudades (horizontal bar)
- Si NO hay datos: card informativa explicando por qué (cuenta muy pequeña, <100 por desglose)
- Siempre incluir una estimación basada en la bio y el contenido

### 11. Diagnóstico detallado
- Cards expandibles (acordeón) con severidad: Crítico / Importante / Positivo
- Los 2 primeros abiertos por defecto
- Cada diagnóstico incluye subsecciones con h4: Datos / Causa / Impacto / Recomendación (o Oportunidad para positivos)
- Mínimo 3 críticos, 3 importantes, 3 positivos
- Evaluar siempre:
  - Consistencia de publicación (frecuencia, gaps, meses inactivos)
  - Calidad del engagement (proporción likes vs saves vs shares vs comments)
  - Ratio seguidores/seguidos
  - Efectividad de formatos
  - CTAs y generación de comentarios
  - Coherencia de marca en bio y contenido
  - Lo que se está haciendo BIEN (siempre incluir positivos)

### 12. Hallazgo clave
- El insight más importante del análisis
- Formato visual grande con comparación (metric A vs metric B)
- Gradiente de borde, texto grande

### 13. Plan de acción
- 3 fases con timeline concreto (semanas)
- Timeline visual con iconos, puntos de colores, líneas conectoras
- Cada fase con acciones específicas y medibles en lista
- Priorizado por impacto
- Incluir: qué dejar de hacer, qué empezar a hacer, qué seguir haciendo

## Especificaciones de diseño y visualización

### Paleta y tema
- Tema oscuro base, personalizado con los colores de marca del cliente
- Si el cliente tiene branding en `03-branding/`, usar su color de acento
- Si no, elegir una paleta coherente con su nicho (azul para psicología, verde para bienestar, etc.)
- Estructura de colores CSS:
  - `--bg`: fondo principal (muy oscuro)
  - `--bg2`, `--bg3`: fondos secundarios
  - `--card`: fondo de tarjeta con opacidad baja + backdrop-filter: blur
  - `--card-border`: borde sutil
  - `--text`: texto principal claro
  - `--text-dim`: texto secundario
  - `--text-bright`: texto destacado (blanco)
  - Color de acento principal (CTAs, highlights)
  - Color positivo (verde/teal)
  - Color advertencia (ámbar)
  - Color peligro (rojo)

### Tipografía
- Google Fonts: Inter (weights 300-900)
- Jerarquía: títulos de sección 1.5rem bold, títulos de card .85rem semibold, body .82rem, labels .7rem uppercase con letter-spacing

### Layout
- Max-width 1400px centrado
- CSS Grid para layouts de tarjetas: grid-2, grid-3, grid-4, grid-6
- Responsive: 4 cols → 2 cols a 1024px → 1 col a 640px
- Navegación sticky con scroll horizontal, backdrop blur

### Componentes
- **KPI Cards**: Ícono + contador animado grande + label + sub-label con color coding
- **Charts** (Chart.js 4.x desde CDN `https://cdn.jsdelivr.net/npm/chart.js@4.4.7/dist/chart.umd.min.js`):
  - Línea: alcance diario con gradient fill, puntos en picos
  - Barras: comparación mensual, comparación de formatos
  - Doughnut/Pie: distribución de formatos, distribución temática por mes
  - Barra horizontal: ranking de rendimiento por tema
  - Área apilada: evolución temática en el tiempo (sección 8b)
- **Health gauge**: Semi-círculo dibujado con Canvas API, label de score debajo, colores de severidad
- **Top posts**: Cards rankeados con número de posición, badge de formato, caption truncado, fila de métricas
- **Comparación de formatos**: Tabla lado a lado con ganador destacado
- **Embudo**: Flujo horizontal con flechas, tasas de conversión entre pasos
- **Diagnósticos**: Acordeón expandible con badge de severidad (CRÍTICO=rojo, IMPORTANTE=ámbar, POSITIVO=verde)
- **Hallazgo clave**: Box destacado con comparación grande, borde gradiente
- **Plan de acción**: Timeline con iconos de fase, puntos de colores, líneas verticales conectoras

### Interactividad
- Contadores animados: números suben al entrar en viewport (IntersectionObserver)
- Fade-in: elementos aparecen con slide-up al hacer scroll
- Acordeón: click para expandir/colapsar diagnósticos
- Nav sticky: resalta la sección activa al hacer scroll
- Tooltips en gráficos Chart.js
- Print stylesheet: fondo blanco, todos los acordeones abiertos, sin nav

### Técnico
- Un solo archivo HTML autocontenido
- Chart.js cargado desde CDN
- Todo CSS inline en tag `<style>`
- Todo JS inline en tag `<script>` al final del body
- Datos embebidos como constantes JS (`const DATA = {...}`)
- UTF-8 encoding
- NO usar caracteres emoji directamente — usar HTML entities o texto
- Español con ortografía correcta (acentos, ñ, ¿, ¡)

## Output

Guardar en: `clientes/$0/08-reportes/instagram-data/`

Nombre: `analisis-{periodo}.html`
Ejemplo: `analisis-dic2025-mar2026.html`

También actualizar la referencia visual al inicio de este skill si el nuevo informe tiene mejor calidad que los anteriores.
