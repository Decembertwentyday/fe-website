/**
 * ==============================================================
 * 文件：src/hooks/useEthersSigner.tsx
 * 作用：把 wagmi（viem）的 WalletClient 转换为 ethers.js 的 Signer
 *
 * Provider vs Signer 的区别：
 *   Provider（见 useEthersProvider.tsx）：
 *     - 只能"读"区块链数据（余额、合约状态等）
 *     - 不需要私钥
 *     - 任何人都可以用
 *
 *   Signer：
 *     - 能"写"区块链（发起交易、调用合约写方法）
 *     - 需要私钥签名（通过钱包提供）
 *     - 只有连接了钱包的用户才能获得
 *
 * 为什么需要这个 Hook？
 *   同 useEthersProvider 一样的历史原因：
 *   wagmi v1 提供 viem 的 WalletClient，
 *   但 ethers.js 的合约写操作需要 ethers Signer，
 *   这个 Hook 做两者之间的"翻译"
 *
 * 使用场景：
 *   当用户要发起交易时（如购买 NFT、挂单出售），
 *   需要用 Signer 调用合约方法
 * ==============================================================
 */

import * as React from 'react';
import { type WalletClient, useWalletClient } from 'wagmi';
// ↑ WalletClient：viem 的钱包客户端类型（能签名/发交易）
// useWalletClient：wagmi Hook，获取当前连接钱包的 WalletClient

import { providers } from 'ethers';
// ↑ ethers.js Provider 类（这里用 Web3Provider）

/**
 * 把 viem WalletClient 转换为 ethers.js Signer
 *
 * 转换原理：
 *   1. WalletClient 的 transport 是浏览器钱包的通信通道（EIP-1193 Provider）
 *   2. ethers.Web3Provider 接收 EIP-1193 Provider 创建 Provider
 *   3. provider.getSigner(address) 返回对应地址的 Signer
 *
 * @param walletClient - viem 的 WalletClient 实例
 * @returns ethers.js Signer 实例
 */
export function walletClientToSigner(walletClient: WalletClient) {
  const { account, chain, transport } = walletClient;
  // ↑ account：当前钱包账户（含地址）
  // chain：当前链信息
  // transport：与钱包通信的底层传输（EIP-1193 Provider）

  const network = {
    chainId: chain.id,
    name: chain.name,
    ensAddress: chain.contracts?.ensRegistry?.address,
  };

  const provider = new providers.Web3Provider(transport, network);
  // ↑ Web3Provider：接收一个 EIP-1193 Provider（浏览器钱包注入的）
  // 把 viem 的 transport（底层就是 EIP-1193）包装成 ethers Provider
  // network 参数：告诉 ethers 这是哪条链（避免 ethers 自己去查询链 ID）

  const signer = provider.getSigner(account.address);
  // ↑ 从 Provider 获取 Signer
  // account.address：当前连接的钱包地址
  // getSigner 返回一个 Signer 对象，可以：
  //   - signer.sendTransaction(tx)：发送交易
  //   - contract.connect(signer).methodName()：调用合约写方法

  return signer;
}

/**
 * React Hook：获取 ethers.js Signer
 * 在组件中使用，自动获取当前钱包的 Signer
 *
 * 使用示例：
 *   const signer = useEthersSigner();
 *   // 用于调用合约的写方法
 *   const contract = MyContract__factory.connect(address, signer);
 *   await contract.transfer(toAddress, amount);
 *
 * 注意：
 *   - 用户未连接钱包时，返回 undefined
 *   - 调用前应检查 signer 是否存在
 *
 * @param chainId - 可选，指定链 ID
 */
export function useEthersSigner({ chainId }: { chainId?: number } = {}) {
  const { data: walletClient } = useWalletClient({ chainId });
  // ↑ 从 wagmi 获取 WalletClient（含 data, isLoading, isError 等）
  // 解构出 data 并重命名为 walletClient
  // 未连接钱包时 walletClient 为 undefined

  return React.useMemo(
    () => (walletClient ? walletClientToSigner(walletClient) : undefined),
    // ↑ 三元表达式：
    //   有 walletClient（已连接钱包）→ 转换并返回 Signer
    //   无 walletClient（未连接）→ 返回 undefined
    [walletClient],
    // ↑ 依赖：walletClient 变化时重新计算（如切换账户）
  );
}
