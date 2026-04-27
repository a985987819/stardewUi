import { useState, useEffect, useCallback, useRef } from 'react'
import { classNames } from '../../utils/classNames'
import styles from './Typewriter.module.scss'

export interface StarTypewriterProps {
  text: string
  speed?: number
  className?: string
  onComplete?: () => void
  startDelay?: number
  completeTrigger?: number
}

function StarTypewriter({
  text,
  speed = 100,
  className = '',
  onComplete,
  startDelay = 0,
  completeTrigger = 0,
}: StarTypewriterProps) {
  const [displayedText, setDisplayedText] = useState('')
  const [isComplete, setIsComplete] = useState(false)
  const [isStarted, setIsStarted] = useState(false)
  const indexRef = useRef(0)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const startTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const previousCompleteTriggerRef = useRef(completeTrigger)

  const clearAllTimers = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
    if (startTimerRef.current) {
      clearTimeout(startTimerRef.current)
      startTimerRef.current = null
    }
  }, [])

  const completeTyping = useCallback(() => {
    clearAllTimers()
    setDisplayedText(text)
    setIsComplete(true)
    onComplete?.()
  }, [text, clearAllTimers, onComplete])

  useEffect(() => {
    clearAllTimers()
    setDisplayedText('')
    setIsComplete(false)
    setIsStarted(false)
    indexRef.current = 0

    startTimerRef.current = setTimeout(() => {
      setIsStarted(true)

      timerRef.current = setInterval(() => {
        if (indexRef.current < text.length) {
          setDisplayedText(text.slice(0, indexRef.current + 1))
          indexRef.current++
        } else {
          completeTyping()
        }
      }, speed)
    }, startDelay)

    return clearAllTimers
  }, [text, speed, startDelay, clearAllTimers, completeTyping])

  useEffect(() => {
    if (previousCompleteTriggerRef.current === completeTrigger) {
      return
    }

    previousCompleteTriggerRef.current = completeTrigger

    if (!isComplete) {
      completeTyping()
    }
  }, [completeTrigger, completeTyping, isComplete])

  const handleClick = useCallback(() => {
    if (!isComplete && isStarted) {
      completeTyping()
    }
  }, [isComplete, isStarted, completeTyping])

  return (
    <span
      className={classNames(styles.typewriter, !isComplete && isStarted && styles['typewriter--typing'], className)}
      onClick={handleClick}
      title={!isComplete && isStarted ? '点击快速显示全部' : undefined}
    >
      {displayedText}
      {!isComplete && isStarted ? <span className={styles['typewriter__cursor']}>|</span> : null}
    </span>
  )
}

export default StarTypewriter
