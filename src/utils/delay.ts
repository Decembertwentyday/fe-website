// 延迟工具函数：返回一个 Promise，t 毫秒后 resolve
// 用法：await delay(2000) → 等待 2 秒
// 典型场景：合约交易轮询等待、防抖等
const delay = (t: number) => new Promise((resolve) => setTimeout(resolve, t));
export default delay;
