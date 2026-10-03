import { useEffect, useMemo, useRef, useState } from 'react'
import {
  buildCalendarCells,
  getMonthStartTimestamp,
  getTodayTimestamp,
  isDayInRange,
  isSameDay,
  normalizeToDayTimestamp,
  sortRangeTimestamps,
  type CalendarCell,
} from '../../utils/calendar'
import { classNames } from '../../utils/classNames'
import CalendarGrid from './CalendarGrid'
import CalendarToolbar from './CalendarToolbar'
import {
  formatMonthLabel,
  formatUnitSuffixes,
  toIntlLocale,
  type CalendarLocale,
} from './calendarLabels'
import WheelDatePickerPanel from './WheelDatePickerPanel'
import { useComponentCopy } from './useComponentCopy'
import styles from './DatePicker.module.scss'

type DatePickerMode = 'single' | 'range'

/**
 * 交互类型。
 *
 * - `calendar`：默认，日历形式（月历网格 + 工具栏）。
 * - `inline`：行内形式，触发器下方弹出年 / 月 / 日三列可无限滚动的轮盘，
 *   底部「确定 / 取消」；在面板里改的是草稿，确认之前不会回写上层。
 */
type DatePickerInteraction = 'calendar' | 'inline'

interface StarDatePickerRangeValue {
  startTimestamp: number | null
  endTimestamp: number | null
}

type StarDatePickerValue = number | StarDatePickerRangeValue

type StarDatePickerChangeValue =
  | { dateTimestamp: number }
  | { startTimestamp: number | null; endTimestamp: number | null }

export interface StarDatePickerProps {
  mode?: DatePickerMode
  /** 交互类型：`calendar` 为月历形式（默认），`inline` 为三列轮盘的行内形式。 */
  interaction?: DatePickerInteraction
  value?: StarDatePickerValue
  defaultValue?: StarDatePickerValue
  onChange?: (value: StarDatePickerChangeValue) => void
  minDate?: number
  maxDate?: number
  disabledDates?: number[]
  showOutsideDays?: boolean
  /** 「回到今日」按钮文案 */
  todayLabel?: string
  /** 是否显示「回到今日」按钮 */
  showToday?: boolean
  /** 计算「今日」所用的时区偏移（分钟），默认 480 即东八区 */
  todayOffsetMinutes?: number
  /** `inline` 形式下「确定」按钮的文案 */
  confirmLabel?: string
  /** `inline` 形式下「取消」按钮的文案 */
  cancelLabel?: string
  /** `inline` 形式下三列的无障碍名称，依次为年、月、日 */
  columnLabels?: [string, string, string]
  /**
   * BCP 47 locale for month names, the weekday header, and the inline trigger.
   * Defaults to the host app's language, then `zh-CN`.
   */
  locale?: CalendarLocale
  className?: string
}


function formatDayLabel(dayTimestamp: number) {
  const date = new Date(dayTimestamp)
  const year = date.getFullYear()
  const month = `${date.getMonth() + 1}`.padStart(2, '0')
  const day = `${date.getDate()}`.padStart(2, '0')

  return `${year}-${month}-${day}`
}

/** `inline` 触发器的三段文案：年、月、日各自成段，中间用 `/` 连接。 */
function splitDayLabel(dayTimestamp: number) {
  const date = new Date(dayTimestamp)

  return {
    year: `${date.getFullYear()}`,
    month: `${date.getMonth() + 1}`.padStart(2, '0'),
    day: `${date.getDate()}`.padStart(2, '0'),
  }
}

function normalizeRangeValue(value?: StarDatePickerValue): StarDatePickerRangeValue {
  if (value === undefined || typeof value === 'number') {
    return {
      startTimestamp: null,
      endTimestamp: null,
    }
  }

  return {
    startTimestamp:
      value.startTimestamp === null ? null : normalizeToDayTimestamp(value.startTimestamp),
    endTimestamp: value.endTimestamp === null ? null : normalizeToDayTimestamp(value.endTimestamp),
  }
}

