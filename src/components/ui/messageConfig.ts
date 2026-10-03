export type MessageType = 'normal' | 'info' | 'success' | 'warning' | 'error'
export type MessageBottom = 'left' | 'right'
export type MessagePosition =
  | 'top'
  | 'top-left'
  | 'top-right'
  | 'left'
  | 'center'
  | 'right'
  | 'bottom'
  | 'bottom-left'
  | 'bottom-right'

export interface MessageAction {
  label: string
  onClick: () => void
}

export interface MessageOptions {
  position?: MessagePosition
  bottom?: MessageBottom
  duration?: number
  /** Runs once after the message is dismissed, including via the returned `close` method. */
  onClose?: () => void
  /** Runs when the message surface is clicked. */
  onClick?: () => void
  /** An optional in-message action. The action click does not trigger `onClick`. */
  action?: MessageAction
}

export interface MessageProps extends MessageOptions {
  content: string
  type?: MessageType
}

/**
 * What `message()` hands back.
 *
 * `update` exists because the common case is a message whose *content* changes
 * over time — "上传中…" then "上传失败". Without it the only option is to close
 * the first message and open a second, which leaves two toasts on screen and
 * makes the user read the failure twice. Updating in place also preserves the
 * original position in the stack.
 */
export interface MessageHandle {
  close: () => void
  /** Merge new fields into the existing message and re-render in place. */
  update: (next: Partial<MessageOptions> & { content?: string; type?: MessageType }) => void
}

export interface MessageRecord extends MessageProps {
  id: string
}

export const MESSAGE_PLACEMENTS: MessagePosition[] = [
  'top',
  'top-left',
  'top-right',
  'left',
  'center',
  'right',
  'bottom',
  'bottom-left',
  'bottom-right',
]

export const MESSAGE_ICON_MAP: Record<MessageType, string> = {
  normal: '💬',
  info: '📌',
  success: '✅',
  warning: '⚠️',
  error: '❌',
}

export const MESSAGE_THEME_MAP: Record<MessageType, { fill: string; border: string; text: string }> = {
  normal: { fill: '#F5E6CC', border: '#3A2E39', text: '#3A2E39' },
  info: { fill: '#C2ECE6', border: '#26746F', text: '#1D5855' },
  success: { fill: '#E0F0CF', border: '#2F6A38', text: '#285630' },
  warning: { fill: '#FFF0BF', border: '#8A5A16', text: '#68400C' },
  error: { fill: '#FFD8D2', border: '#A13E35', text: '#742A25' },
}

/** Resolves the final placement, keeping the legacy `bottom` alias working. */
export function resolveMessagePlacement(
  position?: MessagePosition,
  bottom?: MessageBottom
): MessagePosition {
  if (position) return position
  if (bottom === 'left') return 'bottom-left'
  if (bottom === 'right') return 'bottom-right'
  return 'top'
}
