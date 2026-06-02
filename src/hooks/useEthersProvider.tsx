/**
 * ==============================================================
 * 文件：src/hooks/useEthersProvider.tsx
 * 作用：把 wagmi（viem）的 PublicClient 转换为 ethers.js 的 Provider
 *
 * 为什么需要这个转换？
 *   历史背景：
 *     - ethers.js 是老牌的以太坊工具库（v5）
 *     - wagmi v1 底层使用了新的 viem 库
 *     - viem 的 API 与 ethers.js 不兼容
 *
 *   问题：
 *     项目里的某些合约交互代码是用 ethers.js 写的（如 typechain 生成的合约类型）
 *     但 wagmi 提供的是 viem 的 PublicClient，不能直接用于 ethers.js
 *
 *   解决方案：
 *     写一个转换函数，把 viem PublicClient → ethers.js Provider
 *     这样就可以用 ethers.js 的方式读取区块链数据
 *
 * 这个文件提供：
 *   - publicClientToProvider：转换函数
 *   - useEthersProvider：React Hook 版本（自动获取 wagmi 的 publicClient 并转换）
 * ==============================================================
 */

import * as React from 'react';
import { type PublicClient, usePublicClient } from 'wagmi';
// ↑ PublicClient：viem 的读取链数据客户端类型
// usePublicClient：wagmi Hook，获取当前配置的 publicClient

import { providers } from 'ethers';
// ↑ ethers.js 的 Provider 类
// providers.JsonRpcProvider：通过 HTTP RPC URL 连接以太坊
// providers.FallbackProvider：多个 Provider 的故障转移（一个失败用下一个）

import { type HttpTransport } from 'viem';
// ↑ viem 的 HTTP 传输类型（用于类型检查）

/**
 * 把 viem PublicClient 转换为 ethers.js Provider
 *
 * 转换逻辑：
 *   如果 transport 是 'fallback' 类型（多个 RPC 节点）：
 *     → 创建 ethers FallbackProvider（对应多个 JsonRpcProvider）
 *   否则（单个 RPC 节点）：
 *     → 创建单个 ethers JsonRpcProvider
 *
 * @param publicClient - viem 的 PublicClient 实例
 * @returns ethers.js Provider 实例
 */
export function publicClientToProvider(publicClient: PublicClient) {
  const { chain, transport } = publicClient;
  // ↑ 从 publicClient 解构出链信息和传输配置

  // 构建 ethers.js 需要的网络信息对象
  const network = {
    chainId: chain.id, // 链 ID（主网：1）
    name: chain.name, // 链名称（如 'homestead'）
    ensAddress: chain.contracts?.ensRegistry?.address,
    // ↑ ENS 注册合约地址（以太坊名称服务，如 vitalik.eth → 0x...）
    // ?. 可选链：某些链可能没有 ENS
  };

  if (transport.type === 'fallback') {
    // ↑ 如果使用了多个 RPC 节点（故障转移配置）
    return new providers.FallbackProvider(
      (transport.transports as ReturnType<HttpTransport>[]).map(
        ({ value }) => new providers.JsonRpcProvider(value?.url, network),
        // ↑ 把每个 viem transport 转为一个 ethers JsonRpcProvider
      ),
    );
    // FallbackProvider：当第一个节点失败时，自动切换到下一个
  }

  return new providers.JsonRpcProvider(transport.url, network);
  // ↑ 单个 RPC 节点：直接创建 JsonRpcProvider
}

/**
 * React Hook：获取 ethers.js Provider
 * 在组件中使用，自动处理 wagmi publicClient 的获取和转换
 *
 * 使用示例：
 *   const provider = useEthersProvider();
 *   const balance = await provider.getBalance('0xAbCd...');
 *
 * @param chainId - 可选，指定链 ID（默认使用当前配置的链）
 */
export function useEthersProvider({ chainId }: { chainId?: number } = {}) {
  const publicClient = usePublicClient({ chainId });
  // ↑ 从 wagmi 获取 publicClient（如果指定了 chainId 就获取那条链的）

  return React.useMemo(
    () => publicClientToProvider(publicClient),
    [publicClient],
    // ↑ useMemo：只在 publicClient 变化时重新转换（避免每次渲染都创建新 Provider）
    // publicClient 通常不会变化（除非切换了链）
  );
}
