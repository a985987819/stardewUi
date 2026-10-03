/**
 * Dev-only warnings for values a component cannot honour.
 *
 * Split out from the components themselves because the checks have to run
 * *inside* React's render phase (to read fresh props) but must not run during
 * production builds, and a bare `if (process.env.NODE_ENV === …)` in every
 * component would be easy to delete by accident.
 *
 * Why bother: a silently-ignored prop is the most expensive failure mode a
 * component library has. `color="red"` used to fall back to the default magenta
 * with no diagnostic at all, so the developer blamed the library, the palette,
 * or their own stylesheet — in that order, usually all three. A one-line console
 * warning ends the search immediately.
 *
 * The rules are intentionally narrow: only report a prop the component
 * *silently* discards. Reporting a value that merely happens to be unusual
 * trains people to ignore the console, which costs more than it saves.
 */

const warned = new Set<string>()

/** Dedupe key: one warning per distinct (component, prop, value) triple. */
function once(key: string, message: () => void) {
  if (warned.has(key)) return
  warned.add(key)
  message()
}

function isDev() {
  // `import.meta.env` rather than `process.env`: this module ships to the
  // browser through both the docs app and the library entry, and the app's tsconfig
  // does not include Node types, so referencing `process` is a compile error
  // there. Vite statically replaces `import.meta.env.DEV`, so the whole guard is
  // dead-code-eliminated from production bundles.
  try {
    return import.meta.env?.DEV !== false
  } catch {
    // Environments without `import.meta` (older test runners) get the warning.
    return true
  }
}

/**
 * The colour syntaxes the palette derivation understands. Deliberately a subset
 * of CSS: this library derives a *border*, a *shadow*, and a *highlight* from the
 * fill by mixing channels, which needs parsed RGB. `red`, `var(--brand)`, and
 * `hsl(...)` cannot be mixed, so they are rejected rather than half-supported.
 */
const HEX_LIKE = /^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{4}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/
const BARE_HEX_LIKE = /^(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/

export function isSupportedPaletteColor(color: string) {
  const value = color.trim()
  return HEX_LIKE.test(value) || BARE_HEX_LIKE.test(value)
}

/**
 * Warn when a `color` prop cannot be honoured.
 *
 * `allowed` lets a component widen the contract: `Switch` also accepts any CSS
 * colour for its fill (it only needs a matching *edge*, which it takes from the
 * fallback palette), so it passes a looser predicate and gets a softer message.
 */
export function warnUnsupportedColor(component: string, color: unknown, allowed?: (value: string) => boolean) {
  if (!isDev()) return
  if (typeof color !== 'string' || !color.trim()) return

  const value = color.trim()
  const ok = allowed ? allowed(value) : isSupportedPaletteColor(value)
  if (ok) return

  once(`${component}:color:${value}`, () => {
    console.warn(
      `[stardew-ui] <${component} color="${value}"> could not derive a border, shadow, or ` +
        `highlight from that value, so the default palette was used instead. ` +
        `Pass a hex colour such as "#71964A" — bare 3/6-digit hex also works.`,
    )
  })
}

/**
 * Warn when an object-style prop is missing an identifier the component needs.
 *
 * The `CalendarItem.title`-style cases: a field that is documented as required
 * but that the user left out, where the failure would otherwise be a silent
 * `undefined` in the middle of the layout.
 */
export function warnMissingField(component: string, field: string, hint?: string) {
  if (!isDev()) return

  once(`${component}:missing:${field}`, () => {
    console.warn(
      `[stardew-ui] <${component}> received an item without \`${field}\`.` +
        (hint ? ` ${hint}` : ''),
    )
  })
}

/** Test seam: forget which warnings have already fired. */
export function resetWarningHistory() {
  warned.clear()
}