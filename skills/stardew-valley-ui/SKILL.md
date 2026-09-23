---
name: stardew-valley-ui
description: >
  Build or review React interfaces with the stardew-valley-ui component library and its
  original Stardew Valley-inspired pixel-art visual language. Use when a user asks to use
  stardew-valley-ui / StardewValley UI, requests an original cozy pixel-farm interface,
  needs a component page using StarCard, StarNineSliceButton, StarDialog, StarCalendar,
  or related Star* components, or wants to integrate, audit, or style this library.
---

# Stardew Valley UI

`stardew-valley-ui` is a React 18+ and TypeScript component library for original,
Stardew Valley-inspired pixel-art interfaces. It is intended for personal learning,
research, portfolio display, non-profit open-source experiments, and non-commercial
internal prototypes. Do not use it for commercial work; preserve its attribution and
license.

Canonical source: https://github.com/a985987819/stardewUi

## Choose the scenario first

| Scenario | Read next |
| --- | --- |
| Existing or new React application using the npm package | [references/react-project.md](references/react-project.md) |
| Need the exported components, valid imports, or a component choice | [references/component-catalog.md](references/component-catalog.md) |
| Updating this repository itself | Read the repository's `docs/component-conventions.md` and local `AGENTS.md` when present |

## Visual direction

Keep the interface warmly pixelated and tactile: stepped corners, dark earth-brown ink,
parchment and wood surfaces, low-saturation seasonal accents, and deliberately visible
pixel borders. Prefer the library's components and built-in canvas assets over imitating
the style with rounded generic cards, smooth gradients, emoji icons, or unrelated UI kits.

For custom surrounding layout, use the project's existing CSS variables and palette
helpers instead of scattering new one-off colours. Preserve a clear keyboard focus state,
readable contrast, responsive single-column behaviour on narrow screens, and user-visible
feedback for asynchronous or destructive actions.

## Hard rules

1. Inspect installed TypeScript declarations or the local source before using a prop. Never invent a component, prop, variant, or callback.
2. Use exactly one style strategy: the recommended `import 'stardew-valley-ui/style.css'`
   plus imports from `stardew-valley-ui`, **or** imports from `stardew-valley-ui/auto`.
3. Do not deep-import internals. Public imports are the package root, `style.css`, and
   the `/auto` entry only.
4. Use the `Star*` component that expresses the interaction before falling back to a
   native visible control; do not replace the library's pixel border, shadows, or canvas
   treatment with arbitrary inline styles.
5. In SSR/RSC applications, put browser-dependent components and hooks behind the smallest
   practical `'use client'` boundary. Do not call `message(...)` during render or on the server.
6. Use a confirmation flow for destructive changes and ensure keyboard users can operate
   every interactive element.
7. Built-in assets ship with the package. For application-owned images, pass an imported
   asset URL (rather than a fragile relative string) where the component supports it.

## Delivery checklist

Before finishing, verify that styles are loaded once, imports resolve from public entries,
controlled state has matching callbacks, narrow layouts remain usable, and the code passes
the host project's typecheck/lint/test commands. State any constraint or license implication
that requires the user's decision.
