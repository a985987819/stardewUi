import '@testing-library/jest-dom/vitest'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { useState } from 'react'
import { describe, expect, it } from 'vitest'
import Alert from './Alert'
import Dialog from './Dialog'
import Drawer from './Drawer'

/**
 * Focus containment for the three components that declare `aria-modal`.
 *
 * `aria-modal="true"` is a promise to assistive tech: it says the content behind
 * is unreachable. A component that declares it without containing focus is worse
 * than one that declares nothing, because the screen reader has already
 * announced "dialog" and the user then tabs straight into the page behind.
 *
 * Nothing tested this before, which is how a redundant second `useFocusTrap`
 * call in Drawer survived — two effects, two capture-phase keydown listeners,
 * two focus moves, two recorded `previouslyFocused` values. The focus landing
 * happened to still be correct because the cleanups run in registration order
 * and the first one's restore satisfied the second one's guard, so it was waste
 * rather than breakage. Waste is exactly the kind of thing that turns into a
 * bug on the next edit, so the contract is pinned here instead.
 *
 * The overlays are driven through real state and opened by clicking a focused
 * trigger. Both details are load-bearing: the close control only renders when
 * `onClose` is supplied, and the trap restores to whatever had focus — so a
 * trigger that was never focused makes "focus comes back" indistinguishable
 * from "focus fell off the page".
 */

const TRIGGER = '打开触发器'

function Trigger({ onClick }: { onClick?: () => void }) {
  return (
    <button type="button" onClick={onClick}>
      {TRIGGER}
    </button>
  )
}

/**
 * Open the overlay the way a user would: focus the trigger, then click it.
 *
 * Skipping this is what made an earlier version of this file pass for the wrong
 * reason — the trap restores to whatever had focus, so with the trigger never
 * focused, `previouslyFocused` was `<body>` and "focus comes back" was
 * indistinguishable from "focus fell off the page".
 */
function openViaTrigger(renderOverlay: (close: () => void) => React.ReactNode) {
  function Harness() {
    const [open, setOpen] = useState(false)
    return (
      <>
        <Trigger onClick={() => setOpen(true)} />
        {open ? renderOverlay(() => setOpen(false)) : null}
      </>
    )
  }
  return Harness
}

