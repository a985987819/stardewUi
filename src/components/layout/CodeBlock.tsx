import { useEffect, useState, useRef } from 'react'
import { Check, Copy } from 'lucide-react'
import hljs from 'highlight.js'
import './CodeBlock.css'

interface CodeBlockProps {
  code: string
  language?: string
  showLineNumbers?: boolean
  className?: string
}

function CodeBlock({
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
    <div className={`code-block ${className}`}>
      <div className="code-block-header">
        <span className="code-block-language">{language}</span>
        <button className="code-block-copy" onClick={handleCopy}>
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
      <div className="code-block-content">
        {showLineNumbers && (
          <div className="code-block-lines">
            {lines.map((_, index) => (
              <span key={index} className="code-block-line-number">
                {index + 1}
              </span>
            ))}
          </div>
        )}
        <pre className="code-block-pre">
          <code ref={codeRef} className={`language-${language}`}>
            {code}
          </code>
        </pre>
      </div>
    </div>
  )
}

export default CodeBlock
