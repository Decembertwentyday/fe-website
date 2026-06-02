// ============================================================================
// 【getTimeAgoString】时间戳转「xx ago」人类可读格式
// ----------------------------------------------------------------------------
// 输入：Unix 时间戳（秒）
// 输出：'3 seconds ago' / '5 minutes ago' / '2 hours ago' / '1 day ago'
//       超过 7 天 → 直接显示 'YYYY/MM/DD HH:mm:ss'
// 注意：timestamp × 1000 转毫秒（后端返回的是秒级时间戳）
// ============================================================================
import dayjs, { ConfigType } from 'dayjs';

export const getTimeAgoString = (timestamp: ConfigType) => {
  const diff = dayjs().diff(Number(timestamp) * 1000, 'second');

  if (diff < 60) {
    return `${diff} second${diff > 1 ? 's' : ''} ago`;
  } else if (diff < 3600) {
    return `${Math.floor(diff / 60)} minute${diff / 60 > 1 ? 's' : ''} ago`;
  } else if (diff < 86400) {
    return `${Math.floor(diff / 3600)} hour${Math.floor(diff / 3600) > 1 ? 's' : ''} ago`;
  } else if (diff < 604800) {
    return `${Math.floor(diff / 86400)} day${Math.floor(diff / 86400) > 1 ? 's' : ''} ago`;
  } else {
    return dayjs(Number(timestamp) * 1000).format('YYYY/MM/DD HH:mm:ss');
  }
};
