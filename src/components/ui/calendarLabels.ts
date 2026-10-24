// Calendar 家族（Calendar / DatePicker / CalendarToolbar）共用的展示格式化。
// 单独成文件是因为两个组件和工具栏都要用它：放在组件文件里会触发
// react-refresh 的「只导出组件」规则。
//
// 所有格式化都接受 BCP-47 `locale`（组件统一默认 `'zh-CN'`，保持历史行为），
// 由 Intl 负责具体文案：zh-CN 得到「2024年1月 / 1月 / 一」，en-US 得到
// "January 2024 / Jan / Mon"。

export function formatMonthLabel(locale: string, monthTimestamp: number) {
  return new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: 'long',
  }).format(new Date(monthTimestamp))
}

export function formatYearLabel(locale: string, year: number) {
  return new Intl.DateTimeFormat(locale, { year: 'numeric' }).format(new Date(year, 0, 1))
}

/** 月视图下拉里的短月名：zh-CN「1月」，en-US「Jan」。 */
export function formatMonthShortLabel(locale: string, monthIndex: number) {
  return new Intl.DateTimeFormat(locale, { month: 'short' }).format(new Date(2024, monthIndex, 1))
}

/**
 * 表头星期标签，周一起始。zh 用「窄」写法得到单字「一…日」，
 * 其他语言用「短」写法（en-US: Mon…Sun）——英文的窄写法会出现重名字母。
 */
export function formatWeekdayLabels(locale: string): string[] {
  const style = locale.toLowerCase().startsWith('zh') ? 'narrow' : 'short'
  // 2024-01-01 恰好是周一，从这里连取七天即得周一起始的顺序。
  return Array.from({ length: 7 }, (_, index) =>
    new Intl.DateTimeFormat(locale, { weekday: style }).format(new Date(2024, 0, 1 + index))
  )
}
