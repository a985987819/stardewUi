import hljs from 'highlight.js/lib/core'
import bash from 'highlight.js/lib/languages/bash'
import json from 'highlight.js/lib/languages/json'
import typescript from 'highlight.js/lib/languages/typescript'
import xml from 'highlight.js/lib/languages/xml'

// Only the grammars this docs site actually uses are registered. Importing the
// default `highlight.js` entry point instead pulls in every bundled language
// (~1 MB) and was the single largest contributor to the app bundle.
hljs.registerLanguage('bash', bash)
hljs.registerLanguage('json', json)
hljs.registerLanguage('typescript', typescript)
hljs.registerLanguage('xml', xml)

/** Maps the aliases used across the docs onto a registered highlight.js grammar. */
const LANGUAGE_ALIASES: Record<string, string> = {
  sh: 'bash',
  shell: 'bash',
  ts: 'typescript',
  tsx: 'typescript',
  js: 'typescript',
  jsx: 'typescript',
  javascript: 'typescript',
  html: 'xml',
}

/**
 * Resolves a requested language to a registered grammar name.
 * Returns `null` when the grammar is unknown so callers can fall back to plain text.
 */
export function resolveHighlightLanguage(language: string): string | null {
  const normalized = language.toLowerCase()
  const mapped = LANGUAGE_ALIASES[normalized] ?? normalized

  return hljs.getLanguage(mapped) ? mapped : null
}

/**
 * Produces highlight.js token markup for the given source.
 *
 * `hljs.highlight` escapes the input before wrapping it in spans, so the
 * returned string only ever contains markup hljs itself generated.
 * Returns `null` for unsupported languages.
 */
export function highlightCode(code: string, language: string): string | null {
  const resolved = resolveHighlightLanguage(language)

  if (!resolved) {
    return null
  }

  try {
    return hljs.highlight(code, { language: resolved, ignoreIllegals: true }).value
  } catch {
    return null
  }
}
