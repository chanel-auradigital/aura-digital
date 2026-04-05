---
name: guiones
description: Generar guiones de contenido para redes sociales (reels, carruseles, stories, lives, posts, TikTok, anuncios). Usar cuando el usuario pida guiones, contenido, reels, publicaciones o plan semanal para un cliente.
user-invocable: true
argument-hint: [cliente] [formato|semana N] [tema]
allowed-tools: Read, Write, Edit, Glob, Grep, Agent
---

# Generador de Guiones — Aura Digital

Genera guiones de contenido para redes sociales adaptados al cliente y su nicho.
Soporta dos modos: **individual** (un guion específico) y **semanal** (toda una semana del calendario).

## Modos de uso

| Modo | Ejemplo | Qué genera |
|------|---------|------------|
| Individual | `/guiones guadalupe reel duelo` | 1 guion del formato indicado |
| Semanal | `/guiones guadalupe semana 2` | Todos los guiones de la semana según el calendario |
| Batch | `/guiones guadalupe 3 reels educativos` | N guiones del mismo tipo |
| Anuncios | `/guiones guadalupe anuncios` | Creativos para campañas Meta Ads (3 fases) |

## Antes de generar

1. **Leer TODO el contexto del cliente** (en orden):
   - `clientes/$0/01-onboarding/` — quién es, qué hace, tono de voz
   - `clientes/$0/02-briefing/` — brief de marca, referencias, objetivos
   - `clientes/$0/03-branding/` — guía de marca, paleta, tipografía, identidad visual
   - `clientes/$0/04-conversaciones/` — transcripciones recientes (últimas 2-3)
   - `clientes/$0/05-estrategia/` — posicionamiento, avatar, plan 90 días, **calendario semanal** (BLOQUE 10), **anuncios** (BLOQUE 11)
   - `clientes/$0/06-contenido/guiones/` — guiones existentes (para no repetir hooks, temas ni historias)
   - `clientes/$0/08-reportes/` — métricas recientes (qué funciona, mejores días, qué no funciona)

2. **Leer el prompt de guiones**: `prompts/06-contenido/prompt-17-guiones-contenido.md`

3. **Leer frameworks relevantes** (según el tipo de contenido):
   - `prompts/frameworks/storybrand-miller.md` — narrativa (testimonios, historias)
   - `prompts/frameworks/niveles-consciencia-schwartz.md` — nivel de consciencia del copy
   - `prompts/frameworks/ecuacion-valor-hormozi.md` — contenido de oferta/venta

4. **Para modo semanal**: Leer el calendario semanal del cliente en la estrategia de marketing (BLOQUE 10) y mapear cada día a su formato/tipo/nivel correspondiente. Verificar el plan semana a semana (BLOQUE 17) para tareas específicas de esa semana.

## Formatos disponibles

| Formato | Estructura | Duración/Slides |
|---------|-----------|-----------------|
| `reel` | Dirección visual + Hook → Tensión → Valor → Cierre → CTA | 30-90 seg |
| `carrusel` | Slide gancho → Slides desarrollo → Slide CTA | 5-10 slides |
| `story` | Secuencia de 3-7 frames (foto/video/encuesta/texto) | 15 seg c/u |
| `live` | Pre-live stories → Apertura → Bloques → Q&A → Cierre → Post-live | 40-60 min |
| `post` | Diseño de imagen + caption largo | 1 imagen + texto |
| `tiktok` | Texto pantalla → Hook verbal → Dato → Solución → Redirección | 15-60 seg |
| `anuncio` | Hook → Agitación → Solución → CTA (estructura PAS) | 20-45 seg |

## Estructura de cada guion

### Reel (30-90s)

```
## GUION [código] — "[Título]"

**Línea de contenido:** [nombre de la serie]
**Formato:** Reel
**Duración:** [30s | 45s | 60s | 90s]
**Nivel de consciencia:** [1-5]
**Etapa:** [ToFu | MoFu | BoFu]
**Cuadrante:** [Entretener | Educar | Inspirar | Convencer]

### DIRECCIÓN VISUAL (primeros 3 segundos)
- **Encuadre:** [primer plano | medio corto | completo]
- **Acción:** [lo que hace Guadalupe / lo que se ve en pantalla]
- **Texto en pantalla:** "[texto overlay]"

### GUION (voz)
**GANCHO (0-3s)** "[frase exacta]"
**TENSIÓN (3-15s)** "[desarrollo del problema]"
**VALOR (15-45s)** "[insight, dato, perspectiva única]"
**CIERRE (últimos 5-10s)** "[reflexión o frase de impacto]"
**CTA (final)** "[llamada a la acción única]"

### NOTAS DE PRODUCCIÓN
- Subtítulos: [estilo, qué resaltar]
- Música: [tipo de fondo]
- Transiciones: [cortes, B-roll]
- Gráficos: [textos animados]
- Hashtags: [3-5 de nicho]

### TEXTO DEL POST (caption)
[Caption completo con CTA y hashtags]
```