describe('focus containment for aria-modal surfaces', () => {
  /** Focus the trigger, then click it, and hand back the trigger element. */
  async function openFromTrigger() {
    const trigger = screen.getByRole('button', { name: TRIGGER })
    trigger.focus()
    expect(trigger).toHaveFocus()
    fireEvent.click(trigger)
    return trigger
  }

  it('moves focus into the Drawer and returns it to the trigger on close', async () => {
    const Harness = openViaTrigger((close) => (
      <Drawer open title="设置" onClose={close}>
        抽屉内容
      </Drawer>
    ))
    render(<Harness />)

    const trigger = await openFromTrigger()
    await waitFor(() => expect(screen.getByText('抽屉内容')).toBeInTheDocument())

    // With no `initialFocus` the trap focuses the panel itself, which is the
    // right default: the first Tab then reaches the header controls instead of
    // skipping past them.
    const panel = document.querySelector('[role="dialog"]') as HTMLElement
    expect(panel).toHaveFocus()

    fireEvent.click(screen.getByRole('button', { name: '关闭抽屉' }))

    // The exit animation delays unmount, so wait for the portal to go away
    // before asking where focus landed.
    await waitFor(() => expect(document.querySelector('[role="dialog"]')).toBeNull())
    expect(trigger).toHaveFocus()
  })

  it('does not strand focus on <body> after the Drawer closes', async () => {
    const Harness = openViaTrigger((close) => (
      <Drawer open title="设置" onClose={close}>
        抽屉内容
      </Drawer>
    ))
    render(<Harness />)

    const trigger = await openFromTrigger()
    await waitFor(() => expect(screen.getByText('抽屉内容')).toBeInTheDocument())

    fireEvent.click(screen.getByRole('button', { name: '关闭抽屉' }))

    await waitFor(() => expect(document.querySelector('[role="dialog"]')).toBeNull())
    // Focus must land back on the trigger, not spill onto <body> — the symptom a
    // mis-installed trap produces, and the reason this assertion is worth having
    // even though the redundant call it was written for turned out to be inert.
    expect(document.activeElement).not.toBe(document.body)
    expect(trigger).toHaveFocus()
  })

  it('keeps Tab inside the Drawer instead of walking into the page behind', async () => {
    const Harness = openViaTrigger((close) => (
      <Drawer open title="设置" onClose={close}>
        抽屉内容
      </Drawer>
    ))
    render(<Harness />)

    await openFromTrigger()
    await waitFor(() => expect(screen.getByText('抽屉内容')).toBeInTheDocument())

    const panel = document.querySelector('[role="dialog"]') as HTMLElement
    const focusable = panel.querySelectorAll('button, [href], input, [tabindex]:not([tabindex="-1"])')
    expect(focusable.length).toBeGreaterThan(0)
    ;(focusable[focusable.length - 1] as HTMLElement).focus()

    // Tab off the last focusable element: the trap must wrap back inside the
    // panel rather than let the browser continue into the document.
    fireEvent.keyDown(document, { key: 'Tab' })

    expect(panel.contains(document.activeElement)).toBe(true)
  })

  it('moves focus into the Dialog and restores it to the trigger on close', async () => {
    const Harness = openViaTrigger((close) => (
      <Dialog open title="设置" content="对话内容" onClose={close} />
    ))
    render(<Harness />)

    const trigger = await openFromTrigger()
    await waitFor(() => expect(screen.getByText('对话内容')).toBeInTheDocument())

    const panel = document.querySelector('[role="dialog"]') as HTMLElement
    expect(panel).toHaveFocus()

    // Dialog has no dedicated close button; the footer 取消 is the way out.
    fireEvent.click(screen.getByRole('button', { name: '取消' }))

    await waitFor(() => expect(document.querySelector('[role="dialog"]')).toBeNull())
    expect(trigger).toHaveFocus()
  })

  it('contains focus in the modal Alert', async () => {
    render(
      <>
        <Trigger />
        <Alert visible modal title="注意" onClose={() => {}}>
          提示内容
        </Alert>
      </>,
    )

    await waitFor(() => expect(screen.getByText('提示内容')).toBeInTheDocument())

    const alert = document.querySelector('[role="alertdialog"]')
    expect(alert).not.toBeNull()
    expect(alert?.contains(document.activeElement) ?? false).toBe(true)
  })
})

/**
 * Structural guard, because the behavioural tests above cannot see this.
 *
 * Drawer carried a second `useFocusTrap(panelRef, { active: rendered })` for a
 * while. It happened to be inert — the focus landing stayed correct — so no
 * runtime assertion could have caught it. What it did cost was real: two
 * capture-phase keydown listeners on `document`, two focus moves on open, and
 * two `previouslyFocused` snapshots. Behaviour-preserving redundancy is still
 * redundancy, and it is one refactor away from not being.
 *
 * Counting call sites is the only thing that reliably distinguishes "installed
 * once" from "installed twice".
 */
describe('focus trap installation', () => {
  it.each(['Dialog', 'Drawer', 'Alert'] as const)('%s installs the trap exactly once', (name) => {
    const source = readFileSync(resolve(process.cwd(), `src/components/ui/${name}.tsx`), 'utf8')
    // Strip comments first: the rationale above each call site names the hook,
    // and a bare `\buseFocusTrap\s*\(` would count those as installations. The
    // import line is dropped separately so what remains is call sites only.
    const code = source
      .replace(/\/\*[\s\S]*?\*\//g, '')
      .replace(/(^|[^:])\/\/.*$/gm, '$1')
      .replace(/^import\s.*$/gm, '')

    const calls = code.match(/\buseFocusTrap\s*\(/g) ?? []
    expect(calls).toHaveLength(1)
  })
})
