/**
 * ==============================================================
 * 文件：src/app/providers.tsx
 * 作用：整个应用的"全局能力注入中心"
 *
 * 什么是 Provider 模式？
 *   React 中，数据默认只能从父组件传给子组件（单向数据流）。
 *   如果某个能力（如"当前用户信息"、"主题颜色"）需要被深层的子组件用到，
 *   通过 props 层层传递会非常麻烦（"prop drilling" 问题）。
 *   Provider 用 React Context 解决这个问题：
 *   在最外层"提供"（provide）数据，任意子孙组件"消费"（consume）数据。
 *
 * 这个文件注入的能力：
 *   1. QueryClientProvider  → 让所有组件使用 react-query（API 缓存）
 *   2. ThemeProvider        → 让所有 MUI 组件使用统一主题
 *   3. Toaster              → 全局 Toast 提示弹窗
 *   4. WagmiConfig          → 让所有组件使用 wagmi（Web3 连接）
 *   5. RainbowKitAuthenticationProvider → 支持 SIWE 登录
 *   6. RainbowKitProvider   → 提供连接钱包的 UI 弹窗
 *
 * 嵌套顺序很重要！
 *   外层 Provider 先于内层 Provider 初始化，
 *   内层组件可以使用外层 Provider 注入的能力，但反过来不行。
 * ==============================================================
 */

'use client';
// ↑ 客户端组件声明（使用了 useState、useEffect 等客户端 Hook）

import merge from 'lodash.merge';
// ↑ lodash 的深度合并函数
// 用途：把自定义主题配置"叠加"到 RainbowKit 默认深色主题上
// 深度合并 vs 浅合并：深度合并会递归合并嵌套对象，不会覆盖未指定的属性

import { Toaster } from 'react-hot-toast';
// ↑ Toast 通知容器组件（显示"操作成功"/"失败"等提示框）
// react-hot-toast：轻量级、美观的 Toast 库

import customTheme from '@/constants/theme';
// ↑ 项目自定义的 MUI 主题（在 src/constants/theme.ts 中定义）

import { CssBaseline, ThemeProvider } from '@mui/material';
// ↑ ThemeProvider：把主题"注入"给所有 MUI 子组件
// CssBaseline：类似 normalize.css，重置不同浏览器的默认样式差异

import { useSnapshot } from 'valtio';
// ↑ valtio 的订阅 Hook
// 原理：当 proxy 对象的值变化时，用了 useSnapshot 的组件会自动重新渲染
// 注意：必须用 useSnapshot 的返回值（不是直接用 store），否则不会触发更新

import * as dayjs from 'dayjs';
import duration from 'dayjs/plugin/duration';
// ↑ dayjs 日期库 + duration（时间段）插件
// 这里初始化一次，整个应用都能用 dayjs.duration()

// wagmi（Web3 连接库）相关
import { configureChains, createConfig, WagmiConfig } from 'wagmi';
// configureChains：配置支持哪些区块链网络以及 RPC 节点
// createConfig：创建 wagmi 的全局配置对象
// WagmiConfig：wagmi 的 Provider 组件，把配置注入给所有子组件

import { publicProvider } from 'wagmi/providers/public';
// ↑ 公共 RPC 节点提供者
// RPC（Remote Procedure Call）节点是连接以太坊的"网关"
// publicProvider 使用免费的公共节点（如 cloudflare-eth.com）
// 缺点：速率有限制；生产环境通常用 infuraProvider 或 alchemyProvider

// RainbowKit（钱包连接 UI 库）相关
import {
  RainbowKitProvider, // RainbowKit 的 Provider（提供钱包连接 UI）
  RainbowKitAuthenticationProvider, // 支持 SIWE 认证的 Provider
  getDefaultWallets, // 获取 RainbowKit 默认推荐的钱包列表
  connectorsForWallets, // 根据钱包列表创建 wagmi 连接器
  Theme, // RainbowKit 主题类型
  darkTheme, // RainbowKit 内置深色主题
} from '@rainbow-me/rainbowkit';