### Carrusel (5-10 slides)

```
## GUION [código] — "[Título]"

**Formato:** Carrusel ([N] slides)
**Nivel de consciencia:** [1-5]
**Etapa:** [ToFu | MoFu | BoFu]

### SLIDE 1 — GANCHO
- Visual: [fondo, estilo]
- Texto principal: "[headline]"
- Texto secundario: "[subtexto]"

### SLIDE 2-N — [TÍTULO]
[Un slide por concepto, con visual + texto]

### SLIDE FINAL — CTA
- Texto: "[CTA claro]"
- Acción esperada: [guardar | compartir | DM]

### TEXTO DEL POST (caption)
[Caption + hashtags]
```

### Story (secuencia de 3-7 frames)

```
## GUION [código] — "[Título]"

**Formato:** Story ([N] frames)
**Objetivo:** [engagement | educación | CTA | behind the scenes]

### FRAME 1
- Tipo: [foto | video 15s | texto | encuesta | pregunta | quiz]
- Visual: [descripción]
- Texto/audio: "[contenido]"
- Sticker interactivo: [encuesta | pregunta | quiz | slider | ninguno]

[...por frame...]
```

### Live (40-60 min)

```
## GUION [código] — "[Título]"

**Formato:** Live
**Duración estimada:** [40-60 min]
**Nivel de consciencia:** [3-4]

### PRE-LIVE (stories 4-6h antes + 30 min antes + al iniciar)
[3 stories de anticipación con cuenta regresiva]

### APERTURA (0-5 min)
[Saludo, presentación del tema, interacción inicial]

### BLOQUE 1 — [TEMA] (5-15 min)
[Puntos, anécdotas, preguntas al público]

### BLOQUE 2 — [TEMA] (15-30 min)
[Puntos, demostración/ejemplo]

### BLOQUE 3 — [TEMA] (30-40 min)
[Profundización, preguntas preparadas]

### Q&A (40-50 min)
[Preguntas del chat + preguntas preparadas]

### CIERRE (50-60 min)
[3 takeaways + CTA + adelanto próximo live]

### POST-LIVE
[Clips para recortar, stories de recap]
```

### Post reflexión / imagen

```
## GUION [código] — "[Título]"

**Formato:** Post (imagen + caption)
**Nivel de consciencia:** [4-5]
**Etapa:** BoFu

### DISEÑO DE LA IMAGEN
- Formato: [1:1 | 4:5]
- Fondo: [color/gradiente de la paleta del cliente]
- Texto principal: "[frase de impacto]"
- Texto inferior: "— [nombre del cliente]"

### TEXTO DEL POST (caption)
[Caption largo, reflexivo, con CTA final + hashtags]
```

### Anuncio Meta (20-45s)

```
## CREATIVO [código] — "[Título]"

**Objetivo:** [Alcance | Tráfico | Conversiones]
**Audiencia:** [descripción del público]
**Formato:** [Video | Imagen | Carrusel]
**KPI objetivo:** [CPM, CTR, CPC, CPL según fase]

### DIRECCIÓN VISUAL
[Encuadre, acción, texto en pantalla]

### GUION (voz)
**HOOK (0-3s)** "[frase]"
**AGITACIÓN (3-15s)** "[dolor]"
**SOLUCIÓN (15-30s)** "[método/oferta]"
**CTA (30-40s)** "[acción]"

### COPY DEL ANUNCIO
**Titular:** [corto]
**Texto principal:** [copy completo]
**CTA button:** [Enviar mensaje | Más información]

### VARIACIONES PARA TESTING A/B
[3-4 hooks alternativos]
```

## Modo semanal: contenido complementario obligatorio

Cuando se genera una semana completa, cada día DEBE incluir:

