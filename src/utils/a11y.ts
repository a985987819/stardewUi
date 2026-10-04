/**
 * Resolve an accessible name that a component accepts under two spellings.
 *
 * Several components here expose a camelCase `ariaLabel` prop, while the DOM
 * attribute spelling (`aria-label`) reaches the same element through the
 * `...rest` spread every component forwards. Both are legitimate React, and
 * callers reasonably reach for either — so both have to work.
 *
 * Without this, JSX prop order decides the winner: `{...rest}` expands *before*
 * the explicit `aria-label={ariaLabel}`, so a caller who wrote the hyphenated
 * spelling has it silently overwritten by `undefined`. The accessible name just
 * disappears, with no warning — worse than a type error, because the component
 * still renders and looks fine.
 *
 * The camelCase prop wins when both are supplied, since it is the documented
 * one and its presence is an explicit choice rather than a leftover.
 */
export function resolveAriaLabel(
  ariaLabel: string | undefined,
  rest: Record<string, unknown>,
): string | undefined {
  const passthrough = rest['aria-label']
  if (ariaLabel !== undefined) return ariaLabel
  return typeof passthrough === 'string' ? passthrough : undefined
}
