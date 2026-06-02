/**
 * ==============================================================
 * 文件：src/app/authenticationAdapter.ts
 * 作用：实现基于以太坊的 Web3 登录（SIWE - Sign-In with Ethereum）
 *
 * 什么是 SIWE？
 *   SIWE 是 Web3 登录的行业标准。
 *   传统登录：输入用户名密码 → 服务器验证
 *   Web3 登录：连接钱包 → 服务器给一段消息 → 用私钥签名 → 服务器验证签名
 *
 *   好处：
 *   1. 不需要密码（私钥就是你的身份证明）
 *   2. 无法伪造（数学上不可能在不知道私钥的情况下伪造签名）
 *   3. 去中心化（不需要中心化的用户数据库）
 *
 * 整个流程（4 步）：
 *   1. getNonce：向服务器请求一个随机数（防止重放攻击）
 *   2. createMessage：把随机数组合成一段标准化的文字消息
 *   3. 用户在钱包里签名（RainbowKit 自动弹出签名确认框）
 *   4. verify：把签名发给服务器验证，验证通过后服务器返回 JWT token
 *
 * 什么是"重放攻击"？
 *   如果没有随机数，攻击者可以截获你之前的签名，
 *   重复提交来冒充你的身份。每次登录都用新的随机数，
 *   旧签名就无效了，所以称为"防重放"。
 * ==============================================================
 */

'use client';
// ↑ Next.js 客户端组件声明
// 这里用了 window.location（浏览器独有的 API），所以必须是客户端组件

import services from '@/services';
// ↑ 导入统一的服务层（包含了 did.getAuthNonce、did.authVerify 等方法）

import { createAuthenticationAdapter } from '@rainbow-me/rainbowkit';
// ↑ RainbowKit 提供的工厂函数，用于创建认证适配器
// 你只需要实现 getNonce、createMessage、verify、signOut 这 4 个方法，
// RainbowKit 会在合适的时机自动调用它们

import { SiweMessage } from 'siwe';
// ↑ SIWE 协议的消息类
// siwe 库提供了标准化的 SIWE 消息格式和工具

import * as GlobalStore from '@/stores/GlobalStore';
// ↑ 全局状态 store（用于在登录/登出时更新认证状态）

