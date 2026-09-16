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

  // Keeping the callback in a ref means `onComplete` never enters an effect's
  // dependency list. An inline arrow at the call site previously changed identity
  // on every parent render, which tore down and restarted the whole animation.
  const onCompleteRef = useRef(onComplete)

  useEffect(() => {
    onCompleteRef.current = onComplete
  }, [onComplete])

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

  // Rewind the sequence when the animated content or its timing changes. Derived
  // during render so the effect below only has to own the timers themselves.
  const [animationSignature, setAnimationSignature] = useState({ text, speed, startDelay })

  if (
    animationSignature.text !== text ||
    animationSignature.speed !== speed ||
    animationSignature.startDelay !== startDelay
  ) {
    setAnimationSignature({ text, speed, startDelay })
    setDisplayedText('')
    setIsComplete(false)
    setIsStarted(false)
  }

  // `completeTrigger` is an external "reveal everything now" signal, typically
  // bumped by a parent dialog/skip button.
  const [previousCompleteTrigger, setPreviousCompleteTrigger] = useState(completeTrigger)

  if (previousCompleteTrigger !== completeTrigger) {
    setPreviousCompleteTrigger(completeTrigger)

    if (!isComplete) {
      setDisplayedText(text)
      setIsComplete(true)
    }
  }

  useEffect(() => {
    if (isComplete) {
      return
    }

    clearAllTimers()
    indexRef.current = 0

    startTimerRef.current = setTimeout(() => {
      setIsStarted(true)

      timerRef.current = setInterval(() => {
        if (indexRef.current < text.length) {
          setDisplayedText(text.slice(0, indexRef.current + 1))
          indexRef.current++
        } else {
          if (timerRef.current) {
            clearInterval(timerRef.current)
            timerRef.current = null
          }
          setIsComplete(true)
        }
      }, speed)
    }, startDelay)

    return clearAllTimers
  }, [clearAllTimers, isComplete, speed, startDelay, text])

  // Fire the completion callback exactly once per finished sequence. This is an
  // external notification, so an effect is the right place for it.
  useEffect(() => {
    if (isComplete) {
      onCompleteRef.current?.()
    }
  }, [isComplete])

  const handleClick = useCallback(() => {
    if (!isComplete && isStarted) {
      setDisplayedText(text)
      setIsComplete(true)
    }
  }, [isComplete, isStarted, text])

  return (
    <span
      className={classNames(styles.typewriter, !isComplete && isStarted && styles['typewriter--typing'], className)}
      onClick={handleClick}
      title={!isComplete && isStarted ? 'Click to reveal all text' : undefined}
    >
      {displayedText}
      {!isComplete && isStarted ? <span className={styles['typewriter__cursor']}>|</span> : null}
    </span>
  )
}

export default StarTypewriter
