import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent,
  type PointerEvent,
  type UIEvent,
} from 'react'
import { classNames } from '../../utils/classNames'
import {
  fromWheelOffset,
  getWheelStride,
  getWheelWindowSize,
  toWheelOffset,
} from '../../utils/wheel'
import styles from './WheelPicker.module.scss'

const DRAG_THRESHOLD_PX = 4
/** 一次点击按钮之后、重新吸附之前的静默期，避免双击把两段动画叠在一起。 */
const SETTLE_DEBOUNCE_MS = 180

export interface WheelColumnProps {
  /** 自下而上的候选值。年月日都用递增值，最上方即最大值（年份从新到旧）。 */
  values: readonly number[]
  value: number
  onChange: (value: number) => void
  /** 值的展示文案；缺省直接用数字。 */
  format?: (value: number) => string
  /** 是否无限循环。月份与日期为真，年份为假。 */
  loop?: boolean
  /** 可见行数，取奇数（偶数会自动 +1，保证选中行两侧对称）。 */
  visibleCount?: number
  /** 行高，必须与 SCSS 里的 `--date-picker-wheel-row` 一致。 */
  rowHeight?: number
  /** 补位值：真实值不在候选列表里时（例如 2 月 30 日）用它定位轮盘。 */
  fallbackValue?: number
  disabled?: boolean
  /** 无障碍名称，例如「年」「月」「日」。 */
  ariaLabel?: string
  className?: string
}

/**
 * 一整列「无限滚动」的轮盘。
 *
 * 实现要点：DOM 里始终只有一个长度为 `stride` 的接收器（选中项置于其正中），
 * 行的内容按当前偏移对候选列表取模生成 —— 所以 31 号之后确实是 1、2、3，
 * 而不是靠多塞几圈元素假装出来的。滚动条位置用内联的上下内边距撑出来
 * （各留 `stride - 1` 行），这样滚轮、拖拽、键盘都走浏览器自己的滚动模型，
 * 不用手写惯性。
 */
function WheelColumn({
  values,
  value,
  onChange,
  format,
  loop = false,
  visibleCount = 5,
  rowHeight = 36,
  fallbackValue,
  disabled = false,
  ariaLabel,
  className,
}: WheelColumnProps) {
  const windowSize = getWheelWindowSize(visibleCount)
  const stride = getWheelStride(visibleCount)
  const half = (windowSize - 1) / 2
  const count = values.length

  const scrollerRef = useRef<HTMLDivElement>(null)
  const isDraggingRef = useRef(false)
  const dragStartRef = useRef({ x: 0, y: 0, scrollTop: 0, pointerId: -1, moved: false })
  const settleTimerRef = useRef<number | null>(null)
  /**
   * 用户当前停在哪一行（渲染坐标）。
   *
   * 只有「滚到非整数行、正在吸附」的那一瞬间它才会和 `targetOffset` 分叉：
   * 其余时刻它都是 `targetOffset` 的镜像。存成 state 是为了让窗口内容跟着
   * 用户的滚动重排（循环列要靠它决定每一行显示哪一项）。
   */
  const [scrollOffset, setScrollOffset] = useState(() =>
    toWheelOffset(loop, 0, Math.max(values.indexOf(value), 0), count),
  )
  /**
   * 已经对齐过的外部坐标。
   *
   * 外部选中值变了（受控值、或切换年月导致天数变化）就把位置同步过去。这一步
   * 放在渲染期间而不是 effect 里：effect 会先提交一帧旧位置再跳过去，而位置
   * 本身只是 `targetOffset` 的镜像，没有需要等待的外部系统。
   */
  const [syncedTargetOffset, setSyncedTargetOffset] = useState(scrollOffset)

  const targetIndex = useMemo(
    () => Math.max(values.indexOf(value), 0),
    [value, values],
  )

  const scrollToOffset = useCallback(
    (nextOffset: number) => {
      const scroller = scrollerRef.current

      if (!scroller) {
        return
      }

      // 直接写 `scrollTop` 而不是 `scrollTo({ behavior: 'smooth' })`：后者在部分
      // 环境（jsdom、老 WebView）里不存在，一旦抛错整条滚动路径就断了；
      // 而 `scroll-behavior: smooth` 由样式表声明，两种写法都会走到同一段动画。
      scroller.scrollTop = nextOffset * rowHeight
    },
    [rowHeight],
  )

  // 补位：真实值不在候选里（2 月 30 日）时，轮盘先落到最近的合法项上，
  // 但不动上层状态 —— 上层仍然是「未定」，等用户真的滚动了才回写。
  const hasFallback = fallbackValue !== undefined && values.indexOf(fallbackValue) >= 0
  const fallbackIndex = hasFallback ? values.indexOf(fallbackValue) : targetIndex
  const isFallingBack = count > 0 && values.indexOf(value) < 0 && hasFallback

  // 选中项对应的渲染坐标。用户滚动期间它会短暂和 `scrollOffset` 分叉，
  // 吸附（或一次 ±1 / 点击）之后两者重新对齐。
  const targetOffset = useMemo(
    () =>
      toWheelOffset(
        loop,
        0,
        isFallingBack ? fallbackIndex : targetIndex,
        count,
      ),
    [count, fallbackIndex, isFallingBack, loop, targetIndex],
  )

  // 外部选中值变了（外部受控值、或切换年月导致天数变化）→ 位置跟上它。
  // 渲染期间调整 state，React 会立刻用新值重跑这一次渲染，不会闪一帧旧位置。
  if (syncedTargetOffset !== targetOffset) {
    setSyncedTargetOffset(targetOffset)
    setScrollOffset(targetOffset)
  }

  const baseOffset = scrollOffset - half

  // 位置变了要真的滚过去 —— `scrollTop` 是外部系统，只能放在 effect 里。
  // `useLayoutEffect` 保证在浏览器绘制前摆好，看不到中间那一帧。
  useLayoutEffect(() => {
    scrollToOffset(scrollOffset)
  }, [scrollOffset, scrollToOffset])

  useEffect(
    () => () => {
      if (settleTimerRef.current !== null) {
        window.clearTimeout(settleTimerRef.current)
      }
    },
    [],
  )

  const clearSettleTimer = () => {
    if (settleTimerRef.current !== null) {
      window.clearTimeout(settleTimerRef.current)
      settleTimerRef.current = null
    }
  }

  const commitOffset = (nextOffset: number) => {
    setScrollOffset(nextOffset)

    // 循环列的渲染坐标是一路增长的，要还原成「第几项」才能取到值。
    const itemIndex = loop ? fromWheelOffset(true, nextOffset, count).itemIndex : nextOffset
    const nextValue = values[itemIndex]

    if (nextValue !== undefined && nextValue !== value) {
      onChange(nextValue)
    }
  }

  const settleToNearest = () => {
    const scroller = scrollerRef.current

    if (!scroller) {
      return
    }

    const rawOffset = rowHeight > 0 ? scroller.scrollTop / rowHeight : 0
    const snapped = Math.round(rawOffset)

    if (scroller.scrollTop !== snapped * rowHeight) {
      scrollToOffset(snapped)
    }

    commitOffset(snapped)
  }

  const scheduleSettle = () => {
    clearSettleTimer()
    settleTimerRef.current = window.setTimeout(() => {
      settleTimerRef.current = null
      settleToNearest()
    }, SETTLE_DEBOUNCE_MS)
  }

  const handleScroll = (event: UIEvent<HTMLDivElement>) => {
    // 拖拽期间的 scrollTop 由指针位置直接驱动，此刻去吸附会和手指抢控制权。
    // 抬手那次 `settleToNearest` 已经负责收尾，这里直接跳过。
    if (isDraggingRef.current) {
      return
    }

    const scroller = event.currentTarget
    const rawOffset = rowHeight > 0 ? scroller.scrollTop / rowHeight : 0
    const nearest = Math.round(rawOffset)

    // 命中的已经是目标行：吸附动画跑完了，此刻才回写上层状态。
    if (Math.abs(rawOffset - nearest) < 0.01) {
      clearSettleTimer()
      commitOffset(nearest)
      return
    }

    // 还在途中（原生滚轮惯性、点击 ±1、平滑吸附）→ 不打断，等停下来再说。
    scheduleSettle()
  }

  const handlePointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if (disabled || (event.pointerType === 'mouse' && event.button !== 0)) {
      return
    }

    const scroller = scrollerRef.current

    if (!scroller) {
      return
    }

    clearSettleTimer()
    isDraggingRef.current = true
    dragStartRef.current = {
      x: event.clientX,
      y: event.clientY,
      scrollTop: scroller.scrollTop,
      pointerId: event.pointerId,
      moved: false,
    }
  }

  const handlePointerMove = (event: PointerEvent<HTMLDivElement>) => {
    const scroller = scrollerRef.current

    if (!isDraggingRef.current || !scroller || dragStartRef.current.pointerId !== event.pointerId) {
      return
    }

    const deltaY = event.clientY - dragStartRef.current.y

    if (!dragStartRef.current.moved && Math.abs(deltaY) > DRAG_THRESHOLD_PX) {
      dragStartRef.current.moved = true
      // 拖动期间独占指针，手滑出列外也不会丢事件。jsdom 没实现指针捕获，
      // 所以这里要挡一下 —— 它只是体验优化，拿不到也不该让拖拽整体失败。
      if (typeof scroller.setPointerCapture === 'function') {
        scroller.setPointerCapture(event.pointerId)
      }
    }

    if (dragStartRef.current.moved) {
      scroller.scrollTop = dragStartRef.current.scrollTop - deltaY
    }
  }

  const handlePointerUp = (event: PointerEvent<HTMLDivElement>) => {
    const scroller = scrollerRef.current

    if (!isDraggingRef.current || !scroller || dragStartRef.current.pointerId !== event.pointerId) {
      return
    }

    const moved = dragStartRef.current.moved
    // 先落标记再吸附：`settleToNearest` 会触发一次 scroll 事件，那一次必须被
    // `isDraggingRef` 放行（否则吸附后的回写会被自己的守卫吃掉）。
    isDraggingRef.current = false

    if (typeof scroller.hasPointerCapture === 'function' && scroller.hasPointerCapture(event.pointerId)) {
      scroller.releasePointerCapture(event.pointerId)
    }

    if (moved) {
      settleToNearest()
    } else {
      // 没移动过就是一次点击，走 `step`/行的 onClick；这里不重复提交。
      clearSettleTimer()
    }
  }

  const step = (direction: -1 | 1) => {
    if (disabled) {
      return
    }

    clearSettleTimer()
    const scroller = scrollerRef.current
    const base = scroller ? Math.round(scroller.scrollTop / rowHeight) : scrollOffset
    scrollToOffset(base + direction)
    commitOffset(base + direction)
  }

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'ArrowUp') {
      event.preventDefault()
      step(-1)
      return
    }

    if (event.key === 'ArrowDown') {
      event.preventDefault()
      step(1)
    }
  }

  const formatValue = format ?? ((item: number) => `${item}`)

  // 窗口的起点：接收器共 `stride` 行，其中第 `half` 行是选中行，
  // 所以第 0 行对应的是「选中项往前数 half 项」。
  const rows: Array<{ key: string; value: number; windowPosition: number }> = []

  if (loop && count > 0) {
    for (let position = 0; position < stride; position += 1) {
      const absolute = baseOffset + position
      const value = values[((absolute % count) + count) % count]

      rows.push({ key: `${position}-${value}`, value, windowPosition: position })
    }
  } else {
    // 非循环列没有无限滚动，但两侧仍各自多渲染一个对齐冗余（用空行占位），
    // 这样「首项能停在正中、末项也能停在正中」和循环列是同一条规则。
    for (let position = 0; position < stride; position += 1) {
      const itemIndex = baseOffset + position
      const value = itemIndex >= 0 && itemIndex < count ? values[itemIndex] : Number.NaN

      rows.push({ key: `slot-${position}`, value, windowPosition: position })
    }
  }

  /*
   * 接收器要在窗口之外上下各留 `half` 行内边距，选中行才能被滚到正中：
   *
   *   内容高度 = half + stride + half = windowSize + 1 + 2 × half
   *   可见高度 = windowSize
   *   可滚范围 = 内容 - 可见 = 1 + 2 × half = stride
   *
   * 也就是说 `scrollOffset` 能取遍 [0, stride) —— 与「渲染窗口第 0 行 =
   * `scrollOffset - half`」正好对上。少了这段内边距，`scrollOffset` 只能取
   * 到 `stride - windowSize = 1` 一个值，整列等于滚不动。
   */
  const spacerRows = half * rowHeight

  return (
    <div
      className={classNames(
        styles['date-picker-wheel'],
        disabled && styles['date-picker-wheel--disabled'],
        className,
      )}
      role="presentation"
    >
      <div className={styles['date-picker-wheel__highlight']} aria-hidden="true" />
      <div
        ref={scrollerRef}
        className={styles['date-picker-wheel__scroller']}
        // 行高与补位高度都走内联变量：窗口高度、选中框高度、行高、补位必须是
        // 同一套数，交给 SCSS 从 `--date-picker-wheel-*` 统一算，JS 只给源头。
        style={
          {
            '--date-picker-wheel-row': `${rowHeight}px`,
            '--date-picker-wheel-spacer': `${spacerRows}px`,
          } as CSSProperties
        }
        role="listbox"
        aria-label={ariaLabel}
        aria-disabled={disabled || undefined}
        tabIndex={disabled ? -1 : 0}
        onKeyDown={handleKeyDown}
        onScroll={handleScroll}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
      >
        {rows.map((row) => {
          const isEmpty = Number.isNaN(row.value)
          // 高亮落在窗口正中那一行。补位时 `value` 不在候选里，正中那行是
          // 补位值，同样要算「选中」—— 否则回退到 2 月时整列都没有高亮。
          const isSelected = !isEmpty && row.windowPosition === half

          return (
            <div
              key={row.key}
              className={classNames(
                styles['date-picker-wheel__row'],
                isSelected && styles['date-picker-wheel__row--selected'],
              )}
              role={isEmpty ? 'presentation' : 'option'}
              aria-selected={isEmpty ? undefined : isSelected}
              aria-label={isEmpty ? undefined : formatValue(row.value)}
              onClick={() => {
                if (disabled || isEmpty || isDraggingRef.current) {
                  return
                }

                // 被点的这一行要挪到窗口正中：它当前在 `baseOffset + position`，
                // 目标是让第 0 行落在 `baseOffset` 上，所以整列平移这么多。
                const nextOffset = baseOffset + row.windowPosition

                if (nextOffset === scrollOffset) {
                  return
                }

                clearSettleTimer()
                scrollToOffset(nextOffset)
                commitOffset(nextOffset)
              }}
            >
              {isEmpty ? '\u00a0' : formatValue(row.value)}
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default WheelColumn
