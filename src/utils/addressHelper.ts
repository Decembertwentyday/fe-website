/**
 * ==============================================================
 * 文件：src/utils/addressHelper.ts
 * 作用：以太坊地址的 UI 展示格式化
 *
 * 完整地址示例：0xAbCdEf1234567890AbCdEf1234567890AbCdEf12（42 字符）
 * 表格/卡片里太长 → 截断为 0xAbC...Ef12
 *
 * 规则：前 5 位 + '...' + 后 5 位
 *   slice(0, 5)  → '0xAbC'
 *   slice(-5)    → 'Ef12'（含 0x 前缀时实际是后 3 位 hex + 部分，与项目现有 UI 一致）
 *
 * address 为空时返回 ''，避免 undefined.slice 报错
 *
 * 更好的思路（可选）：
 *   可以用 viem 的 getAddress + truncateAddress，或统一用 displayName（ENS）
 * ==============================================================
 */

export const formatAddress = (address: string) => {
  return address ? address.slice(0, 5) + '...' + address.slice(-5) : '';
};
