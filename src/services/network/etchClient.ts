/**
 * ==============================================================
 * 文件：src/services/network/etchClient.ts
 * 作用：创建并配置"EtchMarket 后端专用"的 HTTP 客户端
 *
 * 这个文件做了 3 件事：
 *   1. 用 ApiClient 类创建一个 axios 实例（配置 baseURL、超时等）
 *   2. 添加"请求拦截器"：自动带上 JWT token（用户已登录则附上身份凭证）
 *   3. 添加"响应拦截器"：统一处理 401 错误（token 过期/失效）
 *
 * 什么是拦截器？
 *   类比快递中转站：
 *   请求拦截器 = 快递寄出前，在包裹上贴认证标签
 *   响应拦截器 = 快递收到后，如果是"拒收"就自动处理，不打扰业务层
 * ==============================================================
 */

import { SERVER_CONFIG } from '@/constants/config';
// ↑ 环境配置：BASE_URL 是 '/api'（主网）或 '/api-goerli'（测试网）

import ApiClient from './ApiClient';
// ↑ 导入我们自己封装的 HTTP 基础类

import axios from 'axios';
// ↑ 导入 axios 库（Node.js 和浏览器都支持的 HTTP 请求库）

// ─────────────────────────────────────────────────────────────
// 第 1 步：创建 axios 实例并包装进 ApiClient
// ─────────────────────────────────────────────────────────────
const etchClient = new ApiClient(
  axios.create({
    baseURL: SERVER_CONFIG.BASE_URL,
    // ↑ 所有请求的 URL 前缀
    // 例如：apiClient.get('/ethscriptions/latest')
    //   实际请求 URL = '/api' + '/ethscriptions/latest' = '/api/ethscriptions/latest'
    // 然后被 next.config.js 的 rewrites 代理到真实后端

    responseType: 'json' as const,
    // ↑ 告诉 axios 把响应数据自动解析为 JavaScript 对象（而不是字符串）
    // 'as const' 是 TypeScript 的类型收窄，让类型从 string 变成字面量类型 'json'

    headers: {
      'Content-Type': 'application/json',
      // ↑ 请求头：告诉服务器"我发送的数据格式是 JSON"
      // 服务器根据这个头来决定如何解析请求体
    },

    timeout: 10 * 1000,
    // ↑ 超时时间：10000 毫秒 = 10 秒
    // 如果 10 秒内后端没有响应，axios 会自动取消请求并抛出错误
    // 防止用户无限等待
  }),
);

// ─────────────────────────────────────────────────────────────
// 第 2 步：添加请求拦截器
// 作用：每次发请求前，自动检查 localStorage 有没有 token，
//       如果有，就在请求头里加上 Authorization 字段
// ─────────────────────────────────────────────────────────────
etchClient.client.interceptors.request.use(
  // 成功处理函数：接收请求配置，返回修改后的配置
  (config) => {
    if (localStorage.getItem('token')) {
      // ↑ 如果本地存储有 token（用户已经登录）
      config.headers['Authorization'] = `Bearer ${localStorage.getItem('token')}` ?? 'Bearer ';
      // ↑ 在请求头加上认证信息
      // 格式：Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
      //
      // 为什么用 Bearer Token 格式？
      //   这是 JWT（JSON Web Token）认证的标准格式
      //   服务器收到请求后，解析 Authorization 头，
      //   验证 token 是否有效，从而知道请求者的身份
      //
      // ?? 'Bearer ' 是空值合并：如果 token 是 null，就用 'Bearer '（空 token）
    }
    return config;
    // ↑ 必须返回修改后的 config，axios 才会继续发送请求
  },
  // 错误处理函数：如果拦截器本身出错（极少发生）
  (error) => {
    return Promise.reject(error); // 把错误向上传递，让调用方处理
  },
);

// ─────────────────────────────────────────────────────────────
// 第 3 步：添加响应拦截器
// 作用：统一处理特定错误码，避免每个业务方法都要写相同的错误处理
// ─────────────────────────────────────────────────────────────
etchClient.client.interceptors.response.use(
  // 正常响应处理：直接透传，不做任何修改
  (response) => {
    return response;
  },
  // 错误响应处理：对特定错误码进行统一处理
  (error) => {
    if ([401].includes(error.response.status)) {
      // ↑ 401 = Unauthorized（未授权）
      // 触发场景：
      //   - token 已过期
      //   - token 被服务器撤销（如用户在其他设备登出）
      //   - 请求了需要登录才能访问的接口，但没带 token

      localStorage.removeItem('token');
      // ↑ 清除本地失效的 token
      // 下次请求时，拦截器就不会带上这个无效 token 了

      return;
      // ↑ 返回 undefined（静默处理）
      // 设计选择：401 时不向调用方抛出错误
      // 效果：调用方收到 undefined，业务组件显示空数据，但不会显示报错
      // 用户体验：页面数据消失，但不会弹出错误提示
    }
    return Promise.reject(error);
    // ↑ 其他错误（如 500 服务器错误、404 找不到等）：向上抛出
    // 调用方可以在 catch 里处理，或者通过 react-query 的 onError 回调处理
  },
);

export default etchClient;
// ↑ 导出这个配置好的客户端，供 Services 层使用
// 所有 EtchMarket 后端接口都通过这个客户端发请求
