# Phase 9: Rediseño UX/UI con estilo Material Design y Flat Design - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-07-09
**Phase:** 09-rediseno-ux-ui-material-design-flat-design
**Areas discussed:** MD Generation, Color primario / paleta, Jerarquía de botones, Librería vs CSS (→ Tailwind), Escala tipográfica, Header / Top App Bar, Queue strip

---

## Generación de Material Design

| Opción | Descripción | Seleccionada |
|--------|-------------|--------------|
| MD3 / Material You | Generación actual, superficies tonales, más Flat-compatible | ✓ |
| MD2 clásico | Sombras pronunciadas, botones rectangulares, paper cards | |
| Híbrido MD2/MD3 | Lo mejor de ambos; más trabajo de diseño | |

**Elección del usuario:** MD3 / Material You

---

| Opción | Descripción | Seleccionada |
|--------|-------------|--------------|
| Surface tones (MD3 nativo) | Fondo tintado con primario, sin shadow pronunciada | ✓ |
| Sombra leve + surface | box-shadow discreta + tarjetas blancas | |
| Outlined cards | Borde sin sombra ni tinte | |

**Elección:** Surface tones

---

| Opción | Descripción | Seleccionada |
|--------|-------------|--------------|
| Solo modo claro | Sin dark mode | ✓ |
| Modo claro + oscuro automático | @media (prefers-color-scheme: dark) | |

**Elección:** Solo modo claro

---

## Color primario / paleta

| Opción | Descripción | Seleccionada |
|--------|-------------|--------------|
| Azul médico (#1976D2) | MD Blue 700, confianza y profesionalismo | ✓ |
| Teal (#00897B) | Más fresco, muy usado en clínicas modernas | |
| Índigo (#3F51B5) | Suave, elegante | |
| Color personalizado | Freeform | |

**Elección:** Azul médico `#1976D2`

---

| Opción | Descripción | Seleccionada |
|--------|-------------|--------------|
| Blanco puro (#FFFFFF) | Máximo contraste | ✓ |
| Surface tint leve (#F4F7FF) | MD3 auténtico, más personalidad | |

**Elección:** Blanco puro `#FFFFFF`

---

| Opción | Descripción | Seleccionada |
|--------|-------------|--------------|
| Rojo MD3 (#B3261E) | Error estándar MD3 | ✓ |
| Mantener rojo actual (#c0392b) | Reconocible y funciona | |
| Naranja ambarino (#E65100) | Tono de advertencia, más suave | |

**Elección:** Rojo MD3 `#B3261E`

---

| Opción | Descripción | Seleccionada |
|--------|-------------|--------------|
| Sí, usar azul primario con opacidad | rgba(25,118,210,0.25) — coherente con MD3 | ✓ |
| Mantener el ámbar (#fbbf24) | Contrasta bien sobre surface azul | |

**Elección:** Actualizar flash a azul primario con opacidad

---

## Jerarquía de botones

| Opción | Descripción | Seleccionada |
|--------|-------------|--------------|
| Filled (azul sólido) | #1976D2, texto blanco, máximo énfasis | ✓ |
| Filled Tonal | #E8F0FE, texto azul oscuro | |

**Elección "Llamar siguiente":** Filled azul

---

| Opción | Descripción | Seleccionada |
|--------|-------------|--------------|
| Agregar turno = Filled Tonal / Agregar ventanilla = Outlined | Jerarquía diferenciada | ✓ |
| Agregar turno = Filled / Agregar ventanilla = Text | Dos Filled compiten | |
| Ambos = Filled Tonal | Uniforme pero menos diferenciado | |

**Elección:** Agregar turno = Filled Tonal · Agregar ventanilla = Outlined

---

| Opción | Descripción | Seleccionada |
|--------|-------------|--------------|
| Icon button MD3 (círculo transparente + hover) | Estándar MD3 | ✓ |
| Mantener texto × pequeño | Solo actualizar colores | |

**Elección:** Icon button MD3

---

| Opción | Descripción | Seleccionada |
|--------|-------------|--------------|
| Chips outlined MD3 (borde azul, texto azul, fondo blanco) | Estándar MD3 | ✓ |
| Assist chips (surface tint, sin borde) | Más Flat | |
| Filled chips (bg primario, texto blanco) | Mayor contraste pero compite con botones | |

**Elección:** Chips outlined MD3

---

| Opción | Descripción | Seleccionada |
|--------|-------------|--------------|
| Full pill / 999px | Estándar MD3 botones | ✓ |
| 20px (squircle MD3) | Punto intermedio | |
| 8px | Más cuadrado, clásico | |

**Elección botones:** border-radius `9999px` (pill)

---

| Opción | Descripción | Seleccionada |
|--------|-------------|--------------|
| 12px (medium MD3) | Estándar MD3 cards | ✓ |
| 16px (large MD3) | Más "soft" y moderno | |
| 8px | Más cuadrado, Flat clásico | |

**Elección tarjetas:** border-radius `12px`

---

## Librería vs CSS / Tailwind

| Opción | Descripción | Seleccionada |
|--------|-------------|--------------|
| CSS puro (variables CSS + clases) | Sin deps, reescribir index.css | |
| MUI / @mui/material | ~130-200KB, agrega @emotion | |
| Material Web Components | ~30-50KB, custom elements | |
| Tailwind CSS v4 (freeform "Other") | Utility-first CSS framework | ✓ |

**Elección del usuario:** Tailwind CSS v4 (respuesta libre, fuera de las opciones)

---

| Opción | Descripción | Seleccionada |
|--------|-------------|--------------|
| Tailwind CSS v4 | @tailwindcss/vite, @theme nativo, más moderno | ✓ |
| Tailwind CSS v3 | tailwind.config.js + postcss, más docs/ejemplos | |

**Elección:** Tailwind CSS v4

---

| Opción | Descripción | Seleccionada |
|--------|-------------|--------------|
| Reemplazar por completo con clases Tailwind en JSX | Más Tailwind-nativo | ✓ |
| Híbrido: Tailwind + @apply en index.css | @apply desaconsejado en v4 | |

**Elección:** Reemplazar completamente — clases Tailwind en JSX

---

| Opción | Descripción | Seleccionada |
|--------|-------------|--------------|
| CSS custom properties en @theme (Tailwind v4 nativo) | Genera clases automáticamente | ✓ |
| Clases hardcoded de Tailwind (bg-blue-700) | Más rápido pero colores no exactos | |

**Elección:** @theme con custom properties para colores MD3

---

| Opción | Descripción | Seleccionada |
|--------|-------------|--------------|
| @keyframes en CSS + clase dinámica con Tailwind | Animación en CSS, clase aplicada desde JSX | ✓ |
| @theme custom animation en Tailwind v4 | 100% Tailwind pero más setup | |

**Elección:** Animación flash permanece en CSS puro

---

| Opción | Descripción | Seleccionada |
|--------|-------------|--------------|
| No tocar tests funcionales | Solo CSS/presentación cambia | ✓ |
| Actualizar tests de animación de flash | Actualizar App.test.tsx | |

**Elección:** No tocar tests funcionales

---

| Opción | Descripción | Seleccionada |
|--------|-------------|--------------|
| Mantener 'ventanilla-ticket-flash' como clase CSS pura | Tests de Phase 6 pasan sin cambios | ✓ |
| Actualizar el test para buscar la nueva clase | Rompe decisión de no tocar tests | |

**Elección:** Conservar `ventanilla-ticket-flash` en CSS (no migrar a Tailwind)

---

| Opción | Descripción | Seleccionada |
|--------|-------------|--------------|
| Escala Tailwind estándar + Roboto de Google Fonts | CDN externo, look MD genuino | ✓ |
| Escala Tailwind estándar + fuente sistema | Roboto via sistema, sin CDN | |

**Elección:** Roboto via Google Fonts CDN

---

## Escala tipográfica MD3

| Opción | Descripción | Seleccionada |
|--------|-------------|--------------|
| Display Small MD3: 36px / 400 | text-4xl font-normal | ✓ |
| Headline Large MD3: 32px / 400 | Un escalón más abajo | |
| Mantener 28px / 700 | Sin cambios | |

**Elección título 'Turnero':** 36px / font-weight 400

---

| Opción | Descripción | Seleccionada |
|--------|-------------|--------------|
| Title Large MD3: 22px / 500 | text-[22px] font-medium | ✓ |
| Headline Small MD3: 24px / 400 | Un poco más grande | |

**Elección títulos de sección:** 22px / font-weight 500

---

## Header / Top App Bar

| Opción | Descripción | Seleccionada |
|--------|-------------|--------------|
| Top App Bar con fondo primario (#1976D2), título blanco | Firma visual MD más reconocible | ✓ |
| Barra de superficie blanca / elevation 0 | MD3 moderno, menos impacto visual | |
| Mantener h1 suelto | Sin barra de navegación | |

**Elección:** Top App Bar con fondo primario azul y título blanco

---

| Opción | Descripción | Seleccionada |
|--------|-------------|--------------|
| Debajo del top bar (en body) | Semánticamente correcto | ✓ |
| Dentro del top bar como trailing action | Requiere FAB o icon button en barra | |

**Elección "Agregar turno":** Permanece debajo del top bar

---

| Opción | Descripción | Seleccionada |
|--------|-------------|--------------|
| Estático (no sticky) | Más simple, raramente hay scroll | |
| Sticky (sticky top-0 z-10) | Fijo al hacer scroll con muchas ventanillas | ✓ |

**Elección top bar:** Sticky

---

## Queue strip (sección Cola)

| Opción | Descripción | Seleccionada |
|--------|-------------|--------------|
| Surface variant MD3 (bg primary-container, border-radius 12px) | Card MD3 diferenciada, auténtica | ✓ |
| Card Outlined (borde, fondo blanco) | Flat Design puro, menos color | |
| Sin fondo diferenciado | Minimalista, solo separación con título | |

**Elección:** Surface variant MD3 — fondo `#BBDEFB`, `border-radius: 12px`

---

## Claude's Discretion

Ninguna área fue delegada completamente a Claude — el usuario tomó todas las decisiones con opciones concretas.

## Deferred Ideas

Ninguna — la discusión se mantuvo dentro del scope de rediseño visual de la fase.
