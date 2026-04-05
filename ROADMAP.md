# Roadmap de Implementacion — Aura Digital

Orden de ejecucion de los prompts. Completar cada fase antes de avanzar a la siguiente.
La salida de cada prompt alimenta al siguiente — ver la columna "Requiere" para saber
que outputs anteriores se necesitan como input.

---

## Fase 0 — Contexto *(critico, siempre primero)*
> Generar el brief ejecutivo del cliente a partir de sus data sources.

| Orden | Prompt | Ubicacion | Requiere |
|-------|--------|-----------|----------|
| 0 | Brief Ejecutivo del Cliente | `prompts/05-estrategia/` | Data sources del cliente (onboarding, briefing, conversaciones) |

---

## Fase 1 — Diagnostico *(obligatorio)*
> Antes de cualquier accion, entender el terreno.

| Orden | Prompt | Ubicacion | Requiere |
|-------|--------|-----------|----------|
| 1 | Analisis de Avatar y Dolores | `prompts/05-estrategia/` | Brief Ejecutivo (P00) |
| 2 | Analisis Competitivo del Mercado | `prompts/05-estrategia/` | Brief Ejecutivo (P00) |
| 14 | Sistema de Identidad Visual | `prompts/03-branding/` | Brief Ejecutivo (P00) + Tono de voz (onboarding) |

---

## Fase 2 — Estrategia *(obligatorio)*
> Definir oferta, precio y sistema de conversion.

| Orden | Prompt | Ubicacion | Requiere |
|-------|--------|-----------|----------|
| 3 | Sistema de Conversion: del Seguidor al Cliente | `prompts/05-estrategia/` | P00 + P02 |
| 4 | Precio y Oferta High-Ticket | `prompts/05-estrategia/` | P00 + P02 + P05 |
| 5 | Estrategia de Contenido que Genera Ventas | `prompts/06-contenido/` | P00 + P02 + P05 + P07 |

---

## Fase 3 — Ejecucion *(obligatorio)*
> Activar canales y sistema de cierre.

| Orden | Prompt | Ubicacion | Requiere |
|-------|--------|-----------|----------|
| 6 | Formatos de Contenido para Instagram | `prompts/06-contenido/` | P00 + P02 + P03 |
| 7 | Sistema de DMs que Cierra Ventas | `prompts/05-estrategia/` | P00 + P02 + P07 |
| 18 | Guion de Llamada de Ventas High-Ticket | `prompts/05-estrategia/` | P00 + P02 + P07 |
| 8 | Crecimiento Organico Acelerado | `prompts/05-estrategia/` | P00 + P02 + P05 |
| 13 | Sistema de Email Marketing | `prompts/09-email-marketing/` | P00 + P02 + P07 + P03 |
| 15 | Gestion de Comunidad y Engagement | `prompts/06-contenido/` | P00 + P02 + P03 |
| 16 | Diseno de Embudo Completo | `prompts/10-funnels/` | P00 + P06 + P07 + P03 + P10 + P13 |

---

## Fase 4 — Aceleracion *(recomendado, requiere presupuesto publicitario)*
> Amplificar con ads pagados.

| Orden | Prompt | Ubicacion | Requiere |
|-------|--------|-----------|----------|
| 9 | Sistema de Anuncios en Meta con ROI Real | `prompts/05-estrategia/` | P00 + P02 + P05 + P07 |
| 10 | Copy Completo para Anuncios de Meta | `prompts/05-estrategia/` | P00 + P02 + P07 + P04 |

---

## Fase 5 — Escala *(opcional)*
> Solo cuando el modelo esta validado y genera ingresos consistentes.

| Orden | Prompt | Ubicacion | Requiere |
|-------|--------|-----------|----------|
| 11 | Plan de Escala 0→20K→100K | `prompts/05-estrategia/` | P00 + P06 + P07 + P04 |

---

## Fase 6 — Consolidacion *(opcional, negocio establecido)*
> Vision estrategica global cuando ya hay traccion y datos reales.

| Orden | Prompt | Ubicacion | Requiere |
|-------|--------|-----------|----------|
| 12 | Sintesis Estrategica: El Prompt Maestro | `prompts/05-estrategia/` | P00 + TODOS los anteriores |

---

## Grafo de dependencias

```
P00 (Brief Ejecutivo)
 ├── P14 (Identidad Visual)
 ├── P02 (Avatar)
 │    ├── P06 (Conversion) ──── P07 (Oferta HT)
 │    │                          ├── P03 (Contenido)
 │    │                          ├── P10 (DMs)
 │    │                          ├── P18 (Guion Ventas)
 │    │                          ├── P04 (Ads Meta)
 │    │                          │    ├── P08 (Copy Ads)
 │    │                          │    └── P09 (Escala)
 │    │                          └── P09 (Escala)
 │    ├── P05 (Competitivo)
 │    │    ├── P07 (Oferta HT)
 │    │    ├── P11 (Organico)
 │    │    └── P03 (Contenido)
 │    ├── P11 (Organico)
 │    └── P03 (Contenido)
 │         ├── P01 (Formatos IG)
 │         └── P15 (Comunidad/Engagement)
 ├── P13 (Email Marketing) ← P00 + P02 + P07 + P03
 ├── P16 (Embudo Completo) ← P00 + P06 + P07 + P03 + P10 + P13
 └── P12 (Sintesis) ← todos los anteriores
```