// 各种钱包的适配器（每个适配器告诉 RainbowKit 如何与该钱包交互）
import {
  injectedWallet, // 浏览器注入钱包（通过 window.ethereum）
  rainbowWallet, // Rainbow 钱包
  metaMaskWallet, // MetaMask（最广泛使用的以太坊钱包）
  okxWallet, // OKX 交易所钱包（在亚洲用户中流行）
  walletConnectWallet, // WalletConnect（协议，支持扫码连接移动端钱包）
  tokenPocketWallet, // TokenPocket（国内流行的多链钱包）
} from '@rainbow-me/rainbowkit/wallets';

import { gateWallet } from '@/wallets/gateWallet';
// ↑ 自定义的 Gate.io 钱包适配器
// Gate.io 钱包不在 RainbowKit 内置列表中，所以项目自己实现了这个适配器
// 文件位于 src/wallets/gateWallet.ts

import { QueryClient, QueryClientProvider } from 'react-query';
// ↑ react-query 的核心
// QueryClient：数据缓存的"大脑"，存储所有查询的缓存数据和状态
// QueryClientProvider：把 QueryClient 注入给所有子组件

import { authenticationAdapter } from './authenticationAdapter';
// ↑ SIWE 认证适配器（在 authenticationAdapter.ts 中定义）
// 包含 getNonce、createMessage、verify、signOut 4 个方法

import * as GlobalStore from '@/stores/GlobalStore';
// ↑ 全局状态 store

import { SERVER_CONFIG } from '@/constants/config';
// ↑ 服务器配置（包含 CHAIN：当前使用主网还是测试网）

// 初始化 dayjs 插件（整个应用只需要初始化一次）
dayjs.extend(duration);

// ─────────────────────────────────────────────────────────────
// Web3 配置（重要！这决定了应用连接哪个区块链网络）
// ─────────────────────────────────────────────────────────────
const { chains, publicClient, webSocketPublicClient } = configureChains(
  SERVER_CONFIG.CHAIN, // 支持的链（主网：[mainnet]，测试网：[goerli]）
  [publicProvider()], // 使用公共 RPC 节点读取链数据
);
// chains：配置好的链对象列表（供 wagmi 和 RainbowKit 使用）
// publicClient：HTTP RPC 客户端（用于读取区块链数据，如余额、合约状态）
// webSocketPublicClient：WebSocket 客户端（用于订阅实时事件，如新区块通知）

// WalletConnect v2 项目 ID（在 https://cloud.walletconnect.com 申请）
// 这个 ID 标识你的应用，用于 WalletConnect 协议的握手
const projectId = 'c5e287b868fa350466d5a0d947a65042';

// 获取 RainbowKit 默认推荐的钱包列表（MetaMask、Rainbow、Coinbase Wallet 等）
const { wallets } = getDefaultWallets({
  appName: 'EtchMarket APP', // 在钱包确认界面显示的应用名称
  projectId, // WalletConnect 项目 ID
  chains,
});

// 应用信息（显示在 RainbowKit 弹窗的顶部）
const AppInfo = {
  appName: 'EtchMarket APP',
};

// ─────────────────────────────────────────────────────────────
// 配置支持的钱包列表（决定"连接钱包"弹窗里显示哪些钱包）
// ─────────────────────────────────────────────────────────────
const connectors = connectorsForWallets([
  {
    groupName: 'Recommended', // 分组名称（在弹窗里显示为分组标题）
    wallets: [
      okxWallet({ projectId, chains }), // OKX 排第一（针对国内用户习惯）
      tokenPocketWallet({ projectId, chains }), // TokenPocket
      injectedWallet({ chains }), // 任意浏览器注入的钱包（如 Rabby）
      rainbowWallet({ projectId, chains }), // Rainbow
      metaMaskWallet({ projectId, chains }), // MetaMask（最通用）
      walletConnectWallet({ projectId, chains }), // 扫码连接任意移动端钱包
      gateWallet({ chains }), // Gate.io 钱包
    ],
  },
]);