// createAuthenticationAdapter：RainbowKit 的认证适配器工厂
// 返回的 authenticationAdapter 对象会被传给 <RainbowKitAuthenticationProvider>
export const authenticationAdapter = createAuthenticationAdapter({
  /**
   * 第 1 步：获取随机数（Nonce）
   * 时机：用户点击"Sign In"按钮时，RainbowKit 自动调用
   * 目的：从服务器获取一个一次性随机字符串，防止重放攻击
   */
  getNonce: async () => {
    const raw = localStorage.getItem('wagmi.store');
    if (!raw) return '';

    let account = '';
    try {
      const wagmiStore = JSON.parse(raw);
      account = wagmiStore?.state?.data?.account ?? '';
    } catch {
      return '';
    }

    if (!account) return '';

    const response = await services.did.getAuthNonce(account);
    // ↑ 调用后端接口，传入钱包地址，获取该地址的登录 nonce
    // 后端会在数据库记录这个 nonce，用于后续验证

    if (response?.code === 200) {
      // ↑ 后端返回 code 200 表示成功
      return JSON.stringify(response.data);
      // ↑ 把响应数据转为字符串返回
      // response.data 包含 { nonce: 'xxx', issuedAt: '2024-...' }
    }

    return ''; // 请求失败时返回空字符串
  },

  /**
   * 第 2 步：创建待签名的消息
   * 时机：获取到 nonce 后，RainbowKit 自动调用
   * 目的：把 nonce + 地址 + 域名等信息组合成一段标准的 SIWE 消息
   *
   * @param nonce    第 1 步返回的字符串（包含 nonce 和 issuedAt）
   * @param address  用户的钱包地址（0x...）
   * @param chainId  当前连接的链 ID（主网是 1）
   */
  createMessage: ({ nonce, address, chainId }) => {
    const authNonce = JSON.parse(nonce);
    // ↑ 解析 nonce 字符串，还原为 { nonce: 'xxx', issuedAt: '...' } 对象

    const s = new SiweMessage({
      domain: window.location.host,
      // ↑ 当前网站域名（如 'etch.market'）
      // 这个字段防止"钓鱼攻击"：即使用户被骗到假网站，
      // 签名的消息里也会显示假网站的域名，用户可以看出来不对

      address,
      // ↑ 用户的以太坊地址（0x...）

      statement: 'Sign in with Ethereum to the app.',
      // ↑ 向用户展示的人类可读说明（在钱包签名界面显示）

      uri: window.location.origin,
      // ↑ 当前页面的完整 origin（如 'https://etch.market'）

      version: '1',
      // ↑ SIWE 协议版本号（目前是 1）

      chainId,
      // ↑ 链 ID（主网：1，Goerli：5）

      nonce: authNonce.nonce,
      // ↑ 随机数（防重放攻击的核心）

      issuedAt: authNonce.issuedAt,
      // ↑ 消息签发时间（服务器生成，防止时间伪造）
    });
    console.log({ s });
    // ↑ 调试日志（生产环境会被 next.config.js 的 removeConsole 自动删除）

    return s;
    // ↑ 返回 SiweMessage 对象（后续步骤会用到）
  },

  /**
   * 第 3 步：获取消息文本（用于实际签名）
   * 时机：RainbowKit 需要把消息传给钱包签名时调用
   *
   * @param message SiweMessage 对象
   * @returns       格式化后的消息字符串（用户在钱包里看到的就是这段文字）
   */
  getMessageBody: ({ message }) => {
    console.log({ message: message.prepareMessage() }, 'pre');
    return message.prepareMessage();
    // ↑ prepareMessage()：把 SiweMessage 对象转为标准格式的字符串
    // 用户在 MetaMask 的签名确认框里看到的就是这个字符串
    // 格式示例：
    //   etch.market wants you to sign in with your Ethereum account:
    //   0xAbCd...1234
    //   Sign in with Ethereum to the app.
    //   URI: https://etch.market
    //   Version: 1
    //   Chain ID: 1
    //   Nonce: abc123xyz
    //   Issued At: 2024-01-01T00:00:00.000Z
  },

  /**
   * 第 4 步：验证签名
   * 时机：用户在钱包里确认签名后，RainbowKit 自动调用
   *
   * @param message   第 2 步创建的 SiweMessage 对象
   * @param signature 用户钱包产生的签名字符串（0x...）
   * @returns         boolean：true = 验证成功，false = 验证失败
   */
  verify: async ({ message, signature }) => {
    const response = await services.did.authVerify({
      message: message.prepareMessage(), // 把消息转为字符串发给后端
      signature, // 用户的签名
    });
    // ↑ 后端收到 message + signature 后：
    //   1. 从 message 中读取 nonce，查数据库确认这个 nonce 是有效的
    //   2. 用加密算法验证：用 message 和 signature 能否还原出对应的以太坊地址
    //   3. 验证成功：说明只有持有私钥的人才能产生这个签名，即是本人

    if (response?.code === 200) {
      // 验证成功：更新全局登录状态，保存 token
      GlobalStore.setRainbowKitAuthStatus('authenticated', message.address, response.data.accessToken);
      // ↑ 三个参数：状态('authenticated')、钱包地址、JWT token
      return true; // 告知 RainbowKit：登录成功
    }

    // 验证失败：清除登录状态
    GlobalStore.setRainbowKitAuthStatus('unauthenticated', message.address, '');
    return false; // 告知 RainbowKit：登录失败
  },

  /**
   * 登出处理
   * 时机：用户点击"Sign Out"按钮时，RainbowKit 自动调用
   */
  signOut: async () => {
    GlobalStore.setRainbowKitAuthStatus('unauthenticated', '', '');
    // ↑ 清除全局状态中的登录信息（同时会清除 localStorage 中的 token）

    // await fetch('/api/logout');
    // ↑ 这行被注释掉了
    // 原因：后端可能不需要服务端登出（JWT 是无状态的，只要删本地 token 即可）
  },
});
