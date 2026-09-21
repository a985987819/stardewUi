import { useState, useCallback, useEffect, useRef } from 'react'

/**
 * State that mirrors a `localStorage` entry.
 *
 * The `key` is expected to stay stable for the lifetime of the hook. If it does
 * change, the new key starts from whatever the caller passes as `initialValue`
 * and will only be written on the next update.
 */
export function useLocalStorage<T>(
  key: string,
  initialValue: T
): [T, (value: T | ((prev: T) => T)) => void] {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key)
      return item ? (JSON.parse(item) as T) : initialValue
    } catch {
      return initialValue
    }
  })

  // Persisting happens here rather than inside the state updater. A state updater
  // must be pure: React may invoke it more than once (StrictMode) or discard the
  // render entirely, which previously allowed localStorage and real state to
  // drift apart and produced duplicate writes on every render pass.
  const isInitialRunRef = useRef(true)

  useEffect(() => {
    if (isInitialRunRef.current) {
      isInitialRunRef.current = false
      return
    }

    try {
      window.localStorage.setItem(key, JSON.stringify(storedValue))
    } catch (error) {
      console.error('Failed to save to localStorage:', error)
    }
  }, [key, storedValue])

  const setValue = useCallback((value: T | ((prev: T) => T)) => {
    setStoredValue((prev) => (value instanceof Function ? value(prev) : value))
  }, [])

  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key !== key) return
      if (e.newValue === null) return
      try {
        setStoredValue(JSON.parse(e.newValue) as T)
      } catch {
        // ignore malformed payloads from other tabs
      }
    }

    window.addEventListener('storage', handleStorageChange)
    return () => window.removeEventListener('storage', handleStorageChange)
  }, [key])

  return [storedValue, setValue]
}
