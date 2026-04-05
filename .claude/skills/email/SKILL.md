---
name: email
description: Generar secuencias de email marketing, newsletters o emails de nurturing para un cliente. Usar cuando se pida email, secuencia, newsletter o lead magnet.
user-invocable: true
argument-hint: [cliente] [tipo-secuencia]
allowed-tools: Read, Write, Edit, Glob, Grep, Agent
---

# Email Marketing — Aura Digital

Genera secuencias de email y contenido de email marketing.

## Antes de generar

1. **Leer contexto del cliente**: onboarding, briefing, estrategia, tono de voz
2. **Leer prompt**: `prompts/09-email-marketing/prompt-13-sistema-email-marketing.md`
3. **Leer funnel** (si existe): `clientes/$0/05-estrategia/` y `prompts/10-funnels/`

## Tipos de secuencia

| Tipo | Emails | Propósito |
|------|--------|----------|
| `bienvenida` | 5-7 | Nurturing post opt-in |
| `lanzamiento` | 7-10 | Secuencia de venta |
| `nurturing` | 4-6 | Mantener relación |
| `recuperacion` | 3-4 | Reactivar inactivos |
| `newsletter` | 1 | Envío puntual |

## Output

Guardar en: `clientes/$0/06-contenido/copies/email/`

Cada email como archivo separado: `{secuencia}-{numero}-{asunto-corto}.md`
