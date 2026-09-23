import '@testing-library/jest-dom/vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { I18nProvider } from '../../i18n'
import StarComponentDemo, { createCopyableDemoCode } from './ComponentDemo'

describe('ComponentDemo copy-ready code', () => {
  it('adds one package import for every Stardew UI component used by a snippet', () => {
    expect(createCopyableDemoCode('<StarRating />\n<StarCheckbox />')).toBe(
      "// src/components/examples/ComponentExample.tsx\nimport 'stardew-valley-ui/style.css'\nimport { StarRating, StarCheckbox } from 'stardew-valley-ui'\n\nexport function ComponentExample() {\n  return (\n    <>\n      <StarRating />\n      <StarCheckbox />\n    </>\n  )\n}",
    )
  })

  it('adds the React file location and styles to stateless and stateful examples', () => {
    const stateless = createCopyableDemoCode('<StarInput prefix={<Search size={16} />} />', 'SearchFieldExample')
    expect(stateless).toContain('// src/components/examples/SearchFieldExample.tsx')
    expect(stateless).toContain("import 'stardew-valley-ui/style.css'")
    expect(stateless).toContain("import { StarInput } from 'stardew-valley-ui'")
    expect(stateless).toContain("import { Search } from 'lucide-react'")
    expect(stateless).toContain('export function SearchFieldExample()')

    const authored = "import { useState } from 'react'\nimport { StarRating } from 'stardew-valley-ui'\n\nexport function RatingExample() {\n  const [rating] = useState(3)\n  return <StarRating value={rating} />\n}"
    const stateful = createCopyableDemoCode(authored, 'RatingExample')
    expect(stateful).toContain('// src/components/examples/RatingExample.tsx')
    expect(stateful).toContain("import 'stardew-valley-ui/style.css'")
    expect(stateful).toContain('export function RatingExample()')
  })

  it('hides copy-ready code by default and expands it when requested', () => {
    render(
      <I18nProvider>
        <StarComponentDemo title="Rating" code="<StarRating defaultValue={3} />">
          <span>Preview</span>
        </StarComponentDemo>
      </I18nProvider>,
    )

    const toggle = screen.getByRole('button', { name: '显示代码' })
    expect(toggle).toHaveAttribute('aria-expanded', 'false')
    expect(screen.queryByText('React 应用示例')).not.toBeInTheDocument()

    fireEvent.click(toggle)

    expect(toggle).toHaveAttribute('aria-expanded', 'true')
    expect(screen.getByText('React 应用示例')).toBeInTheDocument()
    expect(screen.getByText('// src/components/examples/RatingExample.tsx')).toBeInTheDocument()
    expect(screen.getByText((_, element) => element?.tagName === 'CODE' && element.textContent?.includes("import { StarRating } from 'stardew-valley-ui'") === true)).toBeInTheDocument()
  })

  it('renders live values when a demo declares managed data', () => {
    render(
      <I18nProvider>
        <StarComponentDemo title="Rating" data={[{ label: 'Friendship', value: '3 / 5' }]}>
          <span>Preview</span>
        </StarComponentDemo>
      </I18nProvider>,
    )

    expect(screen.getByText('示例数据')).toBeInTheDocument()
    expect(screen.getByText('Friendship')).toBeInTheDocument()
    expect(screen.getByText('3 / 5')).toHaveTextContent('3 / 5')
  })

  it('renders marked API names as semantic emphasis in a scenario caption', () => {
    render(
      <I18nProvider>
        <StarComponentDemo title="Dialog" description="Use **motion** when the key should make an entrance.">
          <span>Preview</span>
        </StarComponentDemo>
      </I18nProvider>,
    )

    expect(screen.getByText('motion').tagName).toBe('STRONG')
  })
})
