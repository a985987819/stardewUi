# Stardew Valley UI

[![npm version](https://img.shields.io/npm/v/stardew-valley-ui.svg)](https://www.npmjs.com/package/stardew-valley-ui)
[![npm downloads](https://img.shields.io/npm/dm/stardew-valley-ui.svg)](https://www.npmjs.com/package/stardew-valley-ui)
[![types](https://img.shields.io/npm/types/stardew-valley-ui.svg)](https://www.npmjs.com/package/stardew-valley-ui)
[![license](https://img.shields.io/npm/l/stardew-valley-ui.svg)](https://github.com/a985987819/stardewUi/blob/main/LICENSE)
[![English](https://img.shields.io/badge/README-English-1a1a1a?style=flat-square&logo=github)](README.md)
[![中文](https://img.shields.io/badge/README-%E4%B8%AD%E6%96%87-1a1a1a?style=flat-square&logo=github)](README_ZH.md)

> 🐣 32 components · two style entry paths, pick one · zero runtime config · ESM / CJS / full types

A **Stardew Valley-inspired, pixel-art React component library**, built with React,
TypeScript and Vite. It ships composable UI components plus utilities for dates,
canvas nine-slice slicing and pixel shapes.

This is not "swap the buttons for pixel images." The stair-stepped notches in
every wooden frame, the embossed parchment, the progress bar that fills one tile
at a time, the farm shrinking into soft focus behind a dialog — each is drawn
tile by tile into Canvas or sliced from nine-slice assets, following the visual
language of the original. **Install it and your React project grows a farm.**

```tsx
import { StarCard, StarNineSliceButton, StarDialog, message } from 'stardew-valley-ui'
import 'stardew-valley-ui/style.css'

function App() {
  const [open, setOpen] = useState(false)
  return (
    <StarCard title="Pierre's General Store" showTitle>
      <StarNineSliceButton variant="primary" onClick={() => setOpen(true)}>
        See today's stock
      </StarNineSliceButton>
      <StarDialog
        open={open}
        title="Pierre"
        content="Big rain tomorrow. Take these parsnip seeds while you can — spring won't wait."
        onClose={() => setOpen(false)}
      />
    </StarCard>
  )
}
```

Live demo (every component has an interactive example and a full API table):
**<https://a985987819.github.io/stardewUi/?lang=en>**

**[中文文档](README_ZH.md)** · **Report an issue](https://github.com/a985987819/stardewUi/issues/new/choose)

---

## What you get

| | |
| --- | --- |
| 🧩 **32 components** | Forms, overlays, dates, navigation and feedback — all controlled or uncontrolled |
| 🎨 **Canvas pixel rendering** | Titles, pixel text and nine-slice buttons are drawn per pixel, not blurred with a filter |
| ♿ **Accessibility built in** | Focus traps, Esc to close, `aria-modal` and keyboard reachability are not optional |
| 🏗️ **Zero config** | Pixel assets ship inside the package; nothing to copy into your `public/` |
| 📦 **Dual format** | ESM + CommonJS + complete type declarations |
| 🪄 **Two style paths** | Explicit `style.css` (SSR-friendly) or `/auto` injection (client-only) |
| 🤖 **Agent-friendly** | An installable Skill so AI Agents write against the real API instead of guessing |

---

## Install

One command, whichever package manager you use:

```bash
npm install stardew-valley-ui     # or: bun add / pnpm add / yarn add
```

That is the whole install. React >= 18 is the only peer requirement;
`clsx` and `lucide-react` come along automatically — nothing to add by hand,
and no files to copy into `public/`.

> Upgrading from **0.2.x**? Read the [migration guide](docs/migration-0.3.md) first:
> `visible` is now `open`, and preset color names moved to `tone` / `surface`.

---

## Quick start

### 1. Bring in the styles

Import the stylesheet once, in your app's global entry (**preferred**: styles go
through your own build, so SSR does not flash unstyled):

```tsx
import 'stardew-valley-ui/style.css'
```

Prefer not to write that line? Use the **auto-injecting** entry — component
imports stay identical:

```tsx
import { StarCard, StarNineSliceButton } from 'stardew-valley-ui/auto'
// Styles are injected into <style> on module load; no CSS import needed.
```

Pick **one** path only. Keeping both is harmless (injection probes the page first
and skips if the stylesheet is already there). The trade-offs are in the
[integration guide](docs/consumer-integration.md).

### 2. Use a component

```tsx
import { useState } from 'react'
import { StarCard, StarNineSliceButton, StarDialog, message } from 'stardew-valley-ui'

function App() {
  const [open, setOpen] = useState(false)

  return (
    <StarCard title="Harvest board" showTitle>
      <StarNineSliceButton variant="primary" onClick={() => setOpen(true)}>
        Open dialog
      </StarNineSliceButton>

      <StarDialog
        open={open}
        title="Shipping bin"
        content="One iridium bar, three omni-geodes. Sign here."
        onClose={() => setOpen(false)}
        actions={[
          { text: 'Not yet', variant: 'secondary', onClick: () => setOpen(false) },
          { text: 'Ship it', variant: 'primary', onClick: () => message.success('Shipped!') },
        ]}
      />
    </StarCard>
  )
}
```

`message` is a command-style API — call it from anywhere, including outside
React's render phase.

---

## Using it inside another frontend project

Class names inside the library are CSS Modules, so nothing leaks into your global
scope. It composes cleanly with Ant Design, Element Plus, or any existing design
system.

**Custom image assets**: the built-in button, seasonal theme, calendar
background, empty-state and loading artwork all ship with the package — install
and they just work. When you pass your own via `backgroundSrc`, `imageSrc`, `src`
and friends, hosting and caching are your project's business. In Vite, pass a
statically imported URL:

```tsx
import customButtonBackground from './assets/custom-button.png'
import { StarNineSliceButton } from 'stardew-valley-ui'

export function SaveButton() {
  return <StarNineSliceButton backgroundSrc={customButtonBackground}>Save</StarNineSliceButton>
}
```

**SSR / RSC boundary**: `StarDialog`, `message`, the canvas backgrounds and the
storage hooks touch the DOM, Canvas or Storage on the client. With Next.js, RSC
or any SSR framework, mark the interactive components that use them as client
components (`'use client'`), and never call the imperative `message(...)` during
a server render pass.

For assets, SSR / RSC boundaries and the maintainer's release checklist, see
[docs/consumer-integration.md](docs/consumer-integration.md).

### Component index

| Category | Exports |
|----------|---------|
| Containers & display | `StarCard`, `StarTitle`, `StarPixelText`, `StarDisplayFrame`, `StarDivider`, `StarAvatar`, `StarEmptyState`, `StarLoading`, `StarTag`, `StarBadge`, `StarCollapse`, `StarSkeleton`, `StarBackToTop` |
| Forms & actions | `StarNineSliceButton`, `StarInput`, `StarTextarea`, `StarSwitch`, `StarRadio`, `StarCheckbox`, `StarSelect`, `StarRating`, `StarProgress` |
| Feedback & overlays | `StarDialog`, `StarDrawer`, `StarPopup`, `message`, `StarTypewriter`, `StarAlert` |
| Dates & navigation | `StarCalendar`, `StarDatePicker`, `StarTab`, `StarPagination` |

Hooks (`useToggle`, `useClipboard`, `useLocalStorage`, `useNineSliceBackground`),
utilities (`classNames`, `copyToClipboard`, `resolveAssetPath`, the pixel-shape and
nine-slice helpers) and every Props type are exported from the root entry; import
types with `import type`.

**Where the full API lives.** Every component page on the live demo ends in an
API table, bilingual and next to a runnable example:

- **[Components](https://a985987819.github.io/stardewUi/components?lang=en)** — the catalogue, with a page per component

This README deliberately does not carry per-component Props tables. Hand-written
tables drift from the real type declarations, and the declarations are the only
authoritative source. The demo generates its tables from the same source that
ships the package.

---

## Let an AI Agent use it for you

The repo ships an installable [`stardew-valley-ui` Skill](skills/stardew-valley-ui/SKILL.md)
for Codex, Claude Code, Cursor and anything else that reads `SKILL.md`. It
collapses "install the library → pick the single style entry → implement against
the public API → run the project checks" into one real workflow, so agents stop
inventing props.

**Copy one line.** Pick your agent, paste, done:

```bash
# Claude Code (user scope — available in every project)
mkdir -p ~/.claude/skills && git clone --depth 1 https://github.com/a985987819/stardewUi.git ~/.claude/skills/stardew-valley-ui

# Codex / any agent that reads skills from the project
git clone --depth 1 https://github.com/a985987819/stardewUi.git .agents/skills/stardew-valley-ui

# Or install globally, if your agent has a skills CLI
skills add a985987819/stardewUi
```

Don't want to install anything? Paste this into your agent instead:

> Use the `stardew-valley-ui` React component library. Install it, import
> `stardew-valley-ui/style.css` exactly once, then build the page from its public
> API. Check the installed package's `.d.ts` files for real prop names — do not
> guess them.

Once installed, describe the page you want or invoke `$stardew-valley-ui`
explicitly. Exact props always come from the installed package's TypeScript
declarations, so the agent cannot drift from what you actually have.

---

## Frequently asked questions

<details>
<summary><b>Styles are broken or not applying at all?</b></summary>

Nine times out of ten the stylesheet was never imported. It lives on a separate
subpath and needs one explicit line: `import 'stardew-valley-ui/style.css'`.
If you use the `/auto` entry, drop that line but import from
`stardew-valley-ui/auto` instead of `stardew-valley-ui`.
</details>

<details>
<summary><b><code>window is not defined</code> or hydration mismatch in Next.js?</b></summary>

`StarDialog`, `message`, the canvas components and the storage hooks touch the
DOM / Canvas / Storage on the client. Mark the components that use them
`'use client'`. SSR projects should also use the explicit stylesheet — `/auto`
injects on the client, which flashes unstyled on first paint and needs CSP
`unsafe-inline`.
</details>

<details>
<summary><b>Why didn't <code>&lt;StarTag color="green"&gt;</code> turn green?</b></summary>

A breaking change in 0.3.0: `color` now means **a CSS colour** across the whole
library, and presets moved to `tone` (Tag) / `surface` (Card). So
`<StarTag tone="green">Fresh crop</StarTag>`. The old spelling does not error —
`green` is not a valid CSS colour, so it quietly resolves to something else.
That ambiguity is exactly why the split exists; full list in the
[migration guide](docs/migration-0.3.md).
</details>

<details>
<summary><b>Console warning about <code>color</code> accepting only hex?</b></summary>

`StarProgress`, `StarDivider`, `StarSwitch` and friends derive their palettes by
mixing RGB channels to produce borders, highlights and shadows, so `color` takes
**3- or 6-digit hex only** (`#fff`, `#7a9c48`). Names like `red` and
`var(--brand)` now warn in development — use hex.
</details>

<details>
<summary><b>How do I link the demo in a specific language?</b></summary>

Add the parameter: <https://a985987819.github.io/stardewUi/?lang=en> or `?lang=zh`.
It takes priority over whatever the browser remembers, so the link works for the
person you send it to. Without a parameter the demo keeps your last choice
(Chinese on a first visit). The globe icon in the header rewrites the parameter as
you switch, and in-app navigation preserves it.
</details>

<details>
<summary><b>Why is the package 4MB?</b></summary>

Almost all of it is **inlined pixel artwork** — buttons, seasonal themes,
calendar backgrounds, empty states, loading animations. What you get in exchange
is zero config: no files to copy into `public/`, no CDN to configure, and image
paths that cannot break when your deploy directory changes. The actual JS is ~100
exports and gzips far smaller.
</details>

<details>
<summary><b>Can I use it in a commercial project?</b></summary>

Yes. This project is **MIT licensed** — use it commercially, in closed-source
products, in paid services, whatever you like. The only requirements are keeping
the copyright notice and the license text. Full terms in [LICENSE](LICENSE).

This project is not affiliated with or endorsed by the makers of Stardew Valley,
and ships none of their assets.
</details>

---

## Table of contents

- [What you get](#what-you-get) · [Install](#install) · [Quick start](#quick-start) · [Using it inside another frontend project](#using-it-inside-another-frontend-project)
- [Let an AI Agent use it for you](#let-an-ai-agent-use-it-for-you) · [Frequently asked questions](#frequently-asked-questions) · [License](#license)
- [Say something — honestly, anything](#say-something--honestly-anything) · [Buy me a coffee](#buy-me-a-coffee-) · [Acknowledgements](#acknowledgements) · [Contributing](#contributing)

---

## License

**MIT.** You may use, modify, and redistribute this project, including
commercially and inside closed-source products. The two requirements are to keep
the copyright notice and the license text.

This is an original, independent library. It is **not affiliated with, endorsed
by, or associated with ConcernedApe LLC or the game Stardew Valley**, and no game
artwork, music, fonts, or other assets are distributed with it — those rights
remain with their respective owners. The name is used descriptively, to say what
the library is inspired by.

The full terms live in [LICENSE](https://github.com/a985987819/stardewUi/blob/main/LICENSE).

> **⚠️ Older versions on npm (0.1.0 – 0.4.0) shipped under different terms.**
> They were published as non-commercial, and `0.1.0` / `0.2.0` additionally
> declared a `license` value npm could not parse — which npm resolves to MIT.
> The code was MIT-labelled on the registry the whole time while `LICENSE`
> forbade commercial use. From **0.5.0** the field is a plain `"MIT"` and the
> terms match. If you pinned an old version and need the historical terms, read
> the `LICENSE` file in that version's tag.

Donations are voluntary and change nothing: the MIT terms above apply whether you
support the project or not.

---

## Say something — honestly, anything

What this library has gained since day one is not the 32 components. It's the
bugs **you** ran into. **Every piece of feedback gets read**, including
"I don't really like this design."

👉 **[Open an issue](https://github.com/a985987819/stardewUi/issues/new/choose)** —
"it doesn't work", "it's hard to use", "it doesn't look right", and especially
"why is it built this way?" are all welcome. The trade-offs behind the
implementation are written down in the [migration guide](docs/migration-0.3.md)
and in code comments — but that's *my* view, and your use case is different.
**Where something feels wrong to you is very likely exactly what I never
considered.**

> Not sure if it counts as a bug? File it as one. A lot of the design here has
> only ever been used by me, which makes me the last person qualified to notice.

---

## Buy me a coffee ☕

> **First, the important part: a donation is not a licence purchase — and it
> never could be.** This is an MIT-licensed project, which means anyone may use
> it commercially without paying and without asking. Support is entirely
> voluntary, and it buys the maintainer time, not a licence.
>
> That is the deal: use it however you want, including in paid products, and
> tip if it saved you time. Money goes only to maintenance — component
> development, bug fixes, documentation and artwork.

**→ [Open the donation page](https://a985987819.github.io/stardewUi/support?lang=en)**
WeChat Pay and Alipay codes, and an itemised list of what the money is for.
Any amount works — one coffee is plenty.

Other channels: **Afdian** — <https://afdian.com/malatang1>

**Not accepted**: paid feature work and "open source partnership" in name only —
those are about my time, not the licence. See [docs/sponsoring.md](docs/sponsoring.md).

> On licensing specifically: I cannot and will not sell you an exception. MIT has
> no exception to sell. If you need something the licence does not give you —
> indemnification, a private SLA, your own fork under your own terms — that is a
> conversation about paid work, not a licence amendment.

## Acknowledgements

The welcome page's interaction rhythm and visual feel were inspired by
[Animal Island UI](https://github.com/guokaigdg/animal-island-ui). Details in
[docs/acknowledgements.md](docs/acknowledgements.md). No code or assets were
copied from it.

## Contributing

- Found a bug, a rough edge, or a design that reads wrong to you? That is the
  most valuable kind of report — [open an issue](#say-something--honestly-anything).
- Want to help maintain it? React + TypeScript, Bun, Vite, SCSS, Vitest.
- Working with an AI Agent? Install the
  [Agent Skill](#let-an-ai-agent-use-it-for-you) so it writes against the real
  API instead of inventing props.