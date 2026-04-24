import { useState, useCallback } from 'react'
import { copyToClipboard } from '../utils'

export function useClipboard(): {
  copied: boolean
  copy: (text: string) => Promise<void>
  reset: () => void
} {
  const [copied, setCopied] = useState(false)

  const copy = useCallback(async (text: string) => {
    try {
      await copyToClipboard(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error('Failed to copy:', error)
    }
  }, [])

  const reset = useCallback(() => {
    setCopied(false)
  }, [])

  return { copied, copy, reset }
}
