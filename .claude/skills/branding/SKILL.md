---
name: branding
description: Generar o actualizar la identidad visual y guía de marca de un cliente. Usar cuando se pida branding, paleta de colores, tipografía, logo, tono de voz o propuesta visual.
user-invocable: true
argument-hint: [cliente] [entregable]
allowed-tools: Read, Write, Edit, Glob, Grep, Agent
---

# Branding — Aura Digital

Genera propuestas de identidad visual y guías de marca.

## Antes de generar

1. **Leer contexto del cliente**:
   - `clientes/$0/01-onboarding/` — quién es
   - `clientes/$0/02-briefing/` — brief de marca, referencias visuales, competencia
   - `clientes/$0/03-branding/` — branding existente (no sobrescribir sin confirmar)
   - `clientes/$0/04-conversaciones/` — preferencias expresadas en reuniones

2. **Leer prompt de branding**: `prompts/03-branding/prompt-14-identidad-visual.md`

## Entregables

| Entregable | Qué incluye |
|-----------|-------------|
| `propuesta` | Propuesta visual completa (paleta, tipografía, moodboard, logo concepts) |
| `guia` | Guía de marca definitiva (uso de logo, colores, tipografía, tono, aplicaciones) |
| `paleta` | Solo paleta de colores con justificación |
| `tono` | Guía de tono de voz y comunicación |

## Output

Guardar en: `clientes/$0/03-branding/`

Subcarpetas:
- `identidad-visual/` — logo, paleta, tipografía
- `logo/` — archivos de logo

Formato: HTML para presentar + MD como fuente.
