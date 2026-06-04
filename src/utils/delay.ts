/**
 * ==============================================================
 * 文件：src/utils/delay.ts
 * 作用：异步延迟工具（Promise 版 setTimeout）
 *
 * 用法：
 *   await delay(2000)  // 暂停 2 秒后继续执行
 *
 * 典型场景：
 *   1. 链上交易提交后轮询 receipt（每 2s 查一次是否上链）
 *   2. UI 防抖/节流之间的简单等待
 *   3. 测试时模拟网络延迟
 *
 * 为什么封装成函数而不是直接用 setTimeout？
 *   async/await 语法更线性可读：
 *     await delay(1000); await checkStatus();
 *   比嵌套 setTimeout 回调清晰得多
 * ==============================================================
 */

const delay = (t: number) => new Promise((resolve) => setTimeout(resolve, t));
export default delay;
