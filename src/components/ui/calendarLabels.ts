// Calendar 家族（Calendar / DatePicker / CalendarToolbar）共用的展示格式化。
// 单独成文件是因为两个组件和工具栏都要用它：放在组件文件里会触发
// react-refresh 的「只导出组件」规则。

export function formatMonthLabel(monthTimestamp: number) {
  return new Intl.DateTimeFormat('zh-CN', {
    year: 'numeric',
    month: 'long',
  }).format(new Date(monthTimestamp))
}

export function formatYearLabel(year: number) {
  return `${year}年`
}
