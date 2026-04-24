import { useState, useCallback } from 'react'

export function useToggle(initialValue = false): [boolean, () => void, (value: boolean) => void] {
  const [value, setValue] = useState(initialValue)

  const toggle = useCallback(() => {
    setValue(prev => !prev)
  }, [])

  const setToggle = useCallback((newValue: boolean) => {
    setValue(newValue)
  }, [])

  return [value, toggle, setToggle]
}
