import { useEffect, useMemo, useRef, useState } from 'react'
import { Check, Copy } from 'lucide-react'
import { classNames } from '../../utils/classNames'
import { highlightCode } from './codeHighlight'
import styles from './CodeBlock.module.scss'

interface CodeBlockProps {
  code: string
  language?: string
  showLineNumbers?: boolean
  className?: string
}

function StarCodeBlock({
  code,
  language = 'typescript',
  showLineNumbers = true,
  className = '',
}: CodeBlockProps) {
  const [copied, setCopied] = useState(false)
  const copyTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Highlighting is derived during render rather than mutated onto the DOM in an
  // effect. The previous implementation called `hljs.highlightElement` on an
  // element React already owned, so every re-render (and React 19 StrictMode's
  // double-invoked effects) re-highlighted the spans hljs had just produced and
  // triggered "unescaped HTML" warnings.
  const highlighted = useMemo(() => highlightCode(code, language), [code, language])

  useEffect(
    () => () => {
      if (copyTimerRef.current !== null) {
        clearTimeout(copyTimerRef.current)
        copyTimerRef.current = null
      }
    },
    []
  )

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code)
      setCopied(true)

      if (copyTimerRef.current !== null) {
        clearTimeout(copyTimerRef.current)
      }

      copyTimerRef.current = setTimeout(() => {
        copyTimerRef.current = null
        setCopied(false)
      }, 2000)
    } catch (err) {
      console.error('复制失败:', err)
    }
  }

  const lines = code.split('\n')

  return (
    <div className={classNames(styles['code-block'], className)}>
      <div className={styles['code-block-header']}>
        <span className={styles['code-block-language']}>{language}</span>
        <button className={styles['code-block-copy']} onClick={handleCopy}>
          {copied ? (
            <>
              <Check size={14} />
              <span>已复制</span>
            </>
          ) : (
            <>
              <Copy size={14} />
              <span>复制</span>
            </>
          )}
        </button>
      </div>
      <div className={styles['code-block-content']}>
        {showLineNumbers ? (
          <div className={styles['code-block-lines']}>
            {lines.map((_, index) => (
              <span key={index} className={styles['code-block-line-number']}>
                {index + 1}
              </span>
            ))}
          </div>
        ) : null}
        <pre className={styles['code-block-pre']}>
          {highlighted !== null ? (
            <code
              className={`language-${language} hljs`}
              dangerouslySetInnerHTML={{ __html: highlighted }}
            />
          ) : (
            <code className={`language-${language}`}>{code}</code>
          )}
        </pre>
      </div>
    </div>
  )
}

export default StarCodeBlock
