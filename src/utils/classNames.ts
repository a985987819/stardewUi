import { clsx, type ClassValue } from 'clsx'

export function classNames(...inputs: ClassValue[]): string {
  return clsx(inputs)
}
