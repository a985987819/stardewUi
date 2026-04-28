import { createContext, useContext, useCallback, type ReactNode } from 'react'
import { useLocalStorage } from '../hooks/useLocalStorage'

export type Lang = 'zh' | 'en'

interface I18nContextValue {
  lang: Lang
  setLang: (lang: Lang) => void
  t: (key: string) => string
}

const I18nContext = createContext<I18nContextValue | null>(null)

export function useI18n() {
  const ctx = useContext(I18nContext)
  if (!ctx) {
    throw new Error('useI18n must be used within I18nProvider')
  }
  return ctx
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useLocalStorage<Lang>('star-ui-lang', 'zh')

  const t = useCallback(
    (key: string) => {
      const dict = dictionaries[lang]
      return dict[key] ?? key
    },
    [lang]
  )

  return (
    <I18nContext.Provider value={{ lang, setLang, t }}>
      {children}
    </I18nContext.Provider>
  )
}

const zhDict: Record<string, string> = {
  'nav.guide': '指南',
  'nav.components': '组件',
  'nav.api': 'API',
  'header.github': '查看 GitHub',
  'home.badge': '像素风 UI Kit',
  'home.desc':
    '一个受星露谷气质启发的像素风 UI 组件库。这里提供带有田园感、游戏感和复古界面氛围的组件与 demo，适合用来搭建更有个性的网页和交互页面。',
  'home.start': '开始浏览',
  'home.github': '查看 GitHub',
  'home.feature1.title': '像素风组件',
  'home.feature1.desc': '围绕按钮、卡片、日历、日期选择器、对话框等基础能力，逐步构建统一的像素风视觉语言。',
  'home.feature2.title': '可直接体验',
  'home.feature2.desc': '每个组件都配有独立演示页和示例内容，可以先看效果、再看用法，降低接入和试错成本。',
  'home.feature3.title': '有氛围的界面',
  'home.feature3.desc': '适合活动页、游戏感页面和需要风格表达的前端项目，让界面不只可用，也更有记忆点。',
  'guide.install': '安装',
  'guide.installDesc': '使用 npm、yarn 或 pnpm 安装组件库：',
  'guide.usage': '使用',
  'guide.usageDesc': '在你的项目中导入并使用组件：',
  'guide.config': '配置',
  'guide.configDesc': '如果你使用 Vite，请确保正确配置 PostCSS：',
  'guide.features': '特性',
  'guide.feature1': '基于 React 开发',
  'guide.feature2': '完整的 TypeScript 类型支持',
  'guide.feature3': '支持像素风主题定制',
  'guide.feature4': '提供多种可复用基础组件',
  'guide.feature5': '适合文档站和游戏风格界面',
  'components.title': 'Components',
  'components.desc': 'Browse the available UI demos and open each page for usage examples and a lightweight API reference.',
  'sidebar.guide': 'Guide / 指南',
  'sidebar.components': 'Components / 组件',
  'sidebar.button': 'Button / 按钮',
  'sidebar.calendar': 'Calendar / 日历',
  'sidebar.datePicker': 'DatePicker / 日期选择',
  'sidebar.starDatePicker': 'StarDatePicker / 星露谷日期',
  'sidebar.title': 'Title / 标题',
  'sidebar.card': 'Card / 卡片',
  'sidebar.dialog': 'Dialog / 对话框',
  'sidebar.popup': 'Popup / 弹窗',
  'sidebar.typewriter': 'Typewriter / 打字机',
  'sidebar.loading': 'Loading / 加载',
  'sidebar.message': 'Message / 消息',
  'sidebar.emptyState': 'EmptyState / 空状态',
  'demo.showCode': '显示代码',
  'demo.hideCode': '隐藏代码',
  'api.title': 'API',
  'api.property': '属性',
  'api.description': '说明',
  'api.type': '类型',
  'api.default': '默认值',
  'api.required': '必填',
  'lang.zh': '中文',
  'lang.en': 'English',
}

const enDict: Record<string, string> = {
  'nav.guide': 'Guide',
  'nav.components': 'Components',
  'nav.api': 'API',
  'header.github': 'GitHub',
  'home.badge': 'Pixel Art UI Kit',
  'home.desc':
    'A pixel-art UI component library inspired by the cozy vibe of Stardew Valley. It offers components and demos with a pastoral, game-like, and retro atmosphere—perfect for building memorable web pages and interactions.',
  'home.start': 'Get Started',
  'home.github': 'View on GitHub',
  'home.feature1.title': 'Pixel Art Components',
  'home.feature1.desc':
    'Build a unified pixel-art visual language around buttons, cards, calendars, date pickers, dialogs, and more.',
  'home.feature2.title': 'Ready to Try',
  'home.feature2.desc':
    'Every component has its own demo page with examples so you can see the effect first and then learn the usage.',
  'home.feature3.title': 'Atmospheric UI',
  'home.feature3.desc':
    'Great for event pages, game-style interfaces, and any project that needs a strong stylistic identity.',
  'guide.install': 'Installation',
  'guide.installDesc': 'Install the library via npm, yarn, or pnpm:',
  'guide.usage': 'Usage',
  'guide.usageDesc': 'Import and use components in your project:',
  'guide.config': 'Configuration',
  'guide.configDesc': 'If you use Vite, make sure PostCSS is configured correctly:',
  'guide.features': 'Features',
  'guide.feature1': 'Built with React',
  'guide.feature2': 'Full TypeScript support',
  'guide.feature3': 'Pixel-art theme customization',
  'guide.feature4': 'Multiple reusable base components',
  'guide.feature5': 'Ideal for docs and game-style UIs',
  'components.title': 'Components',
  'components.desc': 'Browse the available UI demos and open each page for usage examples and a lightweight API reference.',
  'sidebar.guide': 'Guide',
  'sidebar.components': 'Components',
  'sidebar.button': 'Button',
  'sidebar.calendar': 'Calendar',
  'sidebar.datePicker': 'DatePicker',
  'sidebar.starDatePicker': 'StarDatePicker',
  'sidebar.title': 'Title',
  'sidebar.card': 'Card',
  'sidebar.dialog': 'Dialog',
  'sidebar.popup': 'Popup',
  'sidebar.typewriter': 'Typewriter',
  'sidebar.loading': 'Loading',
  'sidebar.message': 'Message',
  'sidebar.emptyState': 'EmptyState',
  'demo.showCode': 'Show Code',
  'demo.hideCode': 'Hide Code',
  'api.title': 'API',
  'api.property': 'Property',
  'api.description': 'Description',
  'api.type': 'Type',
  'api.default': 'Default',
  'api.required': 'Required',
  'lang.zh': '中文',
  'lang.en': 'English',
}

const dictionaries: Record<Lang, Record<string, string>> = {
  zh: zhDict,
  en: enDict,
}
