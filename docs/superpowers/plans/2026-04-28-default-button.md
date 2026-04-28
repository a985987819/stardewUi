# Default Button PNG Migration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make only the `variant="default"` button render from `public/defaultBtn.png`, with text-color-only hover/active states and a disabled overlay, without changing seasonal buttons or other variants.

**Architecture:** Keep the existing `StarNineSliceButton` structure and `useNineSliceBackground` path for non-seasonal image buttons. Add a small default-button state layer inside `NineSliceButton.tsx` that computes the effective background source, text color, and disabled overlay for the plain default button only. Verify behavior with focused Vitest coverage around default, disabled, and seasonal isolation.

**Tech Stack:** React 19, TypeScript, SCSS modules, Vitest, Testing Library

---

## File structure map

### Existing files to modify
- `src/components/ui/NineSliceButton.tsx`
  - Add plain-default state detection
  - Switch plain-default background source to `/defaultBtn.png`
  - Compute plain-default text colors for normal / hover / active / disabled
  - Add disabled overlay style variable for plain-default only
- `src/components/ui/NineSliceButton.module.scss`
  - Update default text color fallback
  - Add a background overlay pseudo-layer for plain-default disabled state
- `src/components/ui/NineSliceButton.test.tsx`
  - Add failing tests for default PNG source, default state colors, disabled overlay, and seasonal isolation

### Existing files to validate manually
- `src/pages/ButtonDemo.tsx`
  - Visual verification target for default / disabled / loading / size / block behavior

### No new runtime files
- Reuse `public/defaultBtn.png`
- Do not add new components, hooks, or utilities

---

### Task 1: Lock behavior with tests first

**Files:**
- Modify: `src/components/ui/NineSliceButton.test.tsx`
- Test: `src/components/ui/NineSliceButton.test.tsx`

- [ ] **Step 1: Extend the mocked background hook so tests can inspect the background source**

Replace the current hook mock in `src/components/ui/NineSliceButton.test.tsx` with this version so the canvas carries the selected image source as an attribute:

```ts
vi.mock('../../hooks/useNineSliceBackground', () => ({
  useNineSliceBackground: ({ src }: { src: string }) => ({
    hostRef: vi.fn(),
    canvasProps: {
      className: 'nine-slice-button__canvas',
      'aria-hidden': true,
      'data-src': src,
    },
    isReady: true,
    redraw: vi.fn(),
  }),
}))
```

- [ ] **Step 2: Add a failing test for plain default background source and normal text color**

Append this test inside `describe('NineSliceButton', ...)`:

```ts
it('uses defaultBtn.png and the default normal text color for plain default buttons', () => {
  render(<NineSliceButton>默认按钮</NineSliceButton>)

  const button = screen.getByRole('button', { name: '默认按钮' })
  const canvas = button.querySelector('canvas')

  expect(canvas).toHaveAttribute('data-src', '/defaultBtn.png')
  expect(button.style.getPropertyValue('--nine-slice-button-default-color')).toBe('#5D4037')
  expect(button.style.getPropertyValue('--nine-slice-button-default-disabled-overlay')).toBe('transparent')
})
```

- [ ] **Step 3: Add a failing test for hover and active plain-default text colors**

Append this test:

```ts
it('updates plain default text colors on hover and active states', () => {
  render(<NineSliceButton>状态按钮</NineSliceButton>)

  const button = screen.getByRole('button', { name: '状态按钮' })

  expect(button.style.getPropertyValue('--nine-slice-button-default-color')).toBe('#5D4037')

  fireEvent.pointerEnter(button)
  expect(button.style.getPropertyValue('--nine-slice-button-default-color')).toBe('#3E2723')

  fireEvent.pointerDown(button, { button: 0 })
  expect(button.style.getPropertyValue('--nine-slice-button-default-color')).toBe('#2E1B15')

  fireEvent.pointerUp(button, { button: 0 })
  expect(button.style.getPropertyValue('--nine-slice-button-default-color')).toBe('#3E2723')

  fireEvent.pointerLeave(button)
  expect(button.style.getPropertyValue('--nine-slice-button-default-color')).toBe('#5D4037')
})
```

- [ ] **Step 4: Add a failing test for plain-default disabled overlay and disabled text color**

Append this test:

```ts
it('applies disabled overlay and disabled text color to plain default buttons', () => {
  render(<NineSliceButton disabled>禁用默认按钮</NineSliceButton>)

  const button = screen.getByRole('button', { name: '禁用默认按钮' })
  const canvas = button.querySelector('canvas')

  expect(button).toBeDisabled()
  expect(canvas).toHaveAttribute('data-src', '/defaultBtn.png')
  expect(button.style.getPropertyValue('--nine-slice-button-default-color')).toBe('#B0BEC5')
  expect(button.style.getPropertyValue('--nine-slice-button-default-disabled-overlay')).toBe('rgba(240, 230, 210, 0.6)')
})
```

