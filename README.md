# Stardew Valley UI

[![npm version](https://img.shields.io/npm/v/stardew-valley-ui.svg)](https://www.npmjs.com/package/stardew-valley-ui)
[![npm downloads](https://img.shields.io/npm/dm/stardew-valley-ui.svg)](https://www.npmjs.com/package/stardew-valley-ui)
[![types](https://img.shields.io/npm/types/stardew-valley-ui.svg)](https://www.npmjs.com/package/stardew-valley-ui)
[![license](https://img.shields.io/npm/l/stardew-valley-ui.svg)](https://github.com/a985987819/stardewUi/blob/main/LICENSE)
[![English](https://img.shields.io/badge/README-English-1a1a1a?style=flat-square&logo=github)](README.md)
[![中文](https://img.shields.io/badge/README-%E4%B8%AD%E6%96%87-1a1a1a?style=flat-square&logo=github)](README_ZH.md)

> 🐣 27 components · 2 style entry paths, pick one · zero runtime config · ESM / CJS / full types

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
**<https://a985987819.github.io/stardewUi/>**

**[中文文档](README_ZH.md)** · **Report an issue](https://github.com/a985987819/stardewUi/issues/new/choose)

---

## What you get

| | |
| --- | --- |
| 🧩 **27 components** | Forms, overlays, dates, navigation and feedback — all controlled or uncontrolled |
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
and skips if the stylesheet is already there). Guidance:
[integration guide](docs/consumer-integration.md#style-import).

### 2. Use a component

```tsx
import { useState } from 'react'
import { StarCard, StarNineSliceButton, StarDialog, message } from 'stardew-valley-ui'

function App() {
  const [open, setOpen] = useState(false)

  return (
    <div>
      <StarCard title="Harvest board" showTitle>
        <p>Ship it and move on to the next season.</p>
      </StarCard>

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
    </div>
  )
}
```

### 3. Imperative feedback

```tsx
import { message } from 'stardew-valley-ui'

message.success('Saved to the shipping bin')
message.error('The barn is full')
```

`message` is a command-style API, not a component — call it from anywhere,
including outside React's render phase.

---

## Using it inside another frontend project

Class names inside the library are CSS Modules, so nothing leaks into your global
scope. It composes cleanly with Ant Design, Element Plus, or any existing design
system.

### Style import: pick one, not both

Styles need to take effect exactly once. Both paths use **identical component
imports** — only the CSS line differs:

| Path | How | When |
| --- | --- | --- |
| **Explicit stylesheet** (preferred) | `import 'stardew-valley-ui/style.css'` + import components from `stardew-valley-ui` | Everything, especially Next.js / SSR / CSP-restricted projects |
| **Auto-injecting entry** | Import components from `stardew-valley-ui/auto` | Client-only apps (Vite / CRA) that want to skip the CSS line |

```tsx
// Path 1: main.tsx or app/layout.tsx
import 'stardew-valley-ui/style.css'
import { StarCard } from 'stardew-valley-ui'

// Path 2: no CSS import at all
import { StarCard } from 'stardew-valley-ui/auto'
```

Pick **one**. Keeping both is harmless — injection probes for the stylesheet and
skips if it is already on the page, so you will never ship the CSS twice.

> **The cost of auto-injection**: it creates a `<style id="stardew-valley-ui-styles">`
> at module load. That means SSR / SSG can briefly render unstyled (the styles land
> on the client), and it needs `style-src 'unsafe-inline'` in your CSP. SSR projects
> should still use the explicit stylesheet — see the
> [integration guide](docs/consumer-integration.md#style-import).

### Custom image assets

Built-in button, seasonal theme, calendar background, empty-state and loading
artwork all ship with the package — install and they just work. When you pass your
own via `backgroundSrc`, `imageSrc`, `src` and friends, hosting and caching are
your project's business. In Vite, pass a statically imported URL:

```tsx
import customButtonBackground from './assets/custom-button.png'
import { StarNineSliceButton } from 'stardew-valley-ui'

export function SaveButton() {
  return <StarNineSliceButton backgroundSrc={customButtonBackground}>Save</StarNineSliceButton>
}
```

### SSR / RSC boundary

`StarDialog`, `message`, the canvas backgrounds and the storage hooks touch the
DOM, Canvas or Storage on the client. With Next.js, RSC or any SSR framework,
mark the interactive components that use them as client components
(`'use client'`), and never call the imperative `message(...)` during a server
render pass.

### Where the full API lives

This README stays short on purpose. The **complete prop tables for all 27
components — plus every hook, utility and type — live in the
[Chinese README](README_ZH.md)**, which is generated from the demo sources and
checked against the TypeScript declarations by the test suite.

Two pages on the **live demo** carry the same API in English, with live
examples you can interact with:

- **[Components](https://a985987819.github.io/stardewUi/components)** — the catalogue
- **[Buy me a coffee](https://a985987819.github.io/stardewUi/support)** — support & donation

Switch the demo to English with the globe icon in the header.

### Component index

| Category | Exports |
|----------|---------|
| Containers & display | `StarCard`, `StarTitle`, `StarPixelText`, `StarDisplayFrame`, `StarDivider`, `StarAvatar`, `StarEmptyState`, `StarLoading`, `StarTag`, `StarBadge`, `StarCollapse`, `StarSkeleton` |
| Forms & actions | `StarNineSliceButton`, `StarInput`, `StarTextarea`, `StarSwitch`, `StarRadio`, `StarCheckbox`, `StarSelect`, `StarRating`, `StarProgress` |
| Feedback & overlays | `StarDialog`, `StarDrawer`, `StarPopup`, `message`, `StarTypewriter`, `StarAlert` |
| Dates & navigation | `StarCalendar`, `StarDatePicker`, `StarTab`, `StarPagination` |

Full prop types are importable from the root entry via `import type`. Every
component accepts `className`, and most container components forward native
`style` and the matching DOM attributes.

For assets, SSR / RSC boundaries and the maintainer's release checklist, see
[docs/consumer-integration.md](docs/consumer-integration.md).

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

<details>
<summary><b>Don't want to install anything?</b></summary>

You don't have to. Paste this into your agent instead:

> Use the `stardew-valley-ui` React component library. Install it, import
> `stardew-valley-ui/style.css` exactly once, then build the page from its public
> API. Check the installed package's `.d.ts` files for real prop names — do not
> guess them. Follow the repo's component conventions at
> <https://github.com/a985987819/stardewUi/blob/main/docs/component-conventions.md>.

That is the whole instruction. The Skill just automates it.
</details>

Once installed, describe the page you want or invoke `$stardew-valley-ui`
explicitly — e.g. "build a farm inventory page with Stardew Valley UI; import
style.css once, and confirm a discard action with StarDialog." Exact props always
come from the installed package's TypeScript declarations, so the agent cannot
drift from what you actually have. The live demo's "Guide → Agent help" covers
installation, real invocation and a request template.

---

## Frequently asked questions

<details>
<summary><b>Styles are broken or not applying at all?</b></summary>

Nine times out of ten the stylesheet was never imported. It lives on a separate
subpath and needs one explicit line: `import 'stardew-valley-ui/style.css'`.
If you use the `/auto` entry, drop that line but import from
`stardew-valley-ui/auto` instead of `stardew-valley-ui` — mixing both makes the
loading path hard to reason about. See the
[integration guide](https://github.com/a985987819/stardewUi/blob/main/docs/consumer-integration.md).
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
<summary><b>Why is the package 4MB?</b></summary>

Almost all of it is **inlined pixel artwork** — buttons, seasonal themes,
calendar backgrounds, empty states, loading animations. What you get in exchange
is zero config: no files to copy into `public/`, no CDN to configure, and image
paths that cannot break when your deploy directory changes. The actual JS is 107
exports and gzips far smaller.
</details>

<details>
<summary><b>Can I use it in a commercial project?</b></summary>

No. This project ships under a **non-commercial license** — personal learning,
research, portfolios and non-profit experiments only. Full terms in
[LICENSE](LICENSE).
</details>

---

## Table of contents

- [What you get](#what-you-get) · [Install](#install) · [Quick start](#quick-start) · [Using it inside another frontend project](#using-it-inside-another-frontend-project)
- [Let an AI Agent use it for you](#let-an-ai-agent-use-it-for-you) · [Frequently asked questions](#frequently-asked-questions)
- [Say something — honestly, anything](#say-something--honestly-anything) · [Buy me a coffee](#buy-me-a-coffee-) · [License](#license) · [Acknowledgements](#acknowledgements) · [Contributing](#contributing)

---

## Say something — honestly, anything

What this library has gained since day one is not the 27 components. It's the
bugs **you** ran into. **Every piece of feedback gets read**, including
"I don't really like this design."

👉 **[Open an issue](https://github.com/a985987819/stardewUi/issues/new/choose)** —
any of these, no forms required:

- **It doesn't work** — "styles didn't apply after install", "focus jumps when I open the dialog"
- **It's hard to use** — "six lines to pop a dialog", "why both `open` and `visible`?"
- **It doesn't look right** — "this blue isn't the game's blue", "the border is a touch heavy"
- **Why is it built this way?** — "why nine-slice buttons instead of rounded corners?", "was the motion curve picked at random?"

The last category is my favourite. The trade-offs behind the implementation are
written down in the [migration guide](docs/migration-0.3.md) and in code comments
— but that's *my* view. Your use case is different, so what trips you up is
different too. **Where something feels wrong to you is very likely exactly what
I never considered.**

> Not sure if it counts as a bug? File it as one. A lot of the design here has
> only ever been used by me, which makes me the last person qualified to notice.

---

## Buy me a coffee ☕

> **First, the important part: a donation is not a licence purchase.**
> Using the library is free, and stays free. Support is voluntary: it does not
> affect free use, and it does not change the licence — this project stays
> non-commercial whether you support it, and how much. Money goes only to
> maintenance: component development, bug fixes, documentation and artwork.

Nobody assigns the work of maintaining a component library to me. Coffee doesn't
solve the problem, but it makes the typing slightly faster.

**→ [Open the donation page](https://a985987819.github.io/stardewUi/support)**
WeChat Pay and Alipay codes, and an itemised list of what the money is for.

Any amount works — one coffee is plenty. No need to round up or come back.
Other channels:

- **Afdian** — <https://afdian.com/malatang1> (monthly support, or one-off)
- **GitHub Sponsors** — a **Sponsor** button appears on the repo once enabled

**Not accepted**: paid feature work, commercial licensing, "open source partnership"
in name only. Those are licensing-boundary questions, not money questions. See
[docs/sponsoring.md](https://github.com/a985987819/stardewUi/blob/main/docs/sponsoring.md).

---

## License

This project uses a **non-commercial license**: personal learning, research,
portfolio display, non-profit open-source experiments, and internal prototypes
that are not offered, sold, or operated commercially. You may not use this
project or its derivatives for sale, paid services, commercial websites,
advertising, marketing, lead generation, client work, or any activity that
directly or indirectly generates revenue.

You must keep the license and attribution intact, and must not imply this is an
official Stardew Valley product, collaboration, or endorsement. This project
**does not ship any official Stardew Valley assets**; the names, marks and game
artwork remain the property of their respective owners.

The full terms live in [LICENSE](https://github.com/a985987819/stardewUi/blob/main/LICENSE).
If your use involves commercial or legal judgement, do not use this project and
consult a qualified professional.

> **⚠️ About the licence label on 0.1.0 / 0.2.0**: those two versions declared a
> `license` of `SEE LICENSE IN LICENSE`, which npm cannot parse — and npm
> **silently falls back to MIT** for any expression it cannot parse. So the
> registry labels them MIT. The actual terms were always the `LICENSE` file:
> **those versions are non-commercial too, and the MIT label is wrong.**
> From **0.3.0** the field is a valid SPDX expression,
> `LicenseRef-StardewValleyUI-NonCommercial`, and npm shows it verbatim;
> `bun run verify:package` now blocks that field from regressing.

Donations, if you make one, do not change any of the above.

## Acknowledgements

The welcome page's interaction rhythm and visual feel were inspired by
[Animal Island UI](https://github.com/guokaigdg/animal-island-ui). Details in
[docs/acknowledgements.md](https://github.com/a985987819/stardewUi/blob/main/docs/acknowledgements.md).
No code or assets were copied from it.

## Contributing

- Found a bug, a rough edge, or a design that reads wrong to you? That is the
  most valuable kind of report — [open an issue](#say-something--honestly-anything).
- Want to help maintain it? React + TypeScript, Bun, Vite, SCSS, Vitest.
- Working with an AI Agent? Install the
  [Agent Skill](#let-an-ai-agent-use-it-for-you) so it writes against the real
  API instead of inventing props.