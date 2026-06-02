// ============================================================================
// 【Facet 链客户端】用于访问 Facet L2 区块浏览器的 API
// ----------------------------------------------------------------------------
// 做什么：
//   创建一个专门访问 Facet L2 网络数据的 HTTP 客户端实例（与 etchClient 并列）。
//
// 什么是 Facet L2：
//   Facet 是建立在以太坊上的 L2（Layer 2）协议，主要服务于 Ethscriptions（铭文）。
//   它有自己的区块浏览器（类似 Etherscan），通过 SCAN_URL 提供 API。
//
// 为什么单独建一个 client：
//   不同后端服务有不同的 BaseURL（域名）、不同的认证方式、不同的超时设置。
//   把每个外部 API 封装成独立的 client 实例，方便统一管理 + 互不影响。
//
// 项目中的 ApiClient 实例对照：
//   - etchClient   → 主后端 API（含 JWT 认证拦截器）
//   - facetClient  → Facet L2 区块浏览器（公开数据，无需认证）
//
// 注意：下方注释掉的拦截器代码是预留位置，未来若 Facet 接口需要鉴权再启用。
// ============================================================================

import { FACET_CONFIG } from '@/constants/config';
import ApiClient from './ApiClient';
import axios from 'axios';

// 创建 Facet L2 专用客户端
const facetClient = new ApiClient(
  axios.create({
    baseURL: FACET_CONFIG.SCAN_URL, // Facet 区块浏览器 API 根地址
    responseType: 'json' as const, // 所有响应按 JSON 解析
    headers: {
      'Content-Type': 'application/json',
    },
    timeout: 10 * 1000, // 超时 10 秒（区块链查询可能略慢）
  }),
);

// facetClient.client.interceptors.request.use(
//   (config) => {
//     return config;
//   },
//   (error) => {
//     return Promise.reject(error);
//   },
// );

// facetClient.client.interceptors.response.use(
//   (response) => {
//     return response;
//   },
//   (error) => {
//     return Promise.reject(error);
//   },
// );

export default facetClient;
