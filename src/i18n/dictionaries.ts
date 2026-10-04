export type Lang = 'zh' | 'en'

/**
 * Shared UI copy. Two families live here:
 *
 *   nav.* / guide.* / components.*  — documentation chrome
 *   ui.*                             — strings the *components themselves* show
 *
 * The `ui.*` family exists because `src/components/ui` had no access to the
 * language at all: Dialog's default footer read 确认/取消 in English, and its
 * pager buttons announced 上一页 to a screen reader in English. Components now
 * take an optional label prop per string and fall back to these keys, so the
 * library is bilingual out of the box without forcing consumers to pass labels.
 *
 * Every key here is reachable: `dictionaries.test.ts` fails on a key that is
 * unused, which is how the previous 22 dead keys accumulated and rotted.
 */
export const zhDict: Record<string, string> = {
  'nav.guide': '指南',
  'nav.components': '组件',
  'nav.api': 'API',
  'nav.backToTop': '回到顶部',
  'header.github': '查看 GitHub',
  'guide.install': '安装',
  'guide.installDesc': '把工具包放进背包，任选一种包管理器安装：',
  'guide.usage': '使用',
  'guide.usageDesc': '在你的项目里导入组件，就像从木箱里取出今天要用的工具：',
  'guide.config': '配置',
  'guide.configDesc': '如果使用 Vite，请确认 PostCSS 配置已经就绪：',
  'guide.selfUse.board': '开荒第一天的检查清单',
  'guide.selfUse.title': '自行使用',
  'guide.selfUse.lede':
    '把组件库放进背包，再从最常用的一把工具开始；下面这条路线适合在自己的 React 项目里慢慢搭一座小镇。',
  'guide.features': '特性',
  'guide.feature1': '基于 React 和 TypeScript 开发',
  'guide.feature2': '提供完整类型提示，写代码时不必翻找镇长档案',
  'guide.feature3': '支持像素风主题和季节化视觉',
  'guide.feature4': '覆盖按钮、卡片、日历、弹窗、反馈等基础场景',
  'guide.feature5': '适合文档站、活动页、小游戏周边界面和有风格诉求的产品',
  'components.title': '组件',
  'components.desc': '挑一块田开始试种：每个组件页都包含介绍、游戏化用例、代码示例和 API 参考。',
  'demo.showCode': '显示代码',
  'demo.hideCode': '隐藏代码',
  'demo.copyReady': 'React 应用示例',
  'demo.copyReadyHint': '已包含样式、导入与文件位置',
  'demo.liveData': '示例数据',
  'demo.liveDataHint': '随当前操作实时更新',
  'api.title': 'API',
  'api.property': '属性',
  'api.description': '说明',
  'api.type': '类型',
  'api.default': '默认值',
  'toc.title': '目录',
  'search.placeholder': '搜索组件...',
  'copy.success': '已复制',
  'copy.error': '复制失败',
  'copy.title': '点击复制',

  // ---- component-owned copy -------------------------------------------------
  'ui.dialog.confirm': '确认',
  'ui.dialog.cancel': '取消',
  'ui.dialog.prev': '上一页',
  'ui.dialog.next': '下一页',
  'ui.dialog.role': '角色',
  'ui.dialog.waiting': '等待标题完成...',
  'ui.dialog.drawer': '抽屉',
  'ui.drawer.close': '关闭抽屉',
  'ui.datePicker.today': '回到今日',
  'ui.datePicker.confirm': '确定',
  'ui.datePicker.cancel': '取消',
  'ui.datePicker.selectDate': '选择日期',
  'ui.datePicker.selectMonth': '选择年月',
  'ui.datePicker.prevMonth': '上个月',
  'ui.datePicker.nextMonth': '下个月',
  'ui.datePicker.prevYear': '上一年',
  'ui.datePicker.nextYear': '下一年',
  'ui.datePicker.prevYears': '上一个年份段',
  'ui.datePicker.nextYears': '下一个年份段',
  'ui.datePicker.yearSuffix': '年',
  'ui.datePicker.monthSuffix': '月',
  'ui.datePicker.daySuffix': '日',
  'ui.loading.default': '正在加载...',
  'ui.loading.loading': '加载中',
  'ui.loading.progress': '正在加载 {loaded} / {total} 项资源',
  'ui.loading.startup': '正在整理工具箱与农场素材…',
  'ui.loading.startupPhase': '晨间准备',
  'ui.loading.startupDone': '件素材已归位',
  'ui.emptyState.imageAlt': '暂无数据',
  'ui.emptyState.message': '没有更多数据了',
  'ui.pagination.label': '分页',
  'ui.pagination.pageSize': '每页条数',
  'ui.pagination.prev': '上一页',
  'ui.pagination.next': '下一页',
  'ui.pagination.page': '第 {{page}} 页',
}