- [ ] **Step 5: Add a failing test that seasonal default buttons stay isolated from the new default PNG logic**

Append this test:

```ts
it('keeps seasonal default buttons on seasonal styling instead of defaultBtn.png', () => {
  render(<NineSliceButton theme="spring">春季默认按钮</NineSliceButton>)

  const button = screen.getByRole('button', { name: '春季默认按钮' })
  const canvas = button.querySelector('canvas')

  expect(button).toHaveClass('nine-slice-button--seasonal')
  expect(button.style.getPropertyValue('--nine-slice-button-default-color')).toBe('#2E7D32')
  expect(button.style.getPropertyValue('--nine-slice-button-default-disabled-overlay')).toBe('')
  expect(canvas).not.toHaveAttribute('data-src', '/defaultBtn.png')
})
```

- [ ] **Step 6: Run the focused test file and confirm the new assertions fail first**

Run:

```bash
bun run test:run src/components/ui/NineSliceButton.test.tsx
```

Expected: FAIL because the component still uses `/btnImg.png`, does not set `--nine-slice-button-default-color` for plain default state, and does not expose the disabled overlay variable.

- [ ] **Step 7: Commit the red test state checkpoint**

```bash
git add src/components/ui/NineSliceButton.test.tsx
git commit -m "test: define default button png behavior"
```

---

### Task 2: Implement plain-default PNG, state colors, and disabled overlay

**Files:**
- Modify: `src/components/ui/NineSliceButton.tsx`
- Modify: `src/components/ui/NineSliceButton.module.scss`
- Test: `src/components/ui/NineSliceButton.test.tsx`

- [ ] **Step 1: Define plain-default state constants in the button component**

In `src/components/ui/NineSliceButton.tsx`, add these constants near `DEFAULT_INSETS` / `DEFAULT_COLOR_MAP`:

```ts
const DEFAULT_BUTTON_BACKGROUND_SRC = '/defaultBtn.png'
const DEFAULT_BUTTON_TEXT_COLORS = {
  normal: '#5D4037',
  hover: '#3E2723',
  active: '#2E1B15',
  disabled: '#B0BEC5',
} as const
const DEFAULT_BUTTON_DISABLED_OVERLAY = 'rgba(240, 230, 210, 0.6)'
```

- [ ] **Step 2: Add plain-default state detection and effective background source selection**

Inside `StarNineSliceButton`, after `usesSeasonalBackground` and before `tone`, add this logic:

```ts
const isPlainDefaultButton = variant === 'default' && !theme

const plainDefaultState = isDisabled
  ? 'disabled'
  : isPressed
    ? 'active'
    : isHovered
      ? 'hover'
      : 'normal'

const resolvedBackgroundSrc = isPlainDefaultButton ? DEFAULT_BUTTON_BACKGROUND_SRC : backgroundSrc
```

Then change the background hook call from:

```ts
src: backgroundSrc,
```

to:

```ts
src: resolvedBackgroundSrc,
```

- [ ] **Step 3: Override plain-default style variables without affecting seasonal buttons**

Replace the current `buttonStyle` `useMemo` block in `src/components/ui/NineSliceButton.tsx` with this version:

```ts
const buttonStyle = useMemo(() => {
  if (usesSeasonalBackground && theme) {
    return {
      ...style,
      '--nine-slice-button-default-color': getSeasonalButtonTextColor(theme, seasonalState),
      '--nine-slice-button-disabled-color': getSeasonalButtonTextColor(theme, seasonalState),
      fontWeight: seasonalState === 'active' ? 700 : style?.fontWeight,
    } as CSSProperties
  }

  if (isPlainDefaultButton) {
    return {
      ...style,
      '--nine-slice-button-default-color': DEFAULT_BUTTON_TEXT_COLORS[plainDefaultState],
      '--nine-slice-button-disabled-color': DEFAULT_BUTTON_TEXT_COLORS.disabled,
      '--nine-slice-button-default-disabled-overlay':
        plainDefaultState === 'disabled' ? DEFAULT_BUTTON_DISABLED_OVERLAY : 'transparent',
    } as CSSProperties
  }

  return style
}, [isPlainDefaultButton, plainDefaultState, seasonalState, style, theme, usesSeasonalBackground])
```

- [ ] **Step 4: Keep existing variant behavior intact**

Do not change these existing branches in `src/components/ui/NineSliceButton.tsx`:

```ts
const imageVariant =
  !usesSeasonalBackground &&
  (effectiveVariant === 'default' ||
    effectiveVariant === 'primary' ||
    effectiveVariant === 'warning' ||
    effectiveVariant === 'danger' ||
    effectiveVariant === 'disabled')

const dashedVariant = effectiveVariant === 'dashed'
```

The only runtime difference should be that plain-default buttons now resolve to `/defaultBtn.png` and expose the new style variables.

- [ ] **Step 5: Add the disabled overlay layer in SCSS**

In `src/components/ui/NineSliceButton.module.scss`, update the default block and add an overlay rule:

```scss
&__bg::after {
  content: '';
  position: absolute;
  inset: 0;
  background: var(--nine-slice-button-default-disabled-overlay, transparent);
  pointer-events: none;
}

&--default {
  color: var(--nine-slice-button-default-color, #5d4037);
}
```
```

Then make the existing background element a positioning context by updating `&__bg` to include:

```scss
position: absolute;
inset: 0;
z-index: 0;
pointer-events: none;
```

If those declarations are already present, keep them and only add the `::after` rule.

- [ ] **Step 6: Run the focused test file and confirm it passes**

Run:

```bash
bun run test:run src/components/ui/NineSliceButton.test.tsx
```

Expected: PASS for the new plain-default tests and all pre-existing seasonal tests.

- [ ] **Step 7: Commit the implementation checkpoint**

```bash
git add src/components/ui/NineSliceButton.tsx src/components/ui/NineSliceButton.module.scss src/components/ui/NineSliceButton.test.tsx
git commit -m "feat: switch default button to defaultBtn asset"
```

---

### Task 3: Verify demo behavior and full regression surface

**Files:**
- Validate: `src/pages/ButtonDemo.tsx`
- Validate: `src/components/ui/NineSliceButton.tsx`
- Validate: `src/components/ui/NineSliceButton.test.tsx`

- [ ] **Step 1: Run the full automated checks used by this repo for this change**

Run:

```bash
bun run test:run
bun run build
```

Expected:
- `bun run test:run` exits 0
- `bun run build` exits 0

- [ ] **Step 2: Start the local demo app for manual verification**

Run:

```bash
bun run dev
```

Expected: Vite dev server starts and prints a local URL.

- [ ] **Step 3: Manually verify the default button cases in the Button demo page**

Check `src/pages/ButtonDemo.tsx` scenarios in the browser:

- Basic section: `默认按钮` uses `defaultBtn.png`
- Disabled section: `禁用默认按钮` uses the same PNG plus a visible warm overlay and gray text
- Theme section: all `theme="spring|summer|autumn|winter"` buttons still use seasonal rendering
- Size section: `small` and default size still align correctly
- Block section: themed block button remains unchanged, and any plain default block usage still stretches correctly if exercised locally
- Loading state: plain default loading keeps layout and spinner alignment intact

- [ ] **Step 4: Capture any regression before closing the task**

If manual verification finds that `primary`, `warning`, `danger`, `dashed`, `text`, or `link` changed unexpectedly, stop and fix that before proceeding. The expected steady-state is that only plain `variant="default"` changed.

- [ ] **Step 5: Commit the verification checkpoint**

```bash
git add src/components/ui/NineSliceButton.tsx src/components/ui/NineSliceButton.module.scss src/components/ui/NineSliceButton.test.tsx
git commit -m "test: verify default button asset migration"
```

---

## Spec coverage check

- Use `public/defaultBtn.png` only for plain default buttons: covered in Task 2 Steps 1-3
- Keep seasonal buttons unchanged: covered in Task 1 Step 5 and Task 3 Step 3
- Keep other variants unchanged: covered in Task 2 Step 4 and Task 3 Step 4
- Text-only hover / active state changes: covered in Task 1 Step 3 and Task 2 Step 3
- Disabled overlay and disabled text color: covered in Task 1 Step 4 and Task 2 Steps 3-5
- Preserve size / block / loading behavior: covered in Task 3 Step 3

## Placeholder scan

- No `TODO`, `TBD`, or deferred steps remain.
- Every code-editing step includes exact code to add or replace.
- Every verification step includes exact commands and expected outcomes.

## Type consistency check

- `isPlainDefaultButton`, `plainDefaultState`, `resolvedBackgroundSrc`, and `DEFAULT_BUTTON_DISABLED_OVERLAY` are defined in Task 2 before use.
- CSS variable names are consistent across tests, component code, and SCSS:
  - `--nine-slice-button-default-color`
  - `--nine-slice-button-disabled-color`
  - `--nine-slice-button-default-disabled-overlay`
