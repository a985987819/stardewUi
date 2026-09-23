---
name: stardew-valley-ui
description: >
  Install, integrate, or review the stardew-valley-ui React component library. Use when a
  user asks to use stardew-valley-ui / StardewValley UI, needs an original cozy pixel-farm
  interface built from Star* components, or wants an integration, API, style-loading, SSR,
  accessibility, or license review for this library.
---

# Stardew Valley UI

Use this skill to make the library usable in a real React project, rather than merely
recreating its visual style. The package supports React 18+ and TypeScript and is limited
to personal learning, research, portfolio display, non-profit open-source experiments, and
non-commercial internal prototypes. Preserve attribution and the project's license; do not
approve or implement commercial use.

Canonical source: https://github.com/a985987819/stardewUi

## Actual use

After this skill is installed, it can be selected automatically for a matching task or
called explicitly as `$stardew-valley-ui`. A useful task request states the page goal,
data, interactions, and constraints, for example:

```text
$stardew-valley-ui Build a responsive farm inventory page in my React app.
Use StarCard for item groups, StarTab for seasons, and StarDialog to confirm discard.
Load styles explicitly, keep the state controlled, and verify the result with the project checks.
```

For a library integration task, use this sequence:

1. Confirm whether `stardew-valley-ui` is already installed. If it is absent and the user
   asked to integrate it, add it with the consuming project's package manager.
2. Choose **one** public style-loading route: explicit `style.css` (the default, including
   SSR/RSC) or the client-only `/auto` entry. Do not load both as a normal implementation.
3. Select public `Star*` components based on the page's interactions. Before using props or
   variants, inspect the installed package's declarations or local source.
4. Implement the smallest accessible, responsive composition that satisfies the request.
   Keep browser-dependent features behind a client boundary in SSR/RSC projects.
5. Run the consuming project's relevant typecheck, lint, tests, and production build; report
   the style entry, public imports, and any license constraint that affects the request.

If the request is only to review code, do not install packages or change the application;
inspect its existing imports, styles, interaction states, and framework boundary instead.

## Read only what the task needs

| Scenario | Read next |
| --- | --- |
| Installing in, or implementing with, an existing/new React application | [references/react-project.md](references/react-project.md) |
| Choosing a component, confirming an export, or checking exact props | [references/component-catalog.md](references/component-catalog.md) |
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

## Integration rules

1. Inspect installed TypeScript declarations or the local source before using a prop. Never invent a component, prop, variant, or callback.
2. Choose one style strategy: the recommended `import 'stardew-valley-ui/style.css'` plus
   imports from `stardew-valley-ui`, **or** imports from `stardew-valley-ui/auto` in a
   client-only app. Do not add both approaches to a new integration.
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

## Finish well

Before finishing, verify that styles are loaded once, imports resolve from public entries,
controlled state has matching callbacks, narrow layouts remain usable, and the code passes
the host project's typecheck/lint/test commands. State any constraint or license implication
that requires the user's decision.
