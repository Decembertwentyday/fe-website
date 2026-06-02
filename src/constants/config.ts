/**
 * ==============================================================
 * 文件：src/constants/config.ts
 * 作用：整个项目的环境配置总开关
 *
 * 核心思路：
 *   把"主网配置"和"测试网配置"分别定义成两个常量对象，
 *   最后通过修改 export 行来切换环境。
 *   这样做的好处：不会因为切换环境而改动业务代码，降低出错风险。
 *
 * 什么是主网 / 测试网？
 *   主网（mainnet）= 真实的以太坊网络，交易需要花真实 ETH
 *   测试网（goerli）= 模拟环境，使用没有价值的测试 ETH，适合开发调试
 * ==============================================================
 */

// 从 wagmi 导入两条链的配置信息（wagmi 内置了主流链的 chainId、RPC 地址等）
// mainnet = 以太坊主网（chainId: 1）
// goerli  = 以太坊 Goerli 测试网（chainId: 5）
import { mainnet, goerli } from 'wagmi/chains';

// ─────────────────────────────────────────────────────────────
// Facet 链配置
// Facet 是一个特殊的以太坊 L2（第二层网络），项目的 Swap 功能基于它实现
// "L2" 的意思是：在以太坊主链基础上建立的第二层，Gas 更低，速度更快
// ─────────────────────────────────────────────────────────────

// Facet 主网配置
const FACET_MAIN_CONFIG = {
  SCAN_URL: 'https://api.facet.org/', // Facet 主网后端 API 地址
  SCAN_FE_URL: 'https://facetscan.com', // Facet 区块链浏览器地址（给用户查看交易）
  RECEIVE_ADDRESS: '0x00000000000000000000000000000000000FacE7', // Facet 合约接收地址（固定地址，注意末尾是 FacE7）
  FETH_ADDRESS: '0x1673540243e793b0e77c038d4a88448eff524dce', // FETH（Facet ETH）代币合约地址
};

// Facet 测试网（Goerli）配置，结构相同，地址不同
const FACET_GOERLI_CONFIG = {
  SCAN_URL: 'https://goerli-api.facet.org/',
  SCAN_FE_URL: 'https://goerli.facetscan.com',
  RECEIVE_ADDRESS: '0x00000000000000000000000000000000000FacE7',
  FETH_ADDRESS: '0xcffc7fbd459d4c028163029d0db0fa26f44b0ed1', // 测试网 FETH 合约地址（与主网不同）
};

// ─────────────────────────────────────────────────────────────
// 后端 API 服务配置
// BASE_URL 是所有 HTTP 请求的前缀，会被 next.config.js 的 rewrites 代理转发
// ─────────────────────────────────────────────────────────────

// 主网后端配置
const SERVER_MAIN_CONFIG = {
  BASE_URL: '/api', // 请求前缀（→ 被代理到 https://www.etch.market/api/）
  CHAIN: [mainnet], // 使用以太坊主网（数组格式，支持未来多链扩展）
};

// 测试网后端配置
const SERVER_GOERLI_CONFIG = {
  BASE_URL: '/api-goerli', // 请求前缀（→ 被代理到 http://3.233.81.38:3002/）
  CHAIN: [goerli],
};

// ─────────────────────────────────────────────────────────────
// ★ 环境切换开关 ★
// 修改这两行来切换整个项目的运行环境：
//   主网：SERVER_MAIN_CONFIG  /  FACET_MAIN_CONFIG
//   测试网：SERVER_GOERLI_CONFIG / FACET_GOERLI_CONFIG
// ─────────────────────────────────────────────────────────────
export const SERVER_CONFIG = SERVER_MAIN_CONFIG; // 当前：主网（注释掉的 SERVER_GOERLI_CONFIG 是测试网）
export const FACET_CONFIG = FACET_MAIN_CONFIG; // 当前：主网
