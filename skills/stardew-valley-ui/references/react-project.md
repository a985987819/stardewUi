# React project integration

## Install and import

```bash
npm install stardew-valley-ui
# or: bun add / pnpm add / yarn add stardew-valley-ui
```

In the consuming application, load styles once with one of these public approaches:

```tsx
// Recommended for Vite, Next.js, SSR/RSC, and CSP-restricted applications.
import 'stardew-valley-ui/style.css'
import { StarCard, StarNineSliceButton } from 'stardew-valley-ui'
```

```tsx
// Client-only applications may opt into automatic runtime style injection instead.
import { StarCard, StarNineSliceButton } from 'stardew-valley-ui/auto'
```

The package requires React and ReactDOM version 18 or later as peer dependencies. In a new
integration, prefer the explicit stylesheet route; use `/auto` only when runtime injection
fits the host application's CSP and client-only rendering model.

## Minimal pattern

```tsx
import { useState } from 'react'
import 'stardew-valley-ui/style.css'
import { StarCard, StarDialog, StarNineSliceButton } from 'stardew-valley-ui'

export function FarmNotice() {
  const [open, setOpen] = useState(false)

  return (
    <StarCard title="农场公告" showTitle>
      <p>洒水器已经准备好。</p>
      <StarNineSliceButton variant="primary" onClick={() => setOpen(true)}>
        查看详情
      </StarNineSliceButton>
      <StarDialog open={open} title="罗宾" content="明天可以开始施工。" onClose={() => setOpen(false)} />
    </StarCard>
  )
}
```

Use this shape in actual tasks: import from the package root, keep component state in the
application, and place the one stylesheet import at the app entry rather than in each leaf
component. Confirm every prop against the installed `dist/index.d.ts` before relying on it.

## SSR and assets

Keep `StarDialog`, `message`, canvas backgrounds, browser-storage hooks, `useClipboard`,
and `useNineSliceBackground` inside a client component in Next.js/RSC applications.
Use `message(...)` only in client-side event handlers or effects.

The library packages its default button, seasonal, calendar, empty-state, and loading
assets. When supplying an application-owned `backgroundSrc`, `imageSrc`, or `src`, prefer
a static import URL so bundlers can preserve the correct deployment path.

## Validate

Run the consuming project's typecheck, lint, test, and production build. Check the page at
a narrow viewport and verify dialog, drawer, popup, message, and date-picker interactions
with keyboard input when those features are used.
