---
name: nuevo-cliente
description: Crear la estructura de carpetas para un nuevo cliente y preparar el onboarding. Usar cuando se incorpore un cliente nuevo.
user-invocable: true
disable-model-invocation: true
argument-hint: [nombre-del-cliente]
allowed-tools: Bash, Write, Read
---

# Nuevo Cliente — Aura Digital

Crea la estructura completa de carpetas para un nuevo cliente.

## Estructura a crear

```
clientes/$0/
├── 01-onboarding/
│   ├── formularios/
│   ├── accesos/
│   ├── contrato/
│   └── bienvenida/
├── 02-briefing/
│   ├── brief-cliente/
│   ├── objetivos/
│   └── referencias/
├── 03-branding/
│   ├── identidad-visual/
│   │   ├── logo/
│   │   ├── paleta/
│   │   └── tipografia/
│   └── guia-de-marca/
├── 04-conversaciones/
├── 05-estrategia/
│   ├── diagnostico/
│   ├── marketing/
│   ├── plan-90-dias/
│   ├── posicionamiento/
│   └── publico-objetivo/
├── 06-contenido/
│   ├── calendario-editorial/
│   ├── copies/
│   ├── guiones/
│   ├── instagram/
│   │   ├── carruseles/
│   │   ├── reels/
│   │   └── stories/
│   └── tiktok/
│       ├── guiones/
│       └── videos/
├── 07-entregables/
│   ├── aprobados/
│   ├── documentos/
│   └── presentaciones/
└── 08-reportes/
    ├── instagram-data/
    ├── mes-1/
    ├── mes-2/
    ├── mes-3/
    ├── semana-1/
    ├── semana-2/
    └── semana-3/
```

## Después de crear

1. Confirmar al usuario que la estructura está lista
2. Preguntar si tiene el formulario de onboarding para cargarlo
3. Preguntar si tiene accesos (redes sociales, WordPress, etc.)
