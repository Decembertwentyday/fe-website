// ============================================================================
// 【DID 服务层】去中心化身份认证接口
// ----------------------------------------------------------------------------
// 做什么：
//   实现 "钱包签名登录" 的完整流程，包含 3 个接口：
//     1) getAuthNonce  → 服务端返回随机字符串（防重放攻击）
//     2) authVerify    → 提交 "地址 + 签名"，服务端验证后返回 JWT token
//     3) getUserInfo   → 用 token 拉取用户信息（昵称、头像等）
//
// 什么是 DID（Decentralized Identifier）：
//   去中心化身份标识。在 Web3 里就是用 "钱包地址 + 签名" 当作身份证明，
//   代替传统的 "用户名 + 密码"。优点：无需注册、不泄漏隐私、跨平台通用。
//
// 完整登录流程（前端 → 后端）：
//   1. 用户点击 "Connect Wallet" → 钱包弹窗 → 获得地址 0xABC...
//   2. 前端调用 getAuthNonce('0xABC') → 后端返回 nonce="random_string_xyz"
//   3. 前端用钱包对 nonce 进行签名 → 得到 signature
//   4. 前端调用 authVerify({address, signature, nonce}) → 后端用密码学验证
//      （验证这个签名确实是该地址的私钥所签）→ 返回 JWT token
//   5. 前端把 token 存起来（cookie / localStorage），后续请求都带上
//   6. 前端调用 getUserInfo(address) → 返回用户资料
//
// 为什么需要 nonce（一次性随机数）？
//   防止 "重放攻击"。如果不用 nonce，黑客窃取到签名后可以无限次重放该签名登录。
//   每个 nonce 只能用一次，服务端验证后立刻失效。
//
// 注意：类名 MarketplaceService 是历史命名遗留（早期可能跟 marketplace 模块共用），
//   现在的实际职责是 DID 认证，不要被名字误导。
// ============================================================================

import ApiClient from '@/services/network/ApiClient';
import { AuthVerifyRequest, AuthVerifyResponse, GetAuthNonceResponse, UserInfoDataResponse } from './types';

export default class MarketplaceService {
  private apiClient: ApiClient;

  constructor(apiClient: ApiClient) {
    this.apiClient = apiClient;
  }

  /**
   * 第 1 步：获取认证 nonce（一次性随机字符串）
   * 入参：用户钱包地址
   * 出参：服务端生成的 nonce 字符串（前端用它生成签名）
   * 安全性：每个地址每次请求都会得到新的 nonce，旧 nonce 自动失效
   */
  async getAuthNonce(address: string): Promise<GetAuthNonceResponse> {
    return await this.apiClient.get<GetAuthNonceResponse>(`/did/auth/nonce?address=${address}`);
  }

  /**
   * 第 2 步：提交签名进行身份验证
   * 入参：data 含 address（地址）、signature（签名）、nonce（之前取到的随机数）
   * 出参：JWT token（后续请求需要带 Authorization: Bearer <token>）
   * 原理：服务端用密码学验证 "该签名确实是该地址的私钥对该 nonce 所签"
   */
  async authVerify(data: AuthVerifyRequest): Promise<AuthVerifyResponse> {
    return await this.apiClient.post<{}, AuthVerifyResponse>(`/did/auth/verify`, data);
  }

  /**
   * 第 3 步：根据地址查询用户信息
   * 入参：用户钱包地址
   * 出参：用户资料（昵称、头像、ENS 名等）
   * 注意：这个接口不一定需要 token（公开查询），但如果用户已登录会得到更多数据
   */
  async getUserInfo(address: string): Promise<UserInfoDataResponse> {
    return await this.apiClient.get<UserInfoDataResponse>(`/did/${address}`);
  }
}
