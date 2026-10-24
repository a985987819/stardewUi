# Stardew Valley UI

[![npm version](https://img.shields.io/npm/v/stardew-valley-ui.svg)](https://www.npmjs.com/package/stardew-valley-ui)
[![npm downloads](https://img.shields.io/npm/dm/stardew-valley-ui.svg)](https://www.npmjs.com/package/stardew-valley-ui)
[![license](https://img.shields.io/npm/l/stardew-valley-ui.svg)](https://www.npmjs.com/package/stardew-valley-ui)

**English** | [简体中文](README.md)

A **Stardew Valley–themed, pixel-art React component library** built on React, TypeScript and Vite. It ships composable UI components plus utilities for dates, canvas nine-slice drawing, and pixel shapes.

Built for production apps: ESM, CommonJS, type declarations and a standalone stylesheet entry are all published; the bundled pixel assets ship inside the package, so nothing needs to be copied into your `public/` directory.

> 📖 The interactive documentation site is fully bilingual (中文 / English) — every component page includes live demos and an API table in both languages. The complete API reference below is therefore kept as a Chinese overview; point your browser at the doc site for per-component docs in English.
>
> 本 README 的完整组件 API 参考见 [README.md](README.md)；英文文档请浏览双语文档站。

## Installation

```bash
# npm
npm install stardew-valley-ui

# bun
bun add stardew-valley-ui

# pnpm
pnpm add stardew-valley-ui

# yarn
yarn add stardew-valley-ui
```

**Peer dependencies**: React >= 18.0.0 and ReactDOM >= 18.0.0.

## Quick start

### 1. Import the styles

Import the stylesheet once at your app entry (**recommended**: the CSS becomes part of your build output, so SSR first paint has no flash):

```tsx
import 'stardew-valley-ui/style.css'
```

Prefer not to add that line? Use the **auto-inject** entry instead — component imports stay identical:

```tsx
import { StarCard, StarNineSliceButton } from 'stardew-valley-ui/auto'
// Styles are injected into a <style> tag at module load; no CSS import needed.
```

Pick **one** of the two paths. Importing both is safe (the injector detects an existing stylesheet and skips). Trade-offs live in the [consumer integration guide](docs/consumer-integration.md).

### 2. Use components

```tsx
import { useState } from 'react'
import { StarCard, StarNineSliceButton, StarDialog, message } from 'stardew-valley-ui'

function App() {
  const [open, setOpen] = useState(false)

  return (
    <div>
      <StarCard title="Welcome to Stardew Valley" showTitle>
        <p>Card content goes here.</p>
      </StarCard>

      <StarNineSliceButton variant="primary" onClick={() => setOpen(true)}>
        Open dialog
      </StarNineSliceButton>

      <StarDialog
        open={open}
        title="Pierre"
        content="Welcome to my shop!"
        onClose={() => setOpen(false)}
      />

      <StarNineSliceButton
        onClick={() => message.success('Saved!')}
      >
        Show message
      </StarNineSliceButton>
    </div>
  )
}
```

## Day / night theme

Every color in the library is a semantic token on `:root`; the night palette flips wholesale via `<html data-theme="dark">`.

- **System by default**: without a provider, the stylesheet's `prefers-color-scheme` fallback follows the OS setting automatically.
- **Manual control**: wrap your app in `ThemeProvider` for a switchable, persisted day/night mode (stored in localStorage; the `system` mode tracks OS changes live):

```tsx
import { ThemeProvider, useTheme } from 'stardew-valley-ui'

function App() {
  return (
    <ThemeProvider>
      <ThemeToggleButton />
    </ThemeProvider>
  )
}

function ThemeToggleButton() {
  const { resolvedTheme, setTheme } = useTheme()
  return (
    <button onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}>
      {resolvedTheme === 'dark' ? 'Switch to day' : 'Switch to night'}
    </button>
  )
}
```

`setTheme` accepts `'light' | 'dark' | 'system'`; `resolvedTheme` is the effective theme. Both palettes are contrast-verified (body text ≥ 4.5:1, UI strokes ≥ 3:1). In night mode `StarCard` sinks its surface to a same-hue dark walnut before deriving lighting, so cream text stays readable; self-lit materials (parchment buttons, the golden DisplayFrame bands) keep their day look — their text is a baked dark ink constant, so they read as lanterns on the night ground. The sun/moon button in the doc-site header is a live demo.

## Components

Every prop type is importable from the root entry via `import type`; all components accept `className`, and container components also forward native `style` and DOM props.

| Category | Exports |
| --- | --- |
| Containers & display | `StarCard`, `StarDisplayFrame`, `StarDivider`, `StarAvatar`, `StarEmptyState`, `StarLoading` |
| Forms & actions | `StarNineSliceButton`, `StarInput`, `StarSwitch`, `StarRating`, `StarProgress`, `StarCheckbox` |
| Feedback & overlays | `StarDialog`, `StarDrawer`, `StarPopup`, `message`, `StarTypewriter` |
| Dates & navigation | `StarCalendar`, `StarDatePicker`, `StarTab` |

Full component gallery (21 components, each with live demos and a bilingual API table):

| Component | Route | Component | Route |
| --- | --- | --- | --- |
| Avatar | `avatar` | Loading | `loading` |
| Divider | `divider` | Message | `message` |
| Button | `button` | EmptyState | `empty-state` |
| Calendar | `calendar` | Tab | `tab` |
| DatePicker | `date-picker` | Rating | `rating` |
| Card | `card` | Progress | `progress` |
| Dialog | `dialog` | Switch | `switch` |
| Drawer | `drawer` | Checkbox | `checkbox` |
| Popup | `popup` | Input | `input` |
| Typewriter | `typewriter` | DisplayFrame | `display-frame` |
| BackToTop | `back-to-top` | | |

Date components accept a `locale` prop (BCP-47, defaults to `'zh-CN'`): `StarCalendar` and `StarDatePicker` render month, year and weekday labels through `Intl`, so `locale="en-US"` switches the whole picker to English including toolbar aria labels.

## Hooks & utilities

| Export | Purpose |
| --- | --- |
| `useToggle` | Boolean state helper |
| `useClipboard` | Copy-to-clipboard with feedback |
| `useLocalStorage` | Persistent state in `localStorage` |
| `useNineSliceBackground` | Canvas nine-slice background painter |
| `classNames` / `copyToClipboard` / `resolveAssetPath` | Small utilities |
| `createGapBorderCorners` | Pixel corner geometry for gap borders |

## Using in other frontend projects

Components style themselves with CSS Modules and never leak global selectors into your app. Details on asset handling, SSR/RSC boundaries (`'use client'` for canvas/`message`/storage hooks) and the maintainers' release checklist live in the [consumer integration guide](docs/consumer-integration.md).

## Documentation

- 中文快速上手与完整组件 API：[README.md](README.md)
- 接入指南（样式引入 / SSR / 素材 / 发布核验）：[docs/consumer-integration.md](docs/consumer-integration.md)
- 美术规范（色板、明度标尺、逐组件范式）：[docs/design/art-style.md](docs/design/art-style.md)
- 双语组件文档站：`bun run dev` 后访问本地站点，或 GitHub Pages

## License

MIT — see the `license` field in [package.json](package.json).
