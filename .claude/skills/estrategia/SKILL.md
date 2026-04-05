---
name: estrategia
description: Generar o actualizar la estrategia de marketing completa de un cliente. Usar cuando se pida diagnóstico, posicionamiento, plan 90 días, análisis de avatar o estrategia de ventas.
user-invocable: true
argument-hint: [cliente] [fase]
allowed-tools: Read, Write, Edit, Glob, Grep, Agent
---

# Estrategia de Marketing — Aura Digital

Genera documentos estratégicos completos para clientes.

## Antes de generar

1. **Leer TODO el contexto del cliente** (en orden obligatorio):
   - `clientes/$0/01-onboarding/` — formularios, accesos
   - `clientes/$0/02-briefing/` — brief completo, objetivos, referencias
   - `clientes/$0/03-branding/` — identidad visual, tono
   - `clientes/$0/04-conversaciones/` — TODAS las transcripciones
   - `clientes/$0/05-estrategia/` — documentos existentes (no duplicar)
   - `clientes/$0/08-reportes/` — métricas si existen

2. **Leer los prompts de estrategia** según la fase pedida:
   - `prompts/05-estrategia/prompt-00-brief-ejecutivo.md`
   - `prompts/05-estrategia/prompt-02-analisis-avatar.md`
   - `prompts/05-estrategia/prompt-05-analisis-competitivo.md`
   - `prompts/05-estrategia/prompt-07-precio-oferta-high-ticket.md`
   - `prompts/05-estrategia/prompt-12-sintesis-estrategica.md`
   - `prompts/05-estrategia/skill-estrategia-completa.md`

3. **Leer frameworks**:
   - `prompts/frameworks/` — todos los que apliquen

## Fases disponibles

| Fase | Qué genera | Prompt base |
|------|-----------|-------------|
| `diagnostico` | Auditoría del estado actual | prompt-00 |
| `avatar` | Análisis de público objetivo | prompt-02 |
| `competencia` | Análisis competitivo | prompt-05 |
| `oferta` | Diseño de oferta high-ticket | prompt-07 |
| `contenido` | Estrategia de contenido | prompt-03 (06-contenido) |
| `anuncios` | Sistema de Meta Ads | prompt-04, prompt-08 |
| `ventas` | Guión de llamada + sistema DMs | prompt-18, prompt-10 |
| `embudo` | Diseño de funnel completo | prompt-16 (10-funnels) |
| `email` | Sistema de email marketing | prompt-13 (09-email) |
| `completa` | Estrategia integral (todas) | skill-estrategia-completa |
| `sintesis` | Documento resumen ejecutivo | prompt-12 |

Si no se especifica fase, usar `$1` como fase. Si no hay `$1`, preguntar.

## Output

Guardar en: `clientes/$0/05-estrategia/`

Subcarpetas según tipo:
- `marketing/` — estrategia general
- `posicionamiento/` — diferenciación
- `publico-objetivo/` — avatar, segmentación
- `plan-90-dias/` — plan táctico

Formato: Markdown con frontmatter YAML + versión HTML para presentar al cliente.
