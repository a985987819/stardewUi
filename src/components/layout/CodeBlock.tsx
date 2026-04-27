import { useEffect, useRef, useState } from 'react'
import { Check, Copy } from 'lucide-react'
import { classNames } from '../../utils/classNames'
import hljs from 'highlight.js'
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
  const codeRef = useRef<HTMLElement>(null)

  useEffect(() => {
    if (codeRef.current) {
      codeRef.current.removeAttribute('data-highlighted')
      hljs.highlightElement(codeRef.current)
    }
  }, [code, language])

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
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
          <code ref={codeRef} className={`language-${language}`}>
            {code}
          </code>
        </pre>
      </div>
    </div>
  )
}

export default StarCodeBlock