1. **Contenido principal** (reel, carrusel, live, post según calendario)
2. **3 stories diarias** que complementen el contenido principal:
   - 1 encuesta/pregunta/quiz (engagement)
   - 1 behind the scenes o vida cotidiana (humanizar)
   - 1 CTA suave o refuerzo del contenido del día
3. **Tabla resumen de la semana** al inicio del archivo
4. **Orden de grabación sugerido** (agrupar por sesión de filming)
5. **Notas generales de producción** (horarios, métricas a monitorear)

## Reglas de contenido

- **Tono:** Respetar siempre el tono del cliente (definido en onboarding/briefing)
- **Ética:** No usar manipulación, urgencia falsa ni explotar dolor (ver CLAUDE.md)
- **Nicho salud emocional:** No hacer claims médicos. Usar lenguaje de acompañamiento
- **Palabras prohibidas (Meta):** depresión, trastorno, suicidio, ansiedad (como diagnóstico), enfermedad mental
- **Alternativas seguras:** malestar emocional, dolor interno, peso emocional, crisis, desconexión
- **Un CTA por pieza:** Nunca dos llamadas a la acción en el mismo guion
- **Hooks variados:** No repetir el mismo tipo en guiones consecutivos (pregunta, contrarian, historia, dato, identificación, visual)
- **Ortografía:** Todo en español correcto con acentos, ñ y signos de apertura ¿¡
- **No repetir contenido de guiones existentes:** Verificar guiones previos para no duplicar hooks, historias ni temas
- **Hashtags:** 3-5 de nicho por pieza (no 15-20, menos es más para el algoritmo actual)

## Output

**Siempre generar DOS archivos:** el Markdown de trabajo Y el HTML responsivo de presentación.

### Archivos Markdown (trabajo)

**Archivo individual:** `clientes/$0/06-contenido/guiones/{fecha}-{formato}-{tema-corto}.md`
Ejemplo: `2026-04-01-reel-3-senales-trauma.md`

**Archivo semanal:** `clientes/$0/06-contenido/guiones/guiones-semana-{N}.md`
Ejemplo: `guiones-semana-1.md`

**Guiones fundacionales:** `clientes/$0/06-contenido/guiones/guiones-foundacionales.md`

**Estructura del archivo semanal:**
```
1. Frontmatter (cliente, tipo, fecha, semana, piezas, formatos)
2. Tabla resumen de la semana
3. Guion de cada día (contenido principal + 3 stories)
4. Anuncios (si aplica)
5. Notas generales de producción
6. Orden de grabación
7. Métricas a monitorear
```

### Archivo HTML responsivo (presentación)

**Siempre** generar un `.html` con el mismo nombre que el `.md`:
- `guiones-semana-1.md` → `guiones-semana-1.html`
- `guiones-foundacionales.md` → `guiones-foundacionales.html`

**Tomar como referencia de estilo:** `guiones-foundacionales.html` del cliente (si existe)
o el sistema de diseño base:

- **Fuente:** DM Sans (Google Fonts) + JetBrains Mono
- **Tema:** Dark mode (#0C1220 fondo, #E2E8F0 texto, #0D9488 primario, #F59E0B secundario, #EC4899 acento)
- **Cards por guion** con header (número, título, tags de línea/formato/duración/nivel/etapa)
- **Script blocks** con colores semánticos: gancho (rojo), tensión (ámbar), valor (teal), cierre (púrpura), CTA (rosa)
- **Visual direction** con borde lateral verde, fondo oscuro alternativo
- **Production notes** con bullet dots de color primario
- **Caption box** con label "COPIAR PARA INSTAGRAM"
- **Story cards** en grid responsivo
- **Slide cards** para carruseles (numerados con diseño visual por slide)
- **Live blocks** con borde lateral ámbar y bloques quote
- **Frame cards** para secuencias de stories (numerados con badge rosa)
- **Sección de anuncios** con fases diferenciadas (frío=azul, retarget=ámbar, conversión=rosa)
- **Day dividers** entre cada día de la semana (etiqueta con línea horizontal)
- **TOC** con links por día y tags de formato/etapa
- **Tabla resumen** con todos los guiones de la semana
- **Orden de grabación** con lista numerada de cards
- **Métricas** en grid de cards con valor grande + label
- **Tips/notas** en box con borde gradiente
- **Responsivo:** 768px y 480px breakpoints
- **Print styles:** fondo blanco, colores legibles

El HTML debe ser un archivo único (CSS inline en `<style>`) sin dependencias externas excepto Google Fonts.
