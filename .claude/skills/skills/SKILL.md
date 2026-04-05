---
name: skills
description: Listar todos los skills disponibles en el proyecto con su descripción y uso.
user-invocable: true
allowed-tools: Glob, Read
---

# Skills disponibles — Aura Digital

Lista todos los skills del proyecto. Busca en `.claude/skills/` y muestra cada uno con su nombre, descripción y ejemplo de uso.

## Instrucciones

1. Busca todos los archivos `SKILL.md` en `.claude/skills/`
2. Lee el frontmatter de cada uno (name, description, argument-hint)
3. Presenta una tabla con todos los skills disponibles

## Formato de salida

Muestra una tabla así:

| Comando | Descripción | Ejemplo |
|---------|-------------|---------|
| `/nombre` | descripción | `/nombre arg1 arg2` |

Agrupa por categoría:
- **Contenido**: guiones, email
- **Estrategia**: estrategia, branding, propuesta
- **Análisis**: reporte, analisis-ig
- **Operaciones**: nuevo-cliente, wp-modify, skills
