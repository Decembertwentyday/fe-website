/**
 * ==============================================================
 * 文件：src/stores/GlobalStore.ts
 * 作用：全局状态管理——存储整个应用共享的核心数据
 *
 * 使用的状态管理库：valtio
 * 为什么选 valtio 而不是 Redux 或 Zustand？
 *
 *   Redux：
 *     - 需要定义 action 类型、reducer 函数、dispatch 调用
 *     - 对于这个项目的简单全局状态，过于繁重
 *
 *   valtio：
 *     - 直接修改对象：store.count = 5（像操作普通变量一样）
 *     - 底层用 JavaScript Proxy 实现响应式
 *     - 代码量少，学习成本极低
 *
 * 这个文件管理的状态：
 *   1. rainbowKitAuthStatus：用户的 Web3 登录状态
 *   2. isOgPass：用户是否持有 OG Pass（早期用户特权资格）
 *
 * 同时提供操作状态的函数（类似 Redux 的 Action Creator）：
 *   - initRainbowKitAuthStatus：页面刷新时从 localStorage 恢复登录状态
 *   - setRainbowKitAuthStatus：登录或登出时更新状态
 *   - setIsOGPass：更新 OG Pass 资格
 * ==============================================================
 */

import { AuthenticationStatus } from '@rainbow-me/rainbowkit';
// ↑ RainbowKit 定义的类型，是一个联合类型：
// type AuthenticationStatus = 'loading' | 'unauthenticated' | 'authenticated'
// loading: 正在检查登录状态
// unauthenticated: 未登录
// authenticated: 已登录（有有效的 JWT token）

import { ValueOf } from 'next/dist/shared/lib/constants';
// ↑ TypeScript 工具类型，用于提取对象类型中值的类型
// 示例：ValueOf<{a: string, b: number}> = string | number

import { proxy } from 'valtio';
// ↑ valtio 的核心函数
// proxy(obj)：把普通对象转换为"响应式代理"
// 原理：利用 ES6 Proxy，拦截对象的 get/set 操作，追踪变化

// ─────────────────────────────────────────────────────────────
// 类型定义
// ─────────────────────────────────────────────────────────────

// 定义全局 Store 的数据结构（TypeScript 接口）
export interface IGlobalStore {
  rainbowKitAuthStatus: AuthenticationStatus; // Web3 登录状态
  isOgPass: boolean; // 是否有 OG Pass 资格
}

// localStorage 中保存多个地址 token 的数据结构
// 格式示例：[{"0xabc...": {"token": "eyJ..."}}, {"0xdef...": {"token": ""}}]
// 为什么用数组而不是直接用一个对象？
//   支持用户在多个钱包地址之间切换，每个地址都有独立的 token
type AccessTokenType = {
  [key: string]: { token: string };
  // key = 钱包地址（0x...），value = { token: JWT字符串 }
};

// ─────────────────────────────────────────────────────────────
// 创建全局状态实例
// ─────────────────────────────────────────────────────────────

// ★ 创建响应式 Store（整个应用的全局状态）
export const store = proxy<IGlobalStore>({
  rainbowKitAuthStatus: 'unauthenticated', // 初始状态：未登录
  isOgPass: false, // 初始状态：没有 OG Pass
});
// 任何组件只要用 useSnapshot(store) 订阅了这个 store，
// 当 store 的值改变时，该组件会自动重新渲染

// ─────────────────────────────────────────────────────────────
// 状态操作函数
// ─────────────────────────────────────────────────────────────

/**
 * 初始化登录状态（在用户连接钱包后调用，如 Header.tsx 的 useEffect 里）
 * 作用：从 localStorage 读取该地址的 token，如果存在且有效，自动恢复登录状态
 * 解决的问题：用户刷新页面后，不需要重新点"Sign In"，保持登录状态持久化
 *
 * @param address - 当前连接的钱包地址（0x...）
 */
