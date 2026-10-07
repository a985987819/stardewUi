/// <reference types="node" />
import { readFileSync, readdirSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'
import { ISSUE_TEMPLATES, GITHUB_REPO_URL, newIssueUrl } from './githubIssues'

/**
 * Keeps the issue links and GitHub's own templates from drifting apart.
 *
 * A `?template=` value that matches no file on disk does not fail visibly.
 * GitHub opens a perfectly normal blank "new issue" page — same URL shape, same
 * green link, no warning — so the reader who chose "许愿组件" to be asked what
 * they were trying to build gets an empty title field and leaves. Nothing in the
 * app can detect it: the link is correct as far as the browser is concerned.
 *
 * These are the checks that make the failure loud. They are textual rather than
 * a YAML parse because the thing worth pinning is the *contract* — the file name
 * in the code matches a template that exists, and that template declares the
 * fields its route promises — not the YAML being well-formed, which GitHub
 * already refuses with a visible error.
 */

const templatesDir = resolve(process.cwd(), '.github/ISSUE_TEMPLATE')
const read = (path: string) => readFileSync(resolve(process.cwd(), path), 'utf8')

/** Every template file on disk, excluding the picker config. */
const templateFiles = () =>
  readdirSync(templatesDir).filter((name) => name.endsWith('.yml') && name !== 'config.yml')

/**
 * The file names the app routes to, as a plain `Set<string>`.
 *
 * Typed explicitly rather than inferred: `ISSUE_TEMPLATES` is `as const`, so its
 * names are a literal union, and a `Set` built from it only accepts those four.
 * That is exactly wrong here — comparing it against whatever is on disk is the
 * point, and narrowing the set would make an unknown file unspeakable and the
 * orphan check unable to report one.
 */
const referencedTemplates = () => new Set<string>(ISSUE_TEMPLATES.map(({ template }) => template))

/** Field types a form may declare, per GitHub's issue-form syntax. */
const FIELD_TYPES = ['markdown', 'input', 'textarea', 'dropdown', 'checkboxes']

describe('issue templates on disk', () => {
  it('has a file for every route the UI offers', () => {
    // The failure this exists for, stated as an assertion: a template renamed on
    // disk without updating `ISSUE_TEMPLATES` produces a blank form for that
    // route, and nothing else in the app would notice.
    const onDisk = new Set(templateFiles())

    const missing = ISSUE_TEMPLATES.filter(({ template }) => !onDisk.has(template)).map(
      ({ template }) => template,
    )

    expect(
      missing,
      `代码引用了不存在的模板文件，GitHub 会静默回退到空白 issue 表单：${missing.join(', ')}`,
    ).toEqual([])
  })

  it('has no template that no route can reach', () => {
    // The other direction. An orphan template still shows up in GitHub's own
    // picker, so this is not broken — but it means someone wrote a form that the
    // site never offers, and the menu is the thing that decides which get used.
    const referenced = referencedTemplates()

    const orphans = templateFiles().filter((name) => !referenced.has(name))

    expect(
      orphans,
      `这些模板没有任何入口能跳到：${orphans.join(', ')}（若确实不需要入口，删掉它）`,
    ).toEqual([])
  })

  it('routes each template to the form whose fields match what it promises', () => {
    // The reason the four templates exist separately. A bug report with no
    // reproduction steps is the report that cannot be fixed in one pass, and
    // nothing but the template itself can force the question to be asked.
    const required: Record<string, string[]> = {
      'bug_report.yml': ['what-happened', 'reproduce', 'version'],
      'error_report.yml': ['error', 'what-you-did', 'version', 'stage'],
      'style_improvement.yml': ['area', 'what-wrong'],
      'feature_request.yml': ['scenario'],
    }

    for (const [file, fields] of Object.entries(required)) {
      const source = read(`.github/ISSUE_TEMPLATE/${file}`)

      for (const field of fields) {
        expect(source, `${file} 缺少字段 ${field}`).toContain(`id: ${field}`)
      }
    }
  })

  it('marks the essential fields required on every template', () => {
    // An optional field is a question that gets skipped, and a skipped question
    // is the one that would have answered the problem. Everything in
    // `required` above must therefore be non-optional in the YAML.
    const mustBeRequired = [
      ['bug_report.yml', 'what-happened'],
      ['bug_report.yml', 'reproduce'],
      ['error_report.yml', 'error'],
      ['error_report.yml', 'what-you-did'],
      ['style_improvement.yml', 'what-wrong'],
      ['feature_request.yml', 'scenario'],
    ] as const

    for (const [file, id] of mustBeRequired) {
      const source = read(`.github/ISSUE_TEMPLATE/${file}`)
      // Each field is a block starting at its `id:`; the `required: true` that
      // matters is the one inside it, not the next field's.
      const block = source.slice(source.indexOf(`id: ${id}`))
      const nextField = block.indexOf('\n  - type:', 1)

      expect(
        nextField === -1 ? block : block.slice(0, nextField),
        `${file} 的 ${id} 应该是必填的，否则读者会跳过它`,
      ).toContain('required: true')
    }
  })

  it('only uses field types GitHub supports', () => {
    // An unknown type makes GitHub reject the whole form with a banner — the
    // template silently stops working, which is the same blank-page outcome as a
    // wrong file name and just as invisible from here.
    const invalid: string[] = []

    for (const name of templateFiles()) {
      for (const [, type] of read(`.github/ISSUE_TEMPLATE/${name}`).matchAll(/^\s*- type: (\S+)/gm)) {
        if (!FIELD_TYPES.includes(type)) invalid.push(`${name}: ${type}`)
      }
    }

    expect(invalid, `GitHub 不支持这些字段类型，模板会整体失效：\n${invalid.join('\n')}`).toEqual([])
  })

  it('gives every template a name and a description', () => {
    // `name` is what the menu shows in GitHub's own picker; `description` is what
    // tells a reader which form to pick when they arrive without a menu. A
    // template missing either still works but is much harder to find.
    for (const { template } of ISSUE_TEMPLATES) {
      const source = read(`.github/ISSUE_TEMPLATE/${template}`)

      expect(source, `${template} 缺少 name:`).toMatch(/^name: \S+/m)
      expect(source, `${template} 缺少 description:`).toMatch(/^description: \S+/m)
    }
  })
})

describe('newIssueUrl', () => {
  it('points at the repository on GitHub', () => {
    expect(GITHUB_REPO_URL).toBe('https://github.com/a985987819/stardewUi')
  })

  it('carries the template through as ?template=', () => {
    // GitHub matches this parameter against the file name, extension included.
    const url = new URL(newIssueUrl('bug_report.yml'))

    expect(url.origin + url.pathname).toBe(`${GITHUB_REPO_URL}/issues/new`)
    expect(url.searchParams.get('template')).toBe('bug_report.yml')
  })

  it('omits the parameter entirely when no template is given', () => {
    // `?template=` with an empty value is not the same as no parameter at all —
    // GitHub treats it as an explicit request for a template and shows the picker
    // with nothing selected, which is a worse outcome than plain "new issue".
    expect(newIssueUrl()).toBe(`${GITHUB_REPO_URL}/issues/new`)
    expect(newIssueUrl('')).toBe(`${GITHUB_REPO_URL}/issues/new`)
  })

  it('prefills the title with the page the reader was on', () => {
    // The URL is the piece of context a bug report most needs and the user least
    // thinks to include. GitHub reads `q` as the initial title, so the report
    // arrives already naming the page it came from.
    const url = new URL(newIssueUrl('bug_report.yml', 'https://example.com/stardewUi/components?lang=zh'))

    expect(url.searchParams.get('q')).toBe('https://example.com/stardewUi/components?lang=zh')
  })

  it('encodes a URL with its own query string', () => {
    // Unescaped, the page URL's own `?` and `&` would split into separate GitHub
    // parameters and the prefilled title would arrive truncated at the first `&`.
    const url = new URL(newIssueUrl('bug_report.yml', 'https://example.com/a?b=1&c=2'))

    expect(url.searchParams.get('q')).toBe('https://example.com/a?b=1&c=2')
    expect(url.searchParams.get('b')).toBeNull()
  })
})