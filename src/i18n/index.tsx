import { createContext, useCallback, useContext, type ReactNode } from 'react'
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

  return <I18nContext.Provider value={{ lang, setLang, t }}>{children}</I18nContext.Provider>
}

const zhDict: Record<string, string> = {
  'nav.guide': '指南',
  'nav.components': '组件',
  'nav.api': 'API',
  'header.github': '查看 GitHub',
  'home.badge': '像素农场 UI Kit',
  'home.desc':
    '一套带着星露谷泥土香气的 React 组件库。按钮像工具箱里的铜锤，卡片像镇长公告栏，日历会提醒你别错过花舞节。',
  'home.start': '开始逛农场',
  'home.github': '查看 GitHub',
  'home.feature1.title': '把组件种进田里',
  'home.feature1.desc': '按钮、卡片、日历、弹窗和消息组件都带着像素边框，适合搭建有游戏感的活动页、文档站和互动界面。',
  'home.feature2.title': '先试玩，再接入',
  'home.feature2.desc': '每个组件都有演示田块、用例说明和 API 表格，像翻农场手册一样快速找到合适的用法。',
  'home.feature3.title': '界面也能有季节',
  'home.feature3.desc': '春天播种、夏天冒险、秋天收获、冬天整理背包，让普通 UI 也有明确的情绪和记忆点。',
  'guide.install': '安装',
  'guide.installDesc': '把工具包放进背包，任选一种包管理器安装：',
  'guide.usage': '使用',
  'guide.usageDesc': '在你的项目里导入组件，就像从木箱里取出今天要用的工具：',
  'guide.config': '配置',
  'guide.configDesc': '如果使用 Vite，请确认 PostCSS 配置已经就绪：',
  'guide.features': '特性',
  'guide.feature1': '基于 React 和 TypeScript 开发',
  'guide.feature2': '提供完整类型提示，写代码时不必翻找镇长档案',
  'guide.feature3': '支持像素风主题和季节化视觉',
  'guide.feature4': '覆盖按钮、卡片、日历、弹窗、反馈等基础场景',
  'guide.feature5': '适合文档站、活动页、小游戏周边界面和有风格诉求的产品',
  'components.title': '组件',
  'components.desc': '挑一块田开始试种：每个组件页都包含介绍、游戏化用例、代码示例和 API 参考。',
  'sidebar.guide': '指南',
  'sidebar.components': '组件',
  'sidebar.button': '按钮',
  'sidebar.calendar': '日历',
  'sidebar.datePicker': '日期选择',
  'sidebar.title': '标题',
  'sidebar.card': '卡片',
  'sidebar.dialog': '对话框',
  'sidebar.popup': '弹窗',
  'sidebar.typewriter': '打字机',
  'sidebar.loading': '加载',
  'sidebar.message': '消息',
  'sidebar.emptyState': '空状态',
  'sidebar.tab': '选项卡',
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
  'toc.title': '目录',
  'search.placeholder': '搜索组件...',
  'copy.success': '已复制',
  'copy.error': '复制失败',
  'copy.title': '点击复制',
}

const enDict: Record<string, string> = {
  'nav.guide': 'Guide',
  'nav.components': 'Components',
  'nav.api': 'API',
  'header.github': 'GitHub',
  'home.badge': 'Pixel Farm UI Kit',
  'home.desc':
    'A React component kit with Stardew-like soil under its boots. Buttons feel like copper tools, cards like town notices, and calendars remind players not to miss the Flower Dance.',
  'home.start': 'Enter the Farm',
  'home.github': 'View on GitHub',
  'home.feature1.title': 'Plant Components Like Crops',
  'home.feature1.desc':
    'Buttons, cards, calendars, popups, and feedback components carry pixel borders for event pages, docs, and playful interfaces.',
  'home.feature2.title': 'Try Before You Ship',
  'home.feature2.desc':
    'Every page includes a demo plot, use-case notes, code samples, and API tables so you can pick the right tool fast.',
  'home.feature3.title': 'Seasonal Interface Mood',
  'home.feature3.desc':
    'Spring planting, summer quests, autumn harvests, and winter inventory checks give everyday UI a stronger personality.',
  'guide.install': 'Installation',
  'guide.installDesc': 'Pack the toolkit with your preferred package manager:',
  'guide.usage': 'Usage',
  'guide.usageDesc': 'Import a component like pulling today’s tool from the chest:',
  'guide.config': 'Configuration',
  'guide.configDesc': 'If you use Vite, make sure PostCSS is configured correctly:',
  'guide.features': 'Features',
  'guide.feature1': 'Built with React and TypeScript',
  'guide.feature2': 'Typed APIs so you do not need to dig through the mayor’s archive',
  'guide.feature3': 'Pixel-art themes and seasonal visual variants',
  'guide.feature4': 'Covers buttons, cards, calendars, popups, feedback, and other core scenes',
  'guide.feature5': 'Useful for docs, campaign pages, game-adjacent UIs, and expressive products',
  'components.title': 'Components',
  'components.desc': 'Pick a plot to test: each component page includes intro copy, playful use cases, code examples, and API notes.',
  'sidebar.guide': 'Guide',
  'sidebar.components': 'Components',
  'sidebar.button': 'Button',
  'sidebar.calendar': 'Calendar',
  'sidebar.datePicker': 'DatePicker',
  'sidebar.title': 'Title',
  'sidebar.card': 'Card',
  'sidebar.dialog': 'Dialog',
  'sidebar.popup': 'Popup',
  'sidebar.typewriter': 'Typewriter',
  'sidebar.loading': 'Loading',
  'sidebar.message': 'Message',
  'sidebar.emptyState': 'EmptyState',
  'sidebar.tab': 'Tab',
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
  'toc.title': 'Table of Contents',
  'search.placeholder': 'Search components...',
  'copy.success': 'Copied',
  'copy.error': 'Copy failed',
  'copy.title': 'Click to copy',
}

const dictionaries: Record<Lang, Record<string, string>> = {
  zh: zhDict,
  en: enDict,
}
