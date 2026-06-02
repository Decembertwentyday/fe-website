// 地址格式化工具：把以太坊完整地址截断为 "0x12...6789" 的可读格式
// 前5位 + '...' + 后5位；address 为空时返回空字符串（防止报错）
export const formatAddress = (address: string) => {
  return address ? address.slice(0, 5) + '...' + address.slice(-5) : '';
};