export const enDict: Record<string, string> = {
  'nav.guide': 'Guide',
  'nav.components': 'Components',
  'nav.api': 'API',
  'nav.backToTop': 'Back to top',
  'header.github': 'GitHub',
  'guide.install': 'Installation',
  'guide.installDesc': 'Pack the toolkit with your preferred package manager:',
  'guide.usage': 'Usage',
  'guide.usageDesc': 'Import a component like pulling today’s tool from the chest:',
  'guide.config': 'Configuration',
  'guide.configDesc': 'If you use Vite, make sure PostCSS is configured correctly:',
  'guide.selfUse.board': 'Day one checklist',
  'guide.selfUse.title': 'Use it yourself',
  'guide.selfUse.lede':
    'Pack the component kit into your backpack and start with the tool you reach for most; the route below is for building a small town in your own React project, one piece at a time.',
  'guide.features': 'Features',
  'guide.feature1': 'Built with React and TypeScript',
  'guide.feature2': 'Typed APIs so you do not need to dig through the mayor’s archive',
  'guide.feature3': 'Pixel-art themes and seasonal visual variants',
  'guide.feature4': 'Covers buttons, cards, calendars, popups, feedback, and other core scenes',
  'guide.feature5': 'Useful for docs, campaign pages, game-adjacent UIs, and expressive products',
  'components.title': 'Components',
  'components.desc': 'Pick a plot to test: each component page includes intro copy, playful use cases, code examples, and API notes.',
  'demo.showCode': 'Show Code',
  'demo.hideCode': 'Hide Code',
  'demo.copyReady': 'React application example',
  'demo.copyReadyHint': 'Styles, imports, and file location included',
  'demo.liveData': 'Live demo data',
  'demo.liveDataHint': 'Updates with this demo',
  'api.title': 'API',
  'api.property': 'Property',
  'api.description': 'Description',
  'api.type': 'Type',
  'api.default': 'Default',
  'toc.title': 'Table of Contents',
  'search.placeholder': 'Search components...',
  'copy.success': 'Copied',
  'copy.error': 'Copy failed',
  'copy.title': 'Click to copy',

  // ---- component-owned copy -------------------------------------------------
  'ui.dialog.confirm': 'Confirm',
  'ui.dialog.cancel': 'Cancel',
  'ui.dialog.prev': 'Previous page',
  'ui.dialog.next': 'Next page',
  'ui.dialog.role': 'Character',
  'ui.dialog.waiting': 'Waiting for the title…',
  'ui.dialog.drawer': 'Drawer',
  'ui.drawer.close': 'Close drawer',
  'ui.datePicker.today': 'Back to today',
  'ui.datePicker.confirm': 'OK',
  'ui.datePicker.cancel': 'Cancel',
  'ui.datePicker.selectDate': 'Select a date',
  'ui.datePicker.selectMonth': 'Select month and year',
  'ui.datePicker.prevMonth': 'Previous month',
  'ui.datePicker.nextMonth': 'Next month',
  'ui.datePicker.prevYear': 'Previous year',
  'ui.datePicker.nextYear': 'Next year',
  'ui.datePicker.prevYears': 'Earlier years',
  'ui.datePicker.nextYears': 'Later years',
  // Intentionally empty: English does not suffix date parts the way Chinese
  // does. `dictionaries.test.ts` exempts these three keys specifically.
  'ui.datePicker.yearSuffix': '',
  'ui.datePicker.monthSuffix': '',
  'ui.datePicker.daySuffix': '',
  'ui.loading.default': 'Loading…',
  'ui.loading.loading': 'Loading',
  'ui.loading.progress': 'Loading {loaded} of {total} assets',
  'ui.loading.startup': 'Packing the toolbox and farm assets…',
  'ui.loading.startupPhase': 'Morning prep',
  'ui.loading.startupDone': 'assets in place',
  'ui.emptyState.imageAlt': 'No data',
  'ui.emptyState.message': 'Nothing here yet',
  'ui.pagination.label': 'Pagination',
  'ui.pagination.pageSize': 'Items per page',
  'ui.pagination.prev': 'Previous page',
  'ui.pagination.next': 'Next page',
  'ui.pagination.page': 'Page {{page}}',
}

export const dictionaries: Record<Lang, Record<string, string>> = {
  zh: zhDict,
  en: enDict,
}

// `{{name}}` rather than ICU `{name}`: the project has no runtime formatter
// dependency and four strings do not justify pulling one in.
export type CopyKey = keyof typeof zhDict & keyof typeof enDict

/**
 * Fill `{{token}}` placeholders in a dictionary string. Exported so components
 * can compose copy with runtime values (progress counts, item counts) without
 * pulling in an i18n library.
 *
 * Returns the template unchanged when the key is missing rather than throwing:
 * a component whose fallback label vanished should still render.
 */
export function interpolate(template: string, values?: Record<string, string | number>) {
  if (!values) return template

  return template.replace(/\{\{(\w+)\}\}/g, (match, token: string) =>
    token in values ? String(values[token]) : match,
  )
}