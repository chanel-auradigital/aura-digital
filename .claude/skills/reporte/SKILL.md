---
name: reporte
description: Generar reportes semanales, mensuales o trimestrales para un cliente. Usar cuando se pida reporte, métricas, análisis de rendimiento o resumen de resultados.
user-invocable: true
argument-hint: [cliente] [tipo] [periodo]
allowed-tools: Read, Write, Edit, Glob, Grep, Agent, Bash
---

# Generador de Reportes — Aura Digital

Genera reportes de rendimiento basados en métricas reales.

## Antes de generar

1. **Leer métricas disponibles**:
   - `clientes/$0/08-reportes/instagram-data/` — exports de métricas
   - `clientes/$0/08-reportes/` — reportes anteriores (mantener consistencia)

2. **Leer contexto del cliente**:
   - `clientes/$0/05-estrategia/` — KPIs y objetivos definidos
   - `clientes/$0/06-contenido/calendario-editorial/` — qué se publicó

3. **Leer templates**:
   - `prompts/08-reportes/reporte-semanal.md`
   - `prompts/08-reportes/reporte-mensual.md`
   - `prompts/08-reportes/reporte-90-dias.md`

## Tipos de reporte

| Tipo | Template | Frecuencia |
|------|----------|-----------|
| `semanal` | reporte-semanal.md | Cada lunes |
| `mensual` | reporte-mensual.md | Fin de mes |
| `trimestral` | reporte-90-dias.md | Cada 90 días |

## Obtener métricas frescas

Si las métricas están desactualizadas, ejecutar:

```bash
python scripts/fetch_instagram_metrics.py --client $0 --days 30
```

## Output

Guardar en: `clientes/$0/08-reportes/{tipo}/`

Nombre: `{fecha}-reporte-{tipo}.md` + versión `.html` para el cliente.

Incluir siempre:
- Métricas clave vs período anterior
- Top 3 posts por engagement
- Recomendaciones accionables
- Próximos pasos
