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
subpath and needs one explicit line:

```tsx
import 'stardew-valley-ui/style.css'
```

If you use the `/auto` entry, drop that line but import from
`stardew-valley-ui/auto` instead of `stardew-valley-ui` — mixing both makes the
loading path hard to reason about.
See the [integration guide](docs/consumer-integration.md#style-import).
</details>

<details>
<summary><b><code>window is not defined</code> or hydration mismatch in Next.js?</b></summary>

`StarDialog`, `message`, the canvas components and the storage hooks touch the
DOM / Canvas / Storage on the client. Mark the components that use them:

```tsx
'use client'
import { StarDialog } from 'stardew-valley-ui'
```

SSR projects should also use the explicit stylesheet (`/style.css`) — `/auto`
injects on the client, which flashes unstyled on first paint and needs CSP
`unsafe-inline`.
</details>

<details>
<summary><b>Why didn't <code>&lt;StarTag color="green"&gt;</code> turn green?</b></summary>

A breaking change in 0.3.0: `color` now means **a CSS color** across the entire
library, and presets moved to their own prop — `tone` for Tag, `surface` for
Card:

```tsx
<StarTag tone="green">Fresh crop</StarTag>
<StarCard surface="night-village">Night village</StarCard>
```

The old spelling does not error — `green` is not a valid CSS color, so it quietly
resolves to something else. That ambiguity is exactly why the split exists. Full
list in the [migration guide](docs/migration-0.3.md).
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
- [Say something — honestly, anything](#say-something--honestly-anything) · [Buy me a coffee](#buy-me-a-coffee-) · [License](#license) · [Acknowledgements](#acknowledgements)

### Full API reference

Every component below lists its props, types and defaults. The tables are
**generated from the demo sources** by `scripts/gen-api-tables.mjs`, so they
cannot drift from the actual implementation — if a prop is renamed, this table
changes with it.

Two languages are documented: this English table and a
[Chinese one](README_ZH.md#组件列表) covering the same components, plus the
Hooks, utilities and type exports in full.

<!-- API-TABLES:START -->
<!-- Generated by scripts/gen-api-tables.mjs from src/pages/*Demo.tsx. Do not edit by hand. -->

<details>
<summary><b>Alert</b> — 15 props</summary>

| Property | Type | Default | Description |
| --- | --- | --- | --- |
| `type` | `'info' \| 'success' \| 'warning' \| 'error'` | `'info'` | Semantic kind; drives the stripe and title colours. |
| `title` | `ReactNode` | `-` | Bold heading. |
| `children` | `ReactNode` | `-` | Banner body. |
| `showIcon` | `boolean` | `false` | Shows the built-in semantic icon (replace it with icon). |
| `icon` | `ReactNode` | `-` | Custom icon swapping out the built-in glyph. |
| `closable` | `boolean` | `false` | Shows the built-in close button. |
| `open` | `boolean` | `-` | Controlled visibility; omit to let the alert own it. |
| `defaultOpen` | `boolean` | `true` | Starting visibility for the uncontrolled mode. |
| `modal` | `boolean` | `false` | Renders as a blocking overlay alert (dims the page, locks scroll). |
| `maskClosable` | `boolean` | `false` | Modal only: lets a backdrop click dismiss it. |
| `escClosable` | `boolean` | `false` | Modal only: lets Escape dismiss it. |
| `actions` | `ReactNode` | `-` | Footer slot, e.g. an acknowledge button. |
| `modalLabel` | `string` | `'Alert'` | Accessible name of the modal alert. |
| `onClose` | `() => void` | `-` | Fired after the banner is dismissed. |
| `closeLabel` | `string` | `'Close'` | Accessible name of the close button. |

</details>
<details>
<summary><b>Avatar</b> — 6 props</summary>

| Property | Type | Default | Description |
| --- | --- | --- | --- |
| `src` | `string` | `-` | Portrait URL; fallback is shown if it fails. |
| `alt / name` | `string` | `-` | Image alternative text and initial source; name wins. |
| `shape` | `'square' \| 'circle'` | `'square'` | Frame shape. |
| `size` | `'small' \| 'medium' \| 'large' \| number` | `'medium'` | Preset or exact pixel size. |
| `color` | `string` | `#FFC675` | Visible wood surface; frame, shadow, and grain are derived. |
| `children` | `ReactNode` | `-` | Custom fallback content. |

</details>
<details>
<summary><b>BackToTop</b> — 9 props</summary>

| Property | Type | Default | Description |
| --- | --- | --- | --- |
| `threshold` | `number` | `0` | Scroll distance before the plane appears. |
| `bottom` | `number` | `32` | Fixed distance from the viewport bottom. |
| `right` | `number` | `32` | Fixed distance from the viewport right edge. |
| `scrollBehavior` | `'auto' \| 'instant' \| 'smooth'` | `"'smooth'",` | Scroll animation; forced to an instant jump for reduced motion. |
| `open` | `boolean` | `-` | Hands the timing over to the caller. |
| `container` | `HTMLElement \| null` | `'null',` | Scroll container to watch; the window by default. |
| `label` | `string` | `'Back to top'` | Accessible name of the button. |
| `onOpenChange` | `(open: boolean) => void` | `'-',` | Fires when the plane appears or disappears, including on mount. |
| `flightKey` | `string \| number` | `'-',` | Bump it to play the fly-away; a hidden plane stays put, so a router can bump it on every navigation. |

</details>
<details>
<summary><b>Badge</b> — 7 props</summary>

| Property | Type | Default | Description |
| --- | --- | --- | --- |
| `count` | `number` | `-` | Number shown; collapses to N+ past overflowCount. |
| `dot` | `boolean` | `false` | Dot mode: renders an 8px square instead of a number. |
| `overflowCount` | `number` | `99` | Collapse limit for the count. |
| `showZero` | `boolean` | `false` | Shows the badge even when the count is zero. |
| `color` | `string` | `'#E53935'` | Fill colour; its frame edge is derived automatically. |
| `text` | `ReactNode` | `-` | Swaps the number for any label or emoji. |
| `children` | `ReactNode` | `-` | Wrap target; the badge pins to its top-right corner. |

</details>
<details>
<summary><b>Calendar</b> — 12 props</summary>

| Property | Type | Default | Description |
| --- | --- | --- | --- |
| `value` | `number` | `-` | Controlled month timestamp. |
| `defaultValue` | `number` | `-` | Initial uncontrolled month timestamp. |
| `items` | `CalendarItem[]` | `[]` | Event data rendered in day cells. |
| `iconMap` | `Record<string, ReactNode \| string>` | `-` | Maps iconKey to icons or images. |
| `todayLabel` | `string` | `'回到今日'` | Label of the today button. |
| `showToday` | `boolean` | `true` | Whether the today button is rendered. |
| `todayOffsetMinutes` | `number` | `480` | Timezone offset in minutes used to resolve today; 480 is UTC+8. |
| `onMonthChange` | `(monthTimestamp: number) => void` | `-` | Fires when the month changes, with the new month-start timestamp. |
| `onSelect` | `(dayTimestamp: number) => void` | `-` | Fires with the timestamp of the day that was clicked. |
| `maxVisibleMarkers` | `number` | `3` | Maximum markers per day; the rest collapse into +N. |
| `locale` | `string` | `'zh-CN'` | Locale for month names, the weekday header, and the year heading. |
| `showOutsideDays` | `boolean` | `true` | Shows adjacent-month days around the current month. |

</details>
<details>
<summary><b>Card</b> — 10 props</summary>

| Property | Type | Default | Description |
| --- | --- | --- | --- |
| `children` | `ReactNode` | `-` | Card body content. |
| `title` | `ReactNode` | `-` | Card title content. |
| `showTitle` | `boolean` | `false` | Shows title area. |
| `headerExtra` | `ReactNode` | `-` | Extra content pinned to the right of the title row. |
| `variant` | `'default' \| 'outlined' \| 'elevated'` | `'default'` | Card visual variant: outlined or elevated. |
| `size` | `'small' \| 'medium' \| 'large'` | `'medium'` | Card padding and type scale. |
| `hoverable` | `boolean` | `false` | Raises the card and deepens its shadow on hover. |
| `surface` | `CardColor` | `-` | A named body surface; the border, border highlight, border inner shadow, and outer shadow are derived from it through HSL. |
| `color` | `string` | `'#ffc675'` | Any card body colour (CSS); overrides surface. The lighting layers derive from it the same way. |
| `footer` | `ReactNode` | `-` | Footer action area. |

</details>
<details>
<summary><b>Checkbox</b> — 9 props</summary>

| Property | Type | Default | Description |
| --- | --- | --- | --- |
| `options` | `CheckboxOption[]` | `-` | Option list; every option accepts value, label, and disabled. **Required.** |
| `value / defaultValue` | `string[]` | `[]` | Controlled or initial selected values. |
| `onChange` | `(value: string[]) => void` | `-` | Receives the complete next selection. |
| `direction` | `'horizontal' \| 'vertical'` | `'horizontal'` | Option layout direction. |
| `disabled` | `boolean` | `false` | Disables the full checkbox group. |
| `size` | `'small' \| 'medium' \| 'large'` | `'medium'` | Control scale. |
| `shape` | `'square' \| 'round'` | `'square'` | Control outline. |
| `radio` | `boolean` | `false` | Single-choice mode with radiogroup / radio semantics. |
| `aria-label` | `string` | `'Checkbox'` | Accessible group name. |

</details>
<details>
<summary><b>Collapse</b> — 7 props</summary>

| Property | Type | Default | Description |
| --- | --- | --- | --- |
| `items` | `CollapseItem[]` | `-` | Sections of the board; each holds key, label, content, disabled?, extra?. |
| `accordion` | `boolean` | `false` | Only one section stays open at a time. |
| `expandIconPosition` | `'start' \| 'end'` | `'start'` | Which end the pixel chevron sits on. |
| `activeKeys` | `string[]` | `-` | Controlled open keys; omit to let the component own them. |
| `defaultActiveKeys` | `string[]` | `[]` | Initial open keys for the uncontrolled mode. |
| `onChange` | `(keys: string[]) => void` | `-` | Fires with the next open-keys set. |
| `ariaLabel` | `string` | `-` | Accessible name of the whole board. |

</details>
<details>
<summary><b>DatePicker</b> — 16 props</summary>

| Property | Type | Default | Description |
| --- | --- | --- | --- |
| `mode` | `'single' \| 'range'` | `'single'` | Selection mode. |
| `interaction` | `'calendar' \| 'inline'` | `'calendar'` | Interaction: month grid or the inline three-wheel form. |
| `value` | `number \| DateRange` | `-` | Controlled selected value. |
| `defaultValue` | `number \| DateRange` | `-` | Initial uncontrolled value. |
| `onChange` | `(value) => void` | `-` | Returns normalized selected value. |
| `disabledDates` | `number[]` | `[]` | Explicit disabled dates. |
| `confirmLabel` | `string` | `'确定'` | Label of the inline confirm button. |
| `cancelLabel` | `string` | `'取消'` | Label of the inline cancel button. |
| `columnLabels` | `[string, string, string]` | `['年', '月', '日']` | Accessible names of the inline wheels (year, month, day). |
| `todayLabel` | `string` | `'回到今日'` | Label of the today button. |
| `showToday` | `boolean` | `true` | Whether the today button is rendered (calendar form only). |
| `todayOffsetMinutes` | `number` | `480` | Timezone offset in minutes used to resolve today; 480 is UTC+8. |
| `minDate` | `number` | `-` | Earliest selectable date (timestamp); earlier days are disabled. |
| `maxDate` | `number` | `-` | Latest selectable date (timestamp); later days are disabled. |
| `showOutsideDays` | `boolean` | `true` | Shows adjacent-month days around the current month. |
| `locale` | `string` | `'zh-CN'` | Locale for month names, the weekday header, and the inline trigger. |

</details>
<details>
<summary><b>Dialog</b> — 24 props</summary>

| Property | Type | Default | Description |
| --- | --- | --- | --- |
| `open` | `boolean` | `-` | Controlled visibility; omit to let the dialog own it. |
| `defaultOpen` | `boolean` | `false` | Starting visibility for the uncontrolled mode. |
| `onOpenChange` | `(open: boolean) => void` | `-` | Fires on open and on close with the next visibility. |
| `content` | `string \| string[]` | `-` | Content or paged content. **Required.** |
| `title` | `string` | `-` | Dialog title. |
| `image` | `string` | `-` | Portrait shown on the right. |
| `name` | `string` | `-` | Speaker name shown on the right. |
| `actions` | `DialogAction[] \| null` | `confirm / cancel` | Buttons on the final page ({ label, variant?, disabled?, onClick? }); pass null to render none. |
| `footer` | `ReactNode \| null` | `built-in footer` | Footer content: omit for built-in actions and paging, use null to remove it, or provide a ReactNode to replace it. |
| `mask` | `'dark' \| 'light'` | `'dark'` | Backdrop tone. |
| `placement` | `'center' \| 'bottom'` | `'center'` | Viewport placement; bottom centers at the lower edge with full available width. |
| `focusEffect` | `boolean` | `true` | Scales and softens the farm behind the dialog so the current line or choice owns the frame. |
| `motion` | `boolean` | `true` | Plays the 0 → 105% → 100% entrance and a shrinking fade-out on exit. |
| `maskClosable` | `boolean` | `true` | Close when the mask is clicked. |
| `typewriter` | `boolean` | `true` | Types the title and body out letter by letter. |
| `typewriterSpeed` | `number` | `100` | Delay between characters, in ms. |
| `showPagination` | `boolean` | `single page hides` | Shows the prev/next pager; a single page hides it unless this is set. |
| `onClose` | `() => void` | `-` | Called when the dialog closes. |
| `confirmLabel` | `string` | `跟随语言` | Label of the built-in confirm action; follows the host language by default. |
| `cancelLabel` | `string` | `跟随语言` | Label of the built-in cancel action; follows the host language by default. |
| `prevLabel` | `string` | `跟随语言` | Accessible name and tooltip of the previous-page button. |
| `nextLabel` | `string` | `跟随语言` | Accessible name and tooltip of the next-page button. |
| `roleLabel` | `string` | `跟随语言` | Alt text of the character image when no name is supplied. |
| `waitingText` | `string` | `跟随语言` | Copy shown in the body while the title typewriter finishes. |

</details>
<details>
<summary><b>DisplayFrame</b> — 4 props</summary>

| Property | Type | Default | Description |
| --- | --- | --- | --- |
| `children` | `ReactNode` | `-` | Frame content; you lay the data out. |
| `className` | `string` | `-` | Appended to the root — put layout classes here. |
| `...rest` | `HTMLAttributes<HTMLDivElement>` | `'-',` | Any other native div prop (style / onClick / aria-*, …). |
| `(fixed look)` | `-` | `'-',` | The four bands are baked in: 2px #562c2b / 4px #dd7a0b / 2px #af4f0e / 2px #fdecb1, 2px cut from each corner. No colour props. |

</details>
<details>
<summary><b>Divider</b> — 4 props</summary>

| Property | Type | Default | Description |
| --- | --- | --- | --- |
| `count` | `number` | `-` | Pin the number of motifs; omit it to fill the container width. |
| `icon` | `'fence' \| 'star'` | `'fence'` | Motif to repeat: wooden post or pixel star. |
| `color` | `string` | `'#fa9405'` | Body colour (hex); the outline, highlight, and lower-left shadow are derived from it live. |
| `className / style` | `string / CSSProperties` | `-` | Root styles. |

</details>
<details>
<summary><b>Drawer</b> — 14 props</summary>

| Property | Type | Default | Description |
| --- | --- | --- | --- |
| `open` | `boolean` | `-` | Controlled visibility; omit to let the drawer own it. |
| `defaultOpen` | `boolean` | `false` | Starting visibility for the uncontrolled mode. |
| `onOpenChange` | `(open: boolean) => void` | `-` | Fires on open and on close with the next visibility. |
| `placement` | `'top' \| 'right' \| 'bottom' \| 'left'` | `'right'` | Drawer entry edge. |
| `title` | `ReactNode` | `-` | Optional heading. |
| `footer` | `ReactNode` | `-` | Optional fixed footer. |
| `children` | `ReactNode` | `-` | Drawer body content. |
| `className` | `string` | `-` | Class added to the drawer panel. |
| `maskStyle` | `CSSProperties` | `-` | Inline backdrop styles. |
| `focusEffect` | `boolean` | `true` | Whether the page scales and softens. |
| `maskClosable` | `boolean` | `true` | Request close on mask click. |
| `onClose` | `() => void` | `-` | Called by close button, mask, or Escape. |
| `closeLabel` | `string` | `跟随语言` | Accessible name of the close button; follows the host language by default. |
| `ariaLabel` | `string` | `跟随语言` | Accessible name of the panel when no string title is supplied. |

</details>
<details>
<summary><b>EmptyState</b> — 6 props</summary>

| Property | Type | Default | Description |
| --- | --- | --- | --- |
| `message` | `ReactNode` | `-` | Placeholder message. |
| `showMessage` | `boolean` | `true` | Shows the message copy. |
| `showImage` | `boolean` | `true` | Shows image. |
| `imageSrc` | `string` | `built-in noData.png` | Custom placeholder image URL. |
| `imageAlt` | `string` | `No data` | Alternative text of the placeholder image. |
| `direction` | `'horizontal' \| 'vertical'` | `'vertical'` | Layout direction. |

</details>
<details>
<summary><b>Input</b> — 13 props</summary>

| Property | Type | Default | Description |
| --- | --- | --- | --- |
| `value / defaultValue` | `string` | `''` | Controlled text or initial text. |
| `onChange` | `(value: string) => void` | `-` | Fires with the latest text. |
| `label` | `ReactNode` | `-` | Visible caption bound with for/id. |
| `message` | `ReactNode` | `-` | Hint or validation copy under the field. |
| `status` | `'default' \| 'warning' \| 'error' \| 'success'` | `'default'` | Semantic tint for frame and message. |
| `size` | `'small' \| 'medium' \| 'large'` | `'medium'` | Field size. |
| `color` | `string` | `'#71964a'` | Accent that overrides the status tint. |
| `prefix / suffix` | `ReactNode` | `-` | Content rendered inside the frame. |
| `allowClear` | `boolean` | `false` | Shows the clear button. |
| `showCount` | `boolean` | `false` | Shows the length (n/max with maxLength). |
| `block` | `boolean` | `false` | Stretches to the container width. |
| `onClear` | `() => void` | `-` | Fires after the built-in clear button empties the field. |
| `clearLabel` | `string` | `'Clear'` | Accessible name of the clear button. |

</details>
<details>
<summary><b>Loading</b> — 8 props</summary>

| Property | Type | Default | Description |
| --- | --- | --- | --- |
| `active` | `boolean` | `true` | Runs animation. |
| `text` | `string` | `follows language` | Loading text; pass an empty string to keep the animation only. |
| `size` | `'small' \| 'medium' \| 'large' \| number` | `'medium'` | Garden diameter; a preset or an exact pixel size. |
| `speed` | `number` | `600` | Milliseconds between carrot growth steps; lower values are faster. |
| `gap` | `number` | `8` | Pixel spacing between carrots and trailing dots. |
| `center` | `boolean` | `false` | Centers horizontally in the container. |
| `block` | `boolean` | `false` | Stretches to the container width. |
| `fill` | `boolean` | `false` | Fills the container width and height. |

</details>
<details>
<summary><b>Message</b> — 9 props</summary>

| Property | Type | Default | Description |
| --- | --- | --- | --- |
| `content` | `string` | `-` | Message content. **Required.** |
| `type` | `MessageType` | `'normal'` | Message type. |
| `position` | `MessagePosition` | `'top'` | Message placement. |
| `duration` | `number` | `3000` | Visible duration; 0 disables auto-close. |
| `action` | `MessageAction` | `-` | An in-message action button. |
| `onClose` | `() => void` | `-` | Called after the message closes. |
| `onClick` | `() => void` | `-` | Called when the message body is clicked. |
| `Return: close()` | `() => void` | `-` | Closes this message. |
| `Return: update()` | `(next: Partial<MessageOptions> & { content?: string; type?: MessageType }) => void` | `-` | Updates this message in place; merges the given fields and keeps the original position and duration. |

</details>
<details>
<summary><b>Button</b> — 12 props</summary>

| Property | Type | Default | Description |
| --- | --- | --- | --- |
| `variant` | `'default' \| 'primary' \| 'secondary' \| 'info' \| 'success' \| 'warning' \| 'danger' \| 'disabled' \| 'dashed' \| 'text' \| 'link' \| 'concise'` | `'default'` | Button visual variant. |
| `size` | `'small' \| 'medium' \| 'large'` | `'medium'` | Button size. |
| `disabled` | `boolean` | `false` | Disables interaction. |
| `loading` | `boolean` | `false` | Shows loading state. |
| `block` | `boolean` | `false` | Stretches to the parent width. |
| `theme` | `'spring' \| 'summer' \| 'autumn' \| 'winter'` | `-` | Seasonal theme for default buttons. |
| `appearance` | `'regular' \| 'classical'` | `'regular'` | Appearance: regular or classical outline. |
| `icon` | `ReactNode \| string` | `-` | Leading icon inside the button. |
| `color` | `string` | `-` | Custom body colour, overriding the variant palette. |
| `backgroundSrc` | `string` | `-` | Custom nine-slice background image; wins over built-in themes. |
| `backgroundInsets` | `{ top: number; right: number; bottom: number; left: number }` | `built-in` | Nine-slice inset measurements. |
| `onClick` | `(event: MouseEvent) => void` | `-` | Click callback. |

</details>
<details>
<summary><b>Pagination</b> — 12 props</summary>

| Property | Type | Default | Description |
| --- | --- | --- | --- |
| `total` | `number` | `-` | Total item count; the pager derives the page count from it. |
| `pageSize` | `number` | `10` | Items per page. |
| `current` | `number` | `-` | Controlled active page (1-based); omit to own the state. |
| `defaultCurrent` | `number` | `1` | Initial page for the uncontrolled mode. |
| `defaultPageSize` | `number` | `10` | Initial page size for the uncontrolled mode. |
| `showSizeChanger` | `boolean` | `false` | Shows the page-size select. |
| `pageSizeOptions` | `number[]` | `[10, 20, 50]` | Gear list for the select (the active size always joins, sorted). |
| `onShowSizeChange` | `(page: number, pageSize: number) => void` | `-` | Fires on a gear change with the re-anchored (page, pageSize). |
| `onChange` | `(page: number, pageSize: number) => void` | `-` | Fires when the page changes. |
| `hideOnSinglePage` | `boolean` | `false` | Hides the pager when everything fits on one page. |
| `ariaLabel` | `string` | `'Pagination'` | Accessible name of the pager. |
| `showTotal` | `(total: number, range: [number, number]) => ReactNode` | `-` | Renders custom total copy. |

</details>
<details>
<summary><b>Pixel Text</b> — 8 props</summary>

| Property | Type | Default | Description |
| --- | --- | --- | --- |
| `text` | `string \| number` | `-` | Text to rasterize; takes priority over children. |
| `children` | `string \| number` | `-` | Plain text to rasterize when text is omitted. |
| `pixelSize` | `number` | `8` | Side length of one visible square pixel in CSS pixels. |
| `fontSize` | `number` | `120` | Source Canvas font size before downsampling, in pixels. |
| `fontFamily` | `string` | `emoji-safe stack` | Source font stack; defaults to color-emoji-safe fonts. |
| `padding` | `number` | `12` | Empty space retained around the glyph, in pixels. |
| `renderMode` | `'pixelated' \| 'source'` | `'pixelated'` | Draws the pixel result or the same-size source Canvas glyph for seamless comparison. |
| `aria-label` | `string` | `text / children` | Overrides the Canvas image accessible name. |

</details>
<details>
<summary><b>Popup</b> — 15 props</summary>

| Property | Type | Default | Description |
| --- | --- | --- | --- |
| `content` | `ReactNode` | `-` | Bubble content. **Required.** |
| `placement` | `PopupPlacement` | `'right'` | Twelve placements (four sides × start/center/end). |
| `trigger` | `'hover' \| 'click'` | `'hover'` | Trigger mode. |
| `title` | `ReactNode` | `-` | Bubble heading. |
| `actions` | `PopupAction[]` | `-` | Footer buttons; presence flips role to dialog. |
| `arrow` | `boolean` | `true` | Shows the pixel arrow pointing back at the trigger. |
| `color` | `string` | `-` | Fill colour; ring, bevel, and cream ink derive from it. |
| `role` | `'tooltip' \| 'dialog' \| 'none'` | `auto` | ARIA role of the bubble; derived from actions by default. |
| `open` | `boolean` | `-` | Controlled visibility; omit to let hover/click own it. |
| `defaultOpen` | `boolean` | `false` | Initial visibility for the uncontrolled mode. |
| `mouseEnterDelay` | `number` | `100` | Hover-in delay in ms. |
| `mouseLeaveDelay` | `number` | `120` | Hover-out delay in ms. |
| `offset` | `number` | `12` | Distance between bubble and trigger. |
| `children` | `ReactNode` | `-` | The trigger element; the bubble is anchored beside it. |
| `onOpenChange` | `(open: boolean) => void` | `-` | Fires when hover/click wants to change visibility; use it for controlled mode. |

</details>
<details>
<summary><b>Progress</b> — 6 props</summary>

| Property | Type | Default | Description |
| --- | --- | --- | --- |
| `value` | `number` | `-` | Current amount; completed cells are displayed and the range is clamped. |
| `max` | `number` | `100` | Full progress amount. |
| `segmentSize` | `number` | `10` | Amount represented by one pixel cell. |
| `color` | `string` | `#CE053C` | Visible fill; frame, highlight, and shadow are derived. |
| `variant` | `'default' \| 'compact'` | `'default'` | default uses 15px cells; compact uses dense 6px cells. |
| `showLabel` | `boolean` | `false` | Shows the current and maximum values. |

</details>
<details>
<summary><b>Radio</b> — 7 props</summary>

| Property | Type | Default | Description |
| --- | --- | --- | --- |
| `options` | `RadioOption[]` | `-` | Option list; every option accepts value, label, and disabled. **Required.** |
| `value / defaultValue` | `string` | `-` | Controlled or initial selected value. |
| `onChange` | `(value: string) => void` | `-` | Receives the next selected value. |
| `direction` | `'horizontal' \| 'vertical'` | `'horizontal'` | Option layout direction. |
| `disabled` | `boolean` | `false` | Disables the full radio group. |
| `size` | `'small' \| 'medium' \| 'large'` | `'medium'` | Control scale. |
| `aria-label` | `string` | `'Radio'` | Accessible group name. |

</details>
<details>
<summary><b>Rating</b> — 9 props</summary>

| Property | Type | Default | Description |
| --- | --- | --- | --- |
| `value / defaultValue` | `number` | `0` | Controlled or initial score. |
| `count` | `number` | `5` | Number of score icons. |
| `icon` | `'heart' \| 'star'` | `'heart'` | Icon type. |
| `allowHalf` | `boolean` | `false` | Allows half-step values; click the same icon twice to land on the half. |
| `disabled` | `boolean` | `false` | Disables interaction. |
| `color` | `string` | `heart #E53935 / star #D7992E` | Filled icon color. |
| `emptyColor` | `string` | `#CDBDA8` | Empty icon color. |
| `onChange` | `(value: number) => void` | `-` | Fires with the next score when the player picks one. |
| `aria-label` | `string` | `-` | Accessible name of the score picker. |

</details>
<details>
<summary><b>Select</b> — 9 props</summary>

| Property | Type | Default | Description |
| --- | --- | --- | --- |
| `options` | `SelectOption[]` | `-` | Option list; every option accepts value, label, and disabled. **Required.** |
| `value / defaultValue` | `string` | `-` | Controlled or initial selected value. |
| `onChange` | `(value: string) => void` | `-` | Receives the next selected value. |
| `placeholder` | `string` | `-` | Shown in the trigger while nothing is selected. |
| `disabled` | `boolean` | `false` | Disables the whole select. |
| `size` | `'small' \| 'medium' \| 'large'` | `'medium'` | Trigger scale. |
| `name` | `string` | `-` | Form field name; a hidden input carries the selected value. |
| `block` | `boolean` | `false` | Stretches the select to the container width. |
| `aria-label` | `string` | `'Select'` | Accessible name of trigger and listbox. |

</details>
<details>
<summary><b>Skeleton</b> — 7 props</summary>

| Property | Type | Default | Description |
| --- | --- | --- | --- |
| `loading` | `boolean` | `true` | Shows the skeleton; when false, children render instead. |
| `rows` | `number` | `3` | Number of paragraph placeholder rows. |
| `title` | `boolean` | `true` | Shows the bold title row. |
| `avatar` | `boolean` | `false` | Shows an avatar block on the left. |
| `avatarShape` | `'square' \| 'circle'` | `'square'` | Shape of the avatar block. |
| `children` | `ReactNode` | `-` | Real content rendered when loading is false. |
| `active` | `boolean` | `true` | Plays the marching-stripe animation; off gives a calm placeholder. |

</details>
<details>
<summary><b>Switch</b> — 9 props</summary>

| Property | Type | Default | Description |
| --- | --- | --- | --- |
| `checked` | `boolean` | `-` | Controlled on/off state; omit to let the switch own it. |
| `defaultChecked` | `boolean` | `false` | Starting state for the uncontrolled mode. |
| `onChange` | `(checked: boolean) => void` | `-` | Change callback. |
| `disabled` | `boolean` | `false` | Disables interaction. |
| `size` | `'small' \| 'medium' \| 'large'` | `'medium'` | Switch size. |
| `color` | `string` | `'#71964A'` | Colour the lit groove and keyhole dot take while checked; its dark edge is derived automatically. |
| `name` | `string` | `-` | Form field name; renders a hidden input so FormData receives true/false. |
| `required` | `boolean` | `false` | Required flag submitted with the hidden input. |
| `aria-label` | `string` | `-` | Accessible name of the switch. |

</details>
<details>
<summary><b>Tab</b> — 6 props</summary>

| Property | Type | Default | Description |
| --- | --- | --- | --- |
| `items` | `StarTabItem[]` | `-` | Tab item list. **Required.** |
| `activeKey` | `string` | `-` | Active key for controlled mode. |
| `defaultActiveKey` | `string` | `first item key` | Initial active key. |
| `onChange` | `(key: string) => void` | `-` | Called when the active tab changes. |
| `position` | `'top' \| 'bottom'` | `'top'` | Navigation position. |
| `external` | `boolean` | `false` | Renders the tab strip outside the content frame. |

</details>
<details>
<summary><b>Tag</b> — 8 props</summary>

| Property | Type | Default | Description |
| --- | --- | --- | --- |
| `tone` | `'default' \| 'green' \| 'red' \| 'yellow' \| 'blue' \| 'purple'` | `'default'` | Preset ink for the ring, text, and close-hover accent. |
| `color` | `string` | `-` | Any CSS colour; overrides the tone preset. |
| `closable` | `boolean` | `false` | Shows the pixel × close button. |
| `open` | `boolean` | `-` | Controlled visibility; lets a dismissed tag be restored. |
| `defaultOpen` | `boolean` | `true` | Starting visibility for the uncontrolled mode. |
| `onClose` | `() => void` | `-` | Fires after the close button removes the tag. |
| `closeLabel` | `string` | `'Close'` | Accessible name of the close button. |
| `children` | `ReactNode` | `-` | Tag content. |

</details>
<details>
<summary><b>Textarea</b> — 15 props</summary>

| Property | Type | Default | Description |
| --- | --- | --- | --- |
| `value` | `string` | `-` | Controlled text; omit to let the field keep its own state. |
| `defaultValue` | `string` | `''` | Initial text for the uncontrolled field. |
| `onChange` | `(value: string) => void` | `-` | Fires while typing with the next text. |
| `rows` | `number` | `4` | Visible rows before scrolling. |
| `size` | `'small' \| 'medium' \| 'large'` | `'medium'` | Field size. |
| `status` | `'default' \| 'warning' \| 'error' \| 'success'` | `'default'` | Semantic tint for the frame and caret. |
| `color` | `string` | `-` | Custom accent; overrides status. |
| `label` | `ReactNode` | `-` | Visible caption bound via htmlFor. |
| `message` | `ReactNode` | `-` | Hint or validation copy under the field. |
| `showCount` | `boolean` | `false` | Shows the character counter. |
| `block` | `boolean` | `false` | Stretches to the container width. |
| `allowClear` | `boolean` | `false` | Shows a clear button while editable with content. |
| `clearLabel` | `string` | `'Clear'` | Accessible name of the clear button. |
| `onPressEnter` | `(event: KeyboardEvent) => void` | `-` | Fires on bare Enter (Shift+Enter and IME composing excluded). |
| `autoSize` | `boolean` | `false` | Grows with the content and disables the manual resize grip. |

</details>
<details>
<summary><b>Title</b> — 6 props</summary>

| Property | Type | Default | Description |
| --- | --- | --- | --- |
| `level` | `1 \| 2 \| 3 \| 4 \| 5 \| 6` | `2` | Semantic heading level. |
| `children` | `string \| number` | `-` | Heading text rendered by Canvas. |
| `color` | `string` | `'#ce9f00'` | Visible fill; the upper-right highlight and flecks are derived from it. |
| `fontSize` | `number` | `50` | Canvas font size in pixels. |
| `letterSpacing` | `number` | `4` | Space between glyphs in pixels (minimum 0). |
| `showShadow` | `boolean` | `true` | Shows the 60% opaque hard-pixel cast shadow. |

</details>
<details>
<summary><b>Typewriter</b> — 5 props</summary>

| Property | Type | Default | Description |
| --- | --- | --- | --- |
| `text` | `string` | `-` | Text to reveal. **Required.** |
| `speed` | `number` | `100` | Delay per character. |
| `startDelay` | `number` | `0` | Start delay. |
| `onComplete` | `() => void` | `-` | Fires once when the whole line is revealed. |
| `completeTrigger` | `number` | `0` | Changing it replays the typing animation; bump the value. |

</details>
<!-- API-TABLES:END -->

---

## Say something — honestly, anything

What this library has actually gained since day one is not the 27 components.
It's the bugs **you** ran into. **Every piece of feedback gets read**, including
"I don't really like this design."

Four doors below. Pick one and an issue opens — no forms to fill in.

| I want to talk about | A one-liner example | Open an issue |
| --- | --- | --- |
| **It doesn't work** | "Styles didn't apply after install", "focus jumps when I open the dialog" | [New issue](https://github.com/a985987819/stardewUi/issues/new/choose) |
| **It's hard to use** | "Six lines to pop a dialog", "why both `open` and `visible`?" | [New issue](https://github.com/a985987819/stardewUi/issues/new/choose) |
| **It doesn't look right** | "This blue isn't the game's blue", "the border is a touch heavy" | [New issue](https://github.com/a985987819/stardewUi/issues/new/choose) |
| **Why is it built this way?** | "Why nine-slice buttons instead of rounded corners?", "was the motion curve picked at random?" | [New issue](https://github.com/a985987819/stardewUi/issues/new/choose) |

**The fourth category is my favourite.** Plenty of the trade-offs behind the
implementation are written down in the
[migration guide](docs/migration-0.3.md) and in code comments — but that is *my*
view. Your use case is different, so what trips you up is different too. **Where
something feels wrong to you is very likely exactly what I never considered.**

### Prefer to just open one?

👉 **[Click here to create an issue](https://github.com/a985987819/stardewUi/issues/new/choose)**

- 💬 Idea / question / criticism → pick **Discussion** or open an issue directly
- 🐛 Bug or missing feature → pick **Bug report** or **Feature request**
- 🤝 Want to help maintain it → an issue is enough. Stack: React + TypeScript, Bun, Vite, SCSS, Vitest

> **Not sure if it counts as a bug?** Then file it as one. A lot of the design
> here has only ever been used by me, which makes me the last person qualified
> to notice the problem.

---

## Buy me a coffee ☕

> **First, the important part: a donation is not a licence purchase.**
> Whether you donate or not, this project stays under the
> [non-commercial license](https://github.com/a985987819/stardewUi/blob/main/LICENSE).
> A donation is a thank-you for the maintenance time — it does not buy a
> licence, and it does not turn the terms into MIT.

Maintaining a component library has costs you never see: 27 components, over a
hundred tests, packing the tarball into a scratch project and running it before
every release, and fixing the kind of bug that only shows up *after* you ship —
like npm labelling a non-commercial package as MIT.

Nobody assigns that work to me. Coffee doesn't solve the problem, but it makes the
typing slightly faster.

<p align="center">
  <img
    src="https://raw.githubusercontent.com/a985987819/stardewUi/main/docs/assets/donate-qr.png"
    alt="WeChat appreciation QR code — scan to buy the maintainer a coffee"
    width="220"
  />
</p>

<p align="center">
  <sub>
    No QR code? The maintainer hasn't added one yet —
    <a href="https://github.com/a985987819/stardewUi/blob/main/docs/sponsoring.md#placing-your-own-qr-code">here's how</a>.<br>
    Any amount works. One coffee is plenty. Seriously — no rounding up, no need
    to come back.
  </sub>
</p>

Other channels: GitHub Sponsors (a **Sponsor** button appears on the repo once
enabled), Afdian / Open Collective.

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