---
name: propuesta
description: Generar propuesta comercial para un cliente potencial o existente. Usar cuando se pida propuesta, cotización o presentación de servicios.
user-invocable: true
argument-hint: [cliente]
allowed-tools: Read, Write, Edit, Glob, Grep, Agent
---

# Propuesta Comercial — Aura Digital

Genera propuestas comerciales profesionales en HTML.

## Antes de generar

1. **Leer datos del cliente**:
   - `clientes/$0/01-onboarding/` — información básica
   - `clientes/$0/02-briefing/` — objetivos, necesidades
   - `clientes/$0/04-conversaciones/` — lo que se ha hablado

2. **Leer template**: `prompts/07-entregables/propuesta-comercial-template.md`

3. **Leer estrategia** (si existe): `clientes/$0/05-estrategia/`

## Estructura de la propuesta

1. Portada con logo de Aura Digital
2. Diagnóstico del estado actual del cliente
3. Solución propuesta (programa/servicios)
4. Metodología (7 fases Digital Next Level u otra)
5. Entregables específicos
6. Inversión y formas de pago
7. Timeline
8. Sobre Chanel / Aura Digital
9. Próximo paso (CTA)

## Output

Guardar en: `clientes/$0/07-entregables/presentaciones/`

Generar en HTML con estilos inline para que se pueda compartir como archivo único.
Usar la paleta del branding de Aura Digital (Espresso, Arcilla, Terracota, Arena).