function getInitialMonth(
  mode: DatePickerMode,
  value?: StarDatePickerValue,
  defaultValue?: StarDatePickerValue,
) {
  const source = value ?? defaultValue

  if (mode === 'single' && typeof source === 'number') {
    return getMonthStartTimestamp(source)
  }

  if (mode === 'range' && source && typeof source !== 'number') {
    if (source.startTimestamp !== null) {
      return getMonthStartTimestamp(source.startTimestamp)
    }

    if (source.endTimestamp !== null) {
      return getMonthStartTimestamp(source.endTimestamp)
    }
  }

  return getMonthStartTimestamp(Date.now())
}

function getMonthFromValue(mode: DatePickerMode, value?: StarDatePickerValue): number | null {
  if (mode === 'single' && typeof value === 'number') {
    return getMonthStartTimestamp(value)
  }

  if (mode === 'range' && value && typeof value !== 'number') {
    if (value.startTimestamp !== null) {
      return getMonthStartTimestamp(value.startTimestamp)
    }

    if (value.endTimestamp !== null) {
      return getMonthStartTimestamp(value.endTimestamp)
    }
  }

  return null
}

function getSingleSelectionValue(value?: StarDatePickerValue): number | null {
  if (typeof value === 'number') {
    return normalizeToDayTimestamp(value)
  }

  return null
}

/**
 * 计算 `inline` 面板显示哪一天。
 *
 * 轮盘面板遮住了整张月历，所以它单独持有一份「临时选择」：用户点开面板后，
 * 草稿只在面板内部流动，只有点「确定」才把值提到这里、再往外抛 `onChange`；
 * 点「取消」什么都不变。`calendar` 形式不需要这层，因为点一下日期就已经是一次
 * 完整的提交。
 */
function getInlineCommittedValue(
  interaction: DatePickerInteraction,
  isControlled: boolean,
  value?: StarDatePickerValue,
  defaultValue?: StarDatePickerValue,
): number | null {
  if (interaction !== 'inline') {
    return null
  }

  return getSingleSelectionValue(isControlled ? value : defaultValue)
}

