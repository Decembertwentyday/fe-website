// ============================================================================
// 【getTruncate】大数截断格式化（保留指定位小数，去掉尾零）
// ----------------------------------------------------------------------------
// 场景：展示 Token 价格/数量时，避免 0.10000000 或 1234567.89 的难看格式
// 用法：getTruncate('1234567.89012', 4) → '1,234,567.8901'
//
// 内部逻辑：
//   1. removeTrailingZeroes：去掉小数末尾多余的 0（如 1.5000 → 1.5）
//   2. BigNumber.toFormat：按千分位格式化 + 向下截取 demical 位（不四舍五入）
//      ROUND_DOWN 很重要：价格展示不能随意进位，防止显示价格 > 实际价格
// ============================================================================
import BigNumber from 'bignumber.js';

function removeTrailingZeroes(str: string): string {
  const dotIndex = str.indexOf('.');
  if (dotIndex === -1) {
    return str;
  }
  let temp = str.slice(0, dotIndex + 1) + str.slice(dotIndex + 1).replace(/0+$/, '');

  if (temp.endsWith('.')) {
    temp = temp.replace('.', '');
  }
  return temp;
}

export default function getTruncate(num: string, demical: number) {
  const fmt = {
    decimalSeparator: '.',
    groupSeparator: ',',
    groupSize: 3,
    secondaryGroupSize: 3,
  };

  const formatNum = BigNumber(num).toFormat(demical, BigNumber.ROUND_DOWN, fmt);

  return removeTrailingZeroes(formatNum);
}
