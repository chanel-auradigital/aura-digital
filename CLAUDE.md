# CLAUDE.md — Aura Digital

## Que es este proyecto
Sistema de marca personal y marketing digital para profesionales de salud
emocional (psicologos, tanatologos, coaches terapeuticos) que quieren
posicionarse como autoridad y vender programas high-ticket a traves de
redes sociales y embudos digitales.

## Stack
- Prompts modulares en Markdown con frontmatter (fase, orden, prioridad)
- Data de clientes en clientes/{nombre}/ (onboarding, briefing,
  conversaciones, estrategia)
- Transcripciones de reuniones via Fireflies.ai -> Markdown
- Assets visuales en assets/
- Outputs estrategicos en la carpeta del cliente, nunca en la de prompts

## Flujo de trabajo
1. Los prompts en prompts/ son plantillas reutilizables
2. El orden de ejecucion esta en ROADMAP.md (6 fases secuenciales)
3. Antes de ejecutar cualquier prompt, leer TODOS los data sources del
   cliente (01-onboarding → 02-briefing → 03-branding → 04-conversaciones → 05-estrategia)
4. La salida de cada prompt alimenta al siguiente — nunca ejecutar un prompt
   sin el contexto de los anteriores
5. Guardar outputs en la carpeta del cliente bajo la subcarpeta tematica

## Restricciones eticas (nicho salud emocional)
- NUNCA hacer claims medicos ("cura", "sana", "elimina")
- Usar lenguaje de acompanamiento: "te ayudo a", "te acompano en"
- Respetar regulaciones de Meta Ads: no usar "depresion", "trastorno",
  "suicidio", "ansiedad" como diagnostico en copies
- Proteger identidad de pacientes en testimonios (pedir permiso explicito)
- No crear urgencia falsa ni manipulacion emocional
- El marketing debe ser etico: remover el dolor para conectar, no para
  explotar

## Tono del proyecto
- Profesional pero cercano
- Marketing basado en confianza, no en presion
- Copies que suenan a persona, no a IA generica
- Adaptar siempre al tono de voz del cliente (definido en su onboarding)

## Estructura del cliente
Cada cliente sigue esta estructura (generada por _nuevo-cliente.ps1):
- 01-onboarding/ → formularios, accesos, contrato
- 02-briefing/ → brief de marca, referencias, objetivos
- 03-branding/ → guia de marca, identidad visual (logo, paleta, tipografia)
- 04-conversaciones/ → transcripciones de reuniones
- 05-estrategia/ → diagnostico, posicionamiento, publico, plan 90 dias, marketing
- 06-contenido/ → instagram (reels, carruseles, stories), tiktok, copies, calendario
- 07-entregables/ → documentos, presentaciones, aprobados
- 08-reportes/ → semanales, mensuales, instagram-data/ (metricas API)

## Estructura raiz del proyecto
- prompts/ → plantillas reutilizables, organizadas con indices que replican
  la estructura del cliente:
  - 03-branding/ → identidad visual, naming, tono
  - 05-estrategia/ → estrategia de marketing, ventas, anuncios, crecimiento
  - 06-contenido/ → formatos, contenido, guiones, redes sociales, analisis IG
  - 07-entregables/ → propuesta comercial, documentos reutilizables
  - 08-reportes/ → templates de reporte semanal, mensual y trimestral
  - 09-email-marketing/ → secuencias de email, lead magnets, nurturing
  - 10-funnels/ → diseno de embudo completo, AARRR, customer journey map
  - frameworks/ → Hormozi, StoryBrand, Schwartz (referencia compartida)
- clientes/ → carpetas de clientes con estructura estandarizada
- assets/ → scripts de automatizacion (D-ID, Fireflies), media, cookies
- scripts/ → fetch_instagram_metrics.py, renew_meta_token.py

## Instagram Analytics
- Metricas se obtienen via Meta Graph API (OAuth, token en .env)
- Script: `python scripts/fetch_instagram_metrics.py --client {nombre} --days 30`
- Output: JSON en `clientes/{nombre}/08-reportes/instagram-data/`
- Analisis: usar skill en `prompts/06-contenido/skill-analisis-instagram.md`
- Token expira cada 60 dias → renovar con `python scripts/renew_meta_token.py`

## Frameworks de referencia
- Simon Sinek — Circulo Dorado (identidad)
- Kim & Mauborgne — Blue Ocean + Matriz ERIC (posicionamiento)
- Kotler — STP (segmentacion)
- Christensen — Jobs To Be Done (motivacion de compra)
- Cialdini — Psicologia del consumidor (persuasion etica)
- Schwartz — 5 niveles de consciencia del mercado (copy)
- Hormozi — Ecuacion de valor, Grand Slam, Value Ladder (oferta)
- Miller — StoryBrand SB7 (narrativa)
- HubSpot — Inbound Marketing (embudo de contenido)
- Smart Insights — Content Matrix, 4 cuadrantes (contenido)
- Reforge — Growth Loops (crecimiento no lineal)
- IDEO — Empathy Map (investigacion de avatar)
- Rackham — SPIN Selling (ventas conversacionales)
- Ries — Lean Startup (validacion antes de escalar)
- Kaplan & Norton — Balanced Scorecard (sintesis estrategica)
- Doerr — OKR (objetivos y resultados clave)
- Porter — 5 Fuerzas (analisis competitivo simplificado)
- PAS / AIDA — estructuras clasicas de copywriting

## Convenciones
- Archivos en kebab-case: estrategia-marketing-guadalupe.md
- Frontmatter YAML en todos los .md de prompts y outputs
- Fechas en formato ISO: 2026-03-28
- Precios siempre en USD salvo indicacion del cliente
- No usar acentos en nombres de archivo
- Todo contenido de entregables, reportes, HTML y PDF debe usar ortografía
  correcta del español: acentos (á, é, í, ó, ú), eñe (ñ), signos de
  apertura (¿, ¡) y gramática correcta
