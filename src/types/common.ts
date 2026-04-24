export type Size = 'small' | 'medium' | 'large'

export type Status = 'default' | 'primary' | 'success' | 'warning' | 'danger' | 'info'

export type Align = 'left' | 'center' | 'right'

export type Direction = 'horizontal' | 'vertical'

export interface BaseProps {
  className?: string
  style?: React.CSSProperties
  children?: React.ReactNode
}

export type ReactRef<T> = React.Ref<T> | React.MutableRefObject<T | null>

export type Merge<P, T> = Omit<P, keyof T> & T

export type OptionalExceptFor<T, TRequired extends keyof T> = Partial<T> &
  Pick<T, TRequired>