function DatePicker({
  mode = 'single',
  interaction = 'calendar',
  value,
  defaultValue,
  onChange,
  minDate,
  maxDate,
  disabledDates = [],
  showOutsideDays = true,
  todayLabel,
  showToday = true,
  todayOffsetMinutes,
  confirmLabel,
  cancelLabel,
  columnLabels,
  locale,
  className,
}: StarDatePickerProps) {
  // Explicit prop, then the host app's language, then the historical `zh-CN`.
  const copy = useComponentCopy()
  const resolvedLocale = locale ?? toIntlLocale(copy.lang)
  const unitSuffixes = formatUnitSuffixes(resolvedLocale)
  const resolvedTodayLabel = todayLabel ?? copy.t('ui.datePicker.today')
  const resolvedConfirmLabel = confirmLabel ?? copy.t('ui.datePicker.confirm')
  const resolvedCancelLabel = cancelLabel ?? copy.t('ui.datePicker.cancel')
  const resolvedColumnLabels: [string, string, string] = columnLabels ?? [
    unitSuffixes.year || copy.t('ui.datePicker.yearSuffix'),
    unitSuffixes.month || copy.t('ui.datePicker.monthSuffix'),
    unitSuffixes.day || copy.t('ui.datePicker.daySuffix'),
  ]

  const isControlled = value !== undefined
  const [internalMonth, setInternalMonth] = useState(() =>
    getInitialMonth(mode, value, defaultValue),
  )
  const [internalSingleValue, setInternalSingleValue] = useState<number | null>(() => {
    if (mode !== 'single') {
      return null
    }

    if (typeof value === 'number') {
      return normalizeToDayTimestamp(value)
    }

    if (typeof defaultValue === 'number') {
      return normalizeToDayTimestamp(defaultValue)
    }

    return null
  })
  const [internalRangeValue, setInternalRangeValue] = useState<StarDatePickerRangeValue>(() => {
    if (mode !== 'range') {
      return {
        startTimestamp: null,
        endTimestamp: null,
      }
    }

    return normalizeRangeValue(value ?? defaultValue)
  })
  // `inline` 的临时选择。`inlineDraftOwner` 记住「这份草稿是从哪个外部值派生
  // 出来的」，外部值一变（父组件在 onChange 里改了 value）就自动作废，避免
  // 出现「确定完了但轮盘还停在旧日期」。
  const [inlineDraft, setInlineDraft] = useState<number | null>(null)
  const [inlineDraftOwner, setInlineDraftOwner] = useState<number | null>(null)
  const [isInlineOpen, setIsInlineOpen] = useState(false)
  const lastControlledMonthRef = useRef<number | null>(getMonthFromValue(mode, value))
  const previousModeRef = useRef<DatePickerMode>(mode)
  const previousControlledRef = useRef(isControlled)
  const lastControlledSingleValueRef = useRef<number | null>(getSingleSelectionValue(value))
  const lastControlledRangeValueRef = useRef<StarDatePickerRangeValue>(normalizeRangeValue(value))

  const selectedSingleValue =
    mode === 'single'
      ? typeof value === 'number'
        ? normalizeToDayTimestamp(value)
        : internalSingleValue
      : null
  const selectedRangeValue =
    mode === 'range'
      ? normalizeRangeValue(isControlled ? value : internalRangeValue)
      : {
          startTimestamp: null,
          endTimestamp: null,
        }

  const monthTimestamp = internalMonth
  // 与 Calendar 同一口径：今日按东八区计算，默认偏移 480 分钟。
  const todayTimestamp = getTodayTimestamp(todayOffsetMinutes)

  // `inline` 面板显示的日期：受控时跟着外部值走，非受控时是「上次确认过的值」。
  // 这里不读 `internalSingleValue`，因为草稿和已确认值必须分开记账。
  const inlineCommittedValue = getInlineCommittedValue(
    interaction,
    isControlled,
    value,
    defaultValue,
  )

  // 外部值变了 → 草稿作废（受控场景下父组件可能直接换了值）。
  if (
    interaction === 'inline' &&
    inlineDraft !== null &&
    inlineDraftOwner !== inlineCommittedValue
  ) {
    setInlineDraft(null)
    setInlineDraftOwner(null)
  }

  const inlineVisibleValue =
    interaction === 'inline' && isInlineOpen
      ? (inlineDraft ?? inlineCommittedValue)
      : inlineCommittedValue

  useEffect(() => {
    if (!isControlled) {
      lastControlledMonthRef.current = null
      return
    }

    const nextControlledMonth = getMonthFromValue(mode, value)

    if (
      nextControlledMonth !== null &&
      nextControlledMonth !== lastControlledMonthRef.current
    ) {
      setInternalMonth(nextControlledMonth)
    }

    lastControlledMonthRef.current = nextControlledMonth
  }, [isControlled, mode, value])

  useEffect(() => {
    if (!isControlled) {
      return
    }

    lastControlledSingleValueRef.current = getSingleSelectionValue(value)
    lastControlledRangeValueRef.current = normalizeRangeValue(value)
  }, [isControlled, value])

  useEffect(() => {
    const modeChanged = previousModeRef.current !== mode
    const controlChanged = previousControlledRef.current !== isControlled

    if (!modeChanged && !controlChanged) {
      return
    }

    previousModeRef.current = mode
    previousControlledRef.current = isControlled

    if (mode === 'single') {
      const nextSingleValue = isControlled
        ? getSingleSelectionValue(value)
        : defaultValue !== undefined
          ? getSingleSelectionValue(defaultValue)
          : controlChanged
            ? lastControlledSingleValueRef.current
            : getSingleSelectionValue(defaultValue)

      setInternalSingleValue(nextSingleValue)
      setInternalRangeValue({
        startTimestamp: null,
        endTimestamp: null,
      })
      return
    }

    const nextRangeValue = isControlled
      ? normalizeRangeValue(value)
      : defaultValue !== undefined
        ? normalizeRangeValue(defaultValue)
        : controlChanged
          ? lastControlledRangeValueRef.current
          : normalizeRangeValue(defaultValue)

    setInternalRangeValue(nextRangeValue)
    setInternalSingleValue(null)
  }, [defaultValue, isControlled, mode, value])

  const cells = useMemo(
    () => buildCalendarCells(monthTimestamp, todayTimestamp),
    [monthTimestamp, todayTimestamp],
  )
  const normalizedMinDate = minDate === undefined ? undefined : normalizeToDayTimestamp(minDate)
  const normalizedMaxDate = maxDate === undefined ? undefined : normalizeToDayTimestamp(maxDate)
  const disabledDateSet = useMemo(
    () => new Set(disabledDates.map((dayTimestamp) => normalizeToDayTimestamp(dayTimestamp))),
    [disabledDates],
  )

  const isDisabled = (dayTimestamp: number) => {
    if (normalizedMinDate !== undefined && dayTimestamp < normalizedMinDate) {
      return true
    }

    if (normalizedMaxDate !== undefined && dayTimestamp > normalizedMaxDate) {
      return true
    }

    return disabledDateSet.has(dayTimestamp)
  }

  const updateMonthForDay = (dayTimestamp: number) => {
    setInternalMonth(getMonthStartTimestamp(dayTimestamp))
  }

  const handleSelectDay = (dayTimestamp: number) => {
    if (isDisabled(dayTimestamp)) {
      return
    }

    const normalizedDay = normalizeToDayTimestamp(dayTimestamp)
    updateMonthForDay(normalizedDay)

    if (mode === 'single') {
      if (!isControlled) {
        setInternalSingleValue(normalizedDay)
      }

      onChange?.({ dateTimestamp: normalizedDay })
      return
    }

    const { startTimestamp, endTimestamp } = selectedRangeValue

    if (startTimestamp === null || endTimestamp !== null) {
      const nextValue = {
        startTimestamp: normalizedDay,
        endTimestamp: null,
      }

      if (!isControlled) {
        setInternalRangeValue(nextValue)
      }

      onChange?.(nextValue)
      return
    }

    const [sortedStart, sortedEnd] = sortRangeTimestamps(startTimestamp, normalizedDay)
    const nextValue = {
      startTimestamp: sortedStart,
      endTimestamp: sortedEnd,
    }

    if (!isControlled) {
      setInternalRangeValue(nextValue)
    }

    onChange?.(nextValue)
  }

  const changeMonth = (nextMonth: number) => {
    setInternalMonth(nextMonth)
  }

  // ------------------------------------------------------------ inline 形式

  const closeInline = () => {
    setIsInlineOpen(false)
    setInlineDraft(null)
    setInlineDraftOwner(null)
  }

  const handleInlineDraftChange = (nextDay: number) => {
    setInlineDraft(nextDay)
    // 记住这份草稿的来源值：外部值一变，上面那段「草稿作废」就会兜住它。
    setInlineDraftOwner(inlineCommittedValue)
  }
  const handleInlineConfirm = (dayTimestamp: number) => {
    const normalizedDay = normalizeToDayTimestamp(dayTimestamp)

    if (mode === 'single') {
      if (!isControlled) {
        setInternalSingleValue(normalizedDay)
      }

      onChange?.({ dateTimestamp: normalizedDay })
    } else {
      // 范围模式没有「点两下完成」的过程，行内形式的确认按「起点」处理，
      // 让用户可以接着在月历上补终点。
      const nextValue = {
        startTimestamp: normalizedDay,
        endTimestamp: null,
      }

      if (!isControlled) {
        setInternalRangeValue(nextValue)
      }

      onChange?.(nextValue)
    }

    // 视图跟着选中值走，关掉面板后月历就停在刚确认的那个月。
    updateMonthForDay(normalizedDay)
    closeInline()
  }

  const getCellStateClassName = (cell: CalendarCell) => {
    if (mode === 'single') {
      return selectedSingleValue !== null && isSameDay(cell.dateTimestamp, selectedSingleValue)
        ? styles['date-picker__cell--selected']
        : undefined
    }

    const { startTimestamp, endTimestamp } = selectedRangeValue
    const isRangeStart =
      startTimestamp !== null && isSameDay(cell.dateTimestamp, startTimestamp)
    const isRangeEnd = endTimestamp !== null && isSameDay(cell.dateTimestamp, endTimestamp)
    const inRange =
      startTimestamp !== null && isDayInRange(cell.dateTimestamp, startTimestamp, endTimestamp ?? startTimestamp)

    return classNames(
      isRangeStart && styles['date-picker__cell--range-start'],
      isRangeEnd && styles['date-picker__cell--range-end'],
      inRange && styles['date-picker__cell--in-range'],
    )
  }

  const getCellButtonProps = (cell: CalendarCell) => {
    if (mode === 'single') {
      const isSelected =
        selectedSingleValue !== null && isSameDay(cell.dateTimestamp, selectedSingleValue)

      return {
        'aria-label': formatDayLabel(cell.dateTimestamp),
        'data-selected': isSelected ? 'true' : undefined,
      }
    }

    const { startTimestamp, endTimestamp } = selectedRangeValue
    const isRangeStart =
      startTimestamp !== null && isSameDay(cell.dateTimestamp, startTimestamp)
    const isRangeEnd = endTimestamp !== null && isSameDay(cell.dateTimestamp, endTimestamp)
    const inRange =
      startTimestamp !== null && isDayInRange(cell.dateTimestamp, startTimestamp, endTimestamp ?? startTimestamp)

    return {
      'aria-label': formatDayLabel(cell.dateTimestamp),
      'data-selected': isRangeStart || isRangeEnd ? 'true' : undefined,
      'data-range-position': isRangeStart ? 'start' : isRangeEnd ? 'end' : undefined,
      'data-in-range': inRange ? 'true' : undefined,
    }
  }

  const inlineDisabledDateSet = useMemo(
    () => new Set(disabledDates.map((dayTimestamp) => normalizeToDayTimestamp(dayTimestamp))),
    [disabledDates],
  )

  const inlineLabelSource = inlineVisibleValue ?? todayTimestamp
  const inlineLabel = splitDayLabel(inlineLabelSource)

  if (interaction === 'inline') {
    return (
      <section className={classNames(styles['date-picker-inline-wrap'], className)}>
        <button
          type="button"
          className={styles['date-picker-inline__trigger']}
          aria-haspopup="dialog"
          aria-expanded={isInlineOpen}
          data-open={isInlineOpen ? 'true' : undefined}
          onClick={() => {
            if (isInlineOpen) {
              closeInline()
              return
            }

            setIsInlineOpen(true)
          }}
        >
          {(['year', 'month', 'day'] as const).map((segment) => (
            <span key={segment} className={styles['date-picker-inline__trigger-part']}>
              {inlineLabel[segment]}
            </span>
          ))}
        </button>

        {isInlineOpen ? (
          <WheelDatePickerPanel
            value={inlineVisibleValue}
            todayTimestamp={todayTimestamp}
            minDate={normalizedMinDate}
            maxDate={normalizedMaxDate}
            disabledDates={inlineDisabledDateSet}
            confirmLabel={resolvedConfirmLabel}
            cancelLabel={resolvedCancelLabel}
            columnLabels={resolvedColumnLabels}
            onDraftChange={handleInlineDraftChange}
            onConfirm={handleInlineConfirm}
            onCancel={closeInline}
          />
        ) : null}
      </section>
    )
  }

  return (
    <section className={classNames(styles['date-picker'], className)}>
      <CalendarToolbar
        monthTimestamp={monthTimestamp}
        todayTimestamp={todayTimestamp}
        todayLabel={resolvedTodayLabel}
        showToday={showToday}
        locale={resolvedLocale}
        onSelectMonth={changeMonth}
      />

      <CalendarGrid
        monthLabel={formatMonthLabel(monthTimestamp, resolvedLocale)}
        cells={cells}
        showOutsideDays={showOutsideDays}
        locale={resolvedLocale}
        onSelectDay={handleSelectDay}
        isDisabled={isDisabled}
        getCellStateClassName={getCellStateClassName}
        getCellButtonProps={getCellButtonProps}
      />
    </section>
  )
}

export default DatePicker
