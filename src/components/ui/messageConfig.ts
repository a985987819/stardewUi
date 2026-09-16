export type MessageType = 'normal' | 'info' | 'success' | 'warning' | 'error'
export type MessageBottom = 'left' | 'right'
export type MessagePosition = 'top' | 'bottom-left' | 'bottom-right'

export interface MessageOptions {
  position?: MessagePosition
  bottom?: MessageBottom
  duration?: number
}

export interface MessageProps extends MessageOptions {
  content: string
  type?: MessageType
  onClose?: () => void
}

export interface MessageRecord extends MessageProps {
  id: string
}

export const MESSAGE_PLACEMENTS: MessagePosition[] = ['top', 'bottom-left', 'bottom-right']

export const MESSAGE_ICON_MAP: Record<MessageType, string> = {
  normal: '💬',
  info: '📌',
  success: '✅',
  warning: '⚠️',
  error: '❌',
}

export const MESSAGE_THEME_MAP: Record<MessageType, { fill: string; border: string; text: string }> = {
  normal: { fill: '#F5E6CC', border: '#3A2E39', text: '#3A2E39' },
  info: { fill: '#E0F7FA', border: '#2E4057', text: '#2E4057' },
  success: { fill: '#E6F2D9', border: '#2F5233', text: '#2F5233' },
  warning: { fill: '#FFF2D5', border: '#6B4226', text: '#6B4226' },
  error: { fill: '#FFD1E3', border: '#5C3A57', text: '#5C3A57' },
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