// ─────────────────────────────────────────────────────────────
// 创建 wagmi 全局配置（Web3 连接的"神经中枢"）
// ─────────────────────────────────────────────────────────────
const wagmiConfig = createConfig({
  autoConnect: true,
  // ↑ 页面刷新时自动重连：wagmi 会尝试重新连接上次使用的钱包
  // 用户不需要每次刷新都重新点"Connect Wallet"

  connectors, // 使用上面配置的钱包连接器列表
  publicClient, // HTTP RPC 客户端
  webSocketPublicClient, // WebSocket RPC 客户端
});

// ─────────────────────────────────────────────────────────────
// 自定义 RainbowKit 主题
// ─────────────────────────────────────────────────────────────
const myCustomTheme: Theme = merge(darkTheme(), {
  // ↑ 在 RainbowKit 默认深色主题基础上，只修改这两个颜色
  colors: {
    accentColor: '#D5E970', // 强调色：品牌黄绿色
    // 用于：按钮背景色、选中状态、强调元素
    accentColorForeground: '#171A1F', // 强调色上的文字颜色：深黑色
    // 为什么深色：黄绿背景 + 深色文字，对比度好，符合可读性标准
  },
} as Theme);

// ─────────────────────────────────────────────────────────────
// 创建 react-query 的数据缓存实例
// ─────────────────────────────────────────────────────────────
// 在模块级别创建（不在组件内），确保整个应用只有一个实例
// 如果在组件内创建，每次组件重渲染都会创建新实例，缓存就失效了
const queryClient = new QueryClient();

// ─────────────────────────────────────────────────────────────
// Providers 主组件
// ─────────────────────────────────────────────────────────────
export function Providers({ children }: { children: React.ReactNode }) {
  const globalStore = useSnapshot(GlobalStore.store);
  // ↑ 订阅全局状态
  // 这里主要是为了获取 globalStore.rainbowKitAuthStatus（登录状态）
  // 传给 RainbowKitAuthenticationProvider 的 status 属性

  return (
    // 第 1 层：react-query 数据缓存
    <QueryClientProvider client={queryClient}>
      {/* 现在所有子组件都可以用 useQuery、useMutation 等 hooks */}

      {/* 第 2 层：MUI 主题 */}
      <ThemeProvider theme={customTheme}>
        {/* 现在所有 MUI 组件（Button、Box、Typography等）都会使用 customTheme 的颜色和字体 */}

        {/* 重置浏览器默认样式（确保跨浏览器一致性） */}
        <CssBaseline />

        {/* 全局 Toast 通知容器 */}
        <Toaster
          position="top-right" // Toast 出现在屏幕右上角
          containerStyle={{
            top: 80, // 距顶部 80px（避免被 Header(64px高) 遮挡，留 16px 间距）
            right: 20,
          }}
          toastOptions={{
            success: {
              duration: 3000, // 成功 Toast 显示 3 秒后自动消失
            },
            error: {
              duration: 3000, // 错误 Toast 也是 3 秒
            },
            loading: {
              duration: 3000, // 加载中 Toast 3 秒后消失（通常会被 success/error 替换）
            },
          }}
        />

        {/* 第 3 层：wagmi Web3 连接 */}
        <WagmiConfig config={wagmiConfig}>
          {/* 现在所有子组件都可以用 useAccount、useContractWrite 等 wagmi hooks */}

          {/* 第 4 层：RainbowKit SIWE 认证 */}
          <RainbowKitAuthenticationProvider
            adapter={authenticationAdapter}
            // ↑ 认证适配器（包含 getNonce、createMessage、verify、signOut 方法）

            status={globalStore.rainbowKitAuthStatus}
            // ↑ 当前认证状态（'authenticated' | 'unauthenticated' | 'loading'）
            // RainbowKit 根据这个状态决定在"Connect Wallet"按钮旁显示什么
          >
            {/* 第 5 层（最内层）：RainbowKit 连接钱包 UI */}
            <RainbowKitProvider
              chains={chains}
              modalSize="wide"
              appInfo={AppInfo}
              theme={myCustomTheme}
            >
              {children}
            </RainbowKitProvider>
          </RainbowKitAuthenticationProvider>
        </WagmiConfig>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
