import '@testing-library/jest-dom/vitest'
import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { I18nProvider } from '../../i18n'
import StarComponentDemo, { createCopyableDemoCode } from './ComponentDemo'

describe('ComponentDemo copy-ready code', () => {
  it('adds one package import for every Stardew UI component used by a snippet', () => {
    expect(createCopyableDemoCode('<StarRating />\n<StarCheckbox />')).toBe(
      "import { StarRating, StarCheckbox } from 'stardew-valley-ui'\n\n<StarRating />\n<StarCheckbox />",
    )
  })

  it('also includes supported icon imports and preserves a complete authored snippet', () => {
    expect(createCopyableDemoCode('<StarInput prefix={<Search size={16} />} />')).toBe(
      "import { StarInput } from 'stardew-valley-ui'\nimport { Search } from 'lucide-react'\n\n<StarInput prefix={<Search size={16} />} />",
    )

    const authored = "import { StarRating } from 'stardew-valley-ui'\n\n<StarRating />"
    expect(createCopyableDemoCode(authored)).toBe(authored)
  })

  it('shows copy-ready code by default', () => {
    render(
      <I18nProvider>
        <StarComponentDemo title="Rating" code="<StarRating defaultValue={3} />">
          <span>Preview</span>
        </StarComponentDemo>
      </I18nProvider>,
    )

    expect(screen.getByText('可直接复制的示例')).toBeInTheDocument()
    expect(screen.getByText((_, element) => element?.tagName === 'CODE' && element.textContent?.includes("import { StarRating } from 'stardew-valley-ui'") === true)).toBeInTheDocument()
  })
})