export const initRainbowKitAuthStatus = (address: string) => {
  // 读取 localStorage 中存储的所有地址的 token 列表
  // JSON.parse：把 JSON 字符串解析为 JavaScript 对象
  // ?? '[]'：空值合并，如果 localStorage 中没有这个键，就返回空数组字符串
  const accessTokens: AccessTokenType[] = JSON.parse(localStorage.getItem('accessTokens') ?? '[]');

  // 在数组中找到当前地址对应的 token
  // .find()：遍历数组，返回第一个满足条件的元素（找不到返回 undefined）
  // item[address]：检查这个数组元素是否有以 address 为 key 的属性
  // ?.[address]：可选链 + 属性访问（如果 find 返回 undefined，不报错）
  // ?? { token: '' }：找不到就用默认值（空 token）
  const accessToken: ValueOf<AccessTokenType> = accessTokens.find((item) => item[address])?.[address] ?? { token: '' };

  if (accessToken?.token.trim() !== '') {
    // ↑ 如果 token 存在且不是空白字符串
    // .trim()：去除首尾空格，防止存储了 "   "（全空格）的无效 token

    localStorage.setItem('token', accessToken?.token);
    // ↑ 把当前地址的 token 单独存一份到 'token' 键
    // 为什么？etchClient 的拦截器直接读 'token'，不需要遍历整个列表

    store.rainbowKitAuthStatus = 'authenticated';
    // ↑ valtio 直接修改：有 token = 已登录
    // 修改后，所有用 useSnapshot(store) 的组件会自动更新
  } else {
    localStorage.removeItem('token');
    // ↑ 没有有效 token，清除可能存在的旧 token

    store.rainbowKitAuthStatus = 'unauthenticated';
    // ↑ 设置为未登录
  }
};

/**
 * 更新登录状态（登录成功或登出时调用）
 *
 * @param status  - 新状态（'authenticated' | 'unauthenticated'）
 * @param address - 钱包地址
 * @param token   - JWT token（登录时有值，登出时为空字符串）
 */
export const setRainbowKitAuthStatus = (status: AuthenticationStatus, address: string, token: string) => {
  // 读取现有的 token 列表
  let accessTokens: AccessTokenType[] = JSON.parse(localStorage.getItem('accessTokens') ?? '[]');

  if (status === 'authenticated') {
    // ─── 登录成功处理 ───
    accessTokens.push({ [address]: { token } });
    // ↑ 添加新的 { 地址: { token } } 记录
    // [address] 是"计算属性名"语法：key 是变量 address 的值
    // 例如：address = '0xabc' → { '0xabc': { token: 'eyJ...' } }

    localStorage.setItem('token', token);
    // ↑ 把 token 单独存一份（供 axios 拦截器快速读取）

    localStorage.setItem('accessTokens', JSON.stringify(accessTokens));
    // ↑ 更新完整的 token 列表（持久化）
  } else if (status === 'unauthenticated') {
    // ─── 登出处理 ───
    localStorage.removeItem('token');
    // ↑ 清除当前使用的 token

    // 把该地址的 token 置为空字符串（保留记录，但清除 token 内容）
    accessTokens = accessTokens.map((item) => {
      // ↑ map()：遍历数组，对每个元素执行转换，返回新数组
      return item[address] ? { [address]: { token: '' } } : item;
      // ↑ 三元表达式：
      //   如果这个元素包含当前地址 → 替换为空 token
      //   否则 → 保持原样（其他地址的 token 不受影响）
    });

    localStorage.setItem('accessTokens', JSON.stringify(accessTokens));
  }

  store.rainbowKitAuthStatus = status;
  // ↑ 更新全局状态（触发订阅组件重新渲染）
};

/**
 * 设置 OG Pass 资格
 * 由 ProvidersMiddleware 在获取用户信息后调用
 *
 * @param flag - true = 有 OG Pass，false = 没有
 */
export const setIsOGPass = (flag: boolean) => {
  store.isOgPass = flag;
  // ↑ valtio 的简洁：直接赋值，自动触发订阅更新
  // 不需要 dispatch({ type: 'SET_OG_PASS', payload: flag }) 这种繁琐写法
};
