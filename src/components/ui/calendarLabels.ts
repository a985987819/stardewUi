// Calendar 家族（Calendar / DatePicker / CalendarToolbar / WheelDatePickerPanel）
// 共用的展示格式化。单独成文件是因为四个组件都要用它：放在组件文件里会触发
// react-refresh 的「只导出组件」规则。
//
// 每个函数都接受一个可选 locale。默认值是 `zh-CN` 而不是宿主语言，因为这些函数
// 也被用作文档站之外的纯工具导出；组件层负责传入当前语言，工具层保持确定性。

export type CalendarLocale = string

export const DEFAULT_CALENDAR_LOCALE: CalendarLocale = 'zh-CN'

/**
 * Month-and-year heading, e.g. `2026年3月` in Chinese and `March 2026` in
 * English. `Intl` handles both the ordering and the suffix, so there is no
 * hand-built `${year}年` string to go wrong under an English locale.
 */
export function formatMonthLabel(monthTimestamp: number, locale: CalendarLocale = DEFAULT_CALENDAR_LOCALE) {
  return new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: 'long',
  }).format(new Date(monthTimestamp))
}

/**
 * Bare year. Chinese needs the `年` suffix; English must not have it, so this
 * goes through `Intl` with `year: 'numeric'` instead of concatenating.
 */
export function formatYearLabel(year: number, locale: CalendarLocale = DEFAULT_CALENDAR_LOCALE) {
  return new Intl.DateTimeFormat(locale, {
    year: 'numeric',
  }).format(new Date(year, 0, 1))
}

/**
 * Full accessible label for a month cell in the quick-jump grid, e.g.
 * `2024年9月` in Chinese and `September 2024` in English.
 *
 * Built from `Intl` rather than by concatenating a year label with a month
 * label: the two languages order those parts differently, and joining them with
 * a space produced `2024年 9月` under Chinese — technically readable, but a
 * screen reader would pause on the stray space.
 */
export function formatMonthButtonLabel(
  year: number,
  monthIndex: number,
  locale: CalendarLocale = DEFAULT_CALENDAR_LOCALE,
) {
  return new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: 'long',
  }).format(new Date(year, monthIndex, 1))
}

/**
 * Month cell labels for the quick-jump grid, longest-first ordering preserved.
 *
 * `Intl` returns `1月` in Chinese but `Jan` in English — note that the English
 * form is an abbreviation, which is correct for a 3×4 grid where twelve full
 * month names would not fit. The array is built at call time rather than
 * hardcoded so a locale change actually takes effect.
 */
export function formatMonthLabels(locale: CalendarLocale = DEFAULT_CALENDAR_LOCALE) {
  const formatter = new Intl.DateTimeFormat(locale, { month: 'short' })

  return Array.from({ length: 12 }, (_unused, index) => formatter.format(new Date(2024, index, 1)))
}

/**
 * Weekday header initials, Monday-first to match `CalendarDayOfWeek`.
 *
 * The `narrow` form is deliberate: `Intl` in English gives `Mon`, `Tue`, … which
 * are too wide for seven columns on a phone, while `M` fits. Chinese is
 * already one character in every form.
 */
export function formatWeekdayLabels(locale: CalendarLocale = DEFAULT_CALENDAR_LOCALE) {
  // 2024-01-01 was a Monday, so adding days from here lands Mon-first without a
  // second offset table.
  const monday = new Date(2024, 0, 1)
  const formatter = new Intl.DateTimeFormat(locale, { weekday: 'narrow' })

  return Array.from({ length: 7 }, (_unused, index) => {
    const day = new Date(monday)
    day.setDate(monday.getDate() + index)
    return formatter.format(day)
  })
}

/**
 * Year/month/day suffixes for the inline picker's three wheels.
 *
 * Chinese attaches the unit directly (`2026年3月5日`); English uses ordinals or
 * separators instead, so the suffixes are empty strings rather than a space —
 * appending an empty suffix is what makes the English wheels read correctly
 * without a second code path in the component.
 */
export function formatUnitSuffixes(locale: CalendarLocale = DEFAULT_CALENDAR_LOCALE): {
  year: string
  month: string
  day: string
} {
  // `zh` is the only locale in the supported set that needs CJK unit markers.
  const needsUnits = locale.toLowerCase().startsWith('zh')

  return {
    year: needsUnits ? '年' : '',
    month: needsUnits ? '月' : '',
    day: needsUnits ? '日' : '',
  }
}

/** BCP 47 tag for a UI language key. */
export function toIntlLocale(lang: string): CalendarLocale {
  if (lang === 'en') return 'en-US'
  if (lang === 'zh') return 'zh-CN'
  return lang
}