// 轮盘选择（WheelPicker）的索引数学。
//
// 单独成模块而不是塞进组件里：三列轮盘各自要算「当前是第几圈的第几项」，
// 而这一组换算在拖拽、滚轮、键盘和点击四条输入路径上都要用到，放在一起才
// 保证它们不会各自算出不同的落点。

/**
 * 渲染窗口的行数。
 *
 * 选中行要停在窗口正中，所以它两侧**各自**都要铺满 `half` 行：`2 × half + 1`。
 * 可见行数 5（half = 2）对应窗口 5 行 —— 选中行本身也在这 5 行里，上下文行
 * 恰好是它的左右各两行。窗口再各留一行冗余，就是 `getWheelStride`。
 */
export function getWheelWindowSize(visibleCount: number): number {
  // 偶数会让选中行两侧不对称，±1 把它掰成奇数（5 → 5，6 → 7）。
  return visibleCount % 2 === 0 ? visibleCount + 1 : visibleCount
}

/**
 * 接收器的行数：渲染窗口在上下各留一行对齐冗余。
 *
 * 冗余是给 `baseOffset` 挪位用的 —— 选中行要在窗口的正中，而 `baseOffset`
 * 和选中项之间隔着 `half` 行，窗口必须多铺一行才装得下最后那一行。
 */
export function getWheelStride(visibleCount: number): number {
  return getWheelWindowSize(visibleCount) + 1
}

/**
 * 把连续的圈数与项目下标拍扁成一个渲染坐标。
 *
 * `loop` 打开时不取模：`itemIndex` 只在 [0, count) 内，坐标会随圈数一直增长，
 * 31 号之后自然接回 1 号 —— 这正是「无限滚动」的实现方式，DOM 里始终只有
 * 一个行高为 stride 的窗口。
 */
export function toWheelOffset(loop: boolean, turn: number, itemIndex: number, count: number): number {
  if (loop) {
    return turn * count + itemIndex
  }

  return itemIndex
}

/** 渲染坐标的逆向换算：拆回圈数与项目下标。 */
export function fromWheelOffset(
  loop: boolean,
  offset: number,
  count: number,
): { turn: number; itemIndex: number } {
  if (!loop || count <= 0) {
    return { turn: 0, itemIndex: offset }
  }

  const turn = Math.floor(offset / count)
  const remainder = offset - turn * count

  return { turn, itemIndex: remainder }
}

/** 把 `itemIndex` 收敛到 [0, count)，同时把圈数补偿回来，使逻辑值不跳变。 */
export function normalizeWheelIndex(
  loop: boolean,
  turn: number,
  itemIndex: number,
  count: number,
): { turn: number; itemIndex: number } {
  if (!loop || count <= 0) {
    return { turn: 0, itemIndex }
  }

  const turnShift = Math.floor(itemIndex / count)
  const normalizedIndex = itemIndex - turnShift * count

  return { turn: turn + turnShift, itemIndex: normalizedIndex }
}

/**
 * 选中值的索引。值不在候选列表里时返回 `fallbackIndex`：
 * 非循环列夹到首尾（年月日都有边界），循环列则取模落回合法区间。
 */
export function resolveWheelIndex(
  loop: boolean,
  values: readonly number[],
  target: number,
  fallbackIndex: number,
): number {
  const exactIndex = values.indexOf(target)

  if (exactIndex >= 0) {
    return exactIndex
  }

  if (values.length === 0) {
    return 0
  }

  return loop ? ((fallbackIndex % values.length) + values.length) % values.length : fallbackIndex
}
