import type { ForwardedRef, MutableRefObject, RefObject } from 'react'

/**
 * Feed one node into two refs: a local one the component needs for its own
 * bookkeeping (auto-focus, measuring, keyboard handling) and the ref the caller
 * forwarded. Naively assigning one clobbers the other, so the component silently
 * stops working the moment a caller passes a ref.
 *
 * A callback ref is used for both because React invokes it with the node on
 * mount and `null` on unmount, which is exactly the shape needed to drive both.
 *
 * The tempting shortcut — returning `forwarded` when it is an object and writing
 * `forwarded.current` into `local` — is wrong: React has not assigned
 * `forwarded.current` yet at that point, so the local ref gets nulled and the
 * component's own focus/measurement logic quietly stops working.
 */
export function mergeRefs<T>(local: RefObject<T | null>, forwarded: ForwardedRef<T>) {
  return (node: T | null) => {
    ;(local as MutableRefObject<T | null>).current = node

    if (typeof forwarded === 'function') forwarded(node)
    else if (forwarded) (forwarded as MutableRefObject<T | null>).current = node
  }
}
