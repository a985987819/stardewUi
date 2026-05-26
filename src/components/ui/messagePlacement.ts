import type { MessageBottom, MessagePosition } from './Message'

export function resolvePlacement(position?: MessagePosition, bottom?: MessageBottom): MessagePosition {
  if (position) {
    return position
  }

  if (bottom === 'left') {
    return 'bottom-left'
  }

  if (bottom === 'right') {
    return 'bottom-right'
  }

  return 'top'
}
