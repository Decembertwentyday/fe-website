// ============================================================================
// 【VaultService】金库 & 质押 API 服务层
// ----------------------------------------------------------------------------
// 职责：
//   封装所有与"金库（Vault）"和"质押（Staking）"相关的 HTTP 请求。
//   金库是铭文质押/赎回的底层系统，用户可以把铭文存入金库换取 Facet 代币（质押），
//   也可以赎回（Redeem）取回铭文。
//
// 接口分类：
//   金库相关：getVaultList / getVaultBalance / getVaultEthscription / postVaultRedeem / getVaultWithdraw
//   质押相关：getStakingStatic / getStakingRank / getStakingRecord
//
// 特殊接口 getVaultWithdraw：
//   轮询接口（Polling）—— 铭文提取需要后端异步生成可信签名（trustedSignature）。
//   循环请求，每 2 秒一次，直到 trustedSignature 非空才停止，然后用签名去链上完成提取。
//   这是 Web3 项目中处理"后端异步任务"的常见模式。
// ============================================================================

import ApiClient from '@/services/network/ApiClient';
import {
  GetVaultEthscriptionRequest,
  GetVaultBalanceRequest,
  GetVaultBalanceResponse,
  GetVaultListRequest,
  GetVaultListResponse,
  GetVaultBalanceDataResponse,
  GetStakingStaticDataResponse,
  GetStakingRankRequest,
  GetStakingRankDataResponse,
  GetStakingRecordRequest,
  GetStakingRecordDataResponse,
  PostVaultRedeemRequest,
  PostVaultRedeemDataResponse,
  GetVaultWidthdrawDataResponse,
  GetVaultWidthdrawData,
} from './types';
import { getQueryParams } from '../getQueryParams';
import delay from '@/utils/delay';

export default class VaultService {
  private apiClient: ApiClient;

  constructor(apiClient: ApiClient) {
    this.apiClient = apiClient;
  }

  // 获取金库中的铭文列表（某用户在某集合的质押铭文）
  // GET /vaults/ethscriptions?category=xx&collection=xx&owner=xx&page.xx
  async getVaultList(data: GetVaultListRequest): Promise<GetVaultListResponse> {
    const queryParams = getQueryParams(data as any);
    return await this.apiClient.get<GetVaultListResponse>(`/vaults/ethscriptions?${queryParams}`);
  }

  // 获取用户的金库余额
  // available：可用余额，transferable：可转账余额，stakingLockRatio：质押锁仓比例
  // GET /vaults/balance/{address}?collection=xx
  async getVaultBalance(data: GetVaultBalanceRequest): Promise<GetVaultBalanceResponse> {
    const { address, ...props } = data;
    const queryParams = getQueryParams(props as any);
    return await this.apiClient.get<GetVaultBalanceResponse>(`/vaults/balance/${address}?${queryParams}`);
  }

  // 获取金库铭文详情（split = 拆分/分批操作，用于赎回前的数据准备）
  // GET /vaults/ethscriptions/split?collection=xx&address=xx&nonce=xx&amount=xx
  async getVaultEthscription(data: GetVaultEthscriptionRequest): Promise<GetVaultBalanceDataResponse> {
    const queryParams = getQueryParams(data as any);
    return await this.apiClient.get<GetVaultBalanceDataResponse>(`/vaults/ethscriptions/split?${queryParams}`);
  }

  // 获取质押统计数据（总质押人数、TVL、累计奖励等）
  // GET /staking/statistics/{collection}
  async getStakingStatic(collection: string): Promise<GetStakingStaticDataResponse> {
    return await this.apiClient.get<GetStakingStaticDataResponse>(`/staking/statistics/${collection}`);
  }

  // 获取质押排行榜（按质押量排序）
  // collection 作为路径参数，其余分页参数作为 querystring
  // GET /staking/ranking/{collection}?page.xx
  async getStakingRank(data: GetStakingRankRequest): Promise<GetStakingRankDataResponse> {
    const { collection, ...props } = data;
    const queryParams = getQueryParams(props as any);
    return await this.apiClient.get<GetStakingRankDataResponse>(`/staking/ranking/${collection}?${queryParams}`);
  }

  // 获取某地址的质押记录（某用户质押了哪些铭文）
  // owner 作为路径参数，其余分页参数作为 querystring
  // GET /staking/records/{owner}?collection=xx&page.xx
  async getStakingRecord(data: GetStakingRecordRequest): Promise<GetStakingRecordDataResponse> {
    const { owner, ...props } = data;
    const queryParams = getQueryParams(props as any);
    return await this.apiClient.get<GetStakingRecordDataResponse>(`/staking/records/${owner}?${queryParams}`);
  }

  // 发起赎回请求（把铭文从金库中取回）
  // 赎回需要提供签名（signature），后端验证后生成 trustedSignature 供链上操作
  // POST /vaults/ethscriptions/redeem
  async postVaultRedeem(data: PostVaultRedeemRequest): Promise<PostVaultRedeemDataResponse> {
    return await this.apiClient.post<{}, PostVaultRedeemDataResponse>('/vaults/ethscriptions/redeem', data);
  }

  // ★ 轮询获取提取签名（异步等待后端生成 trustedSignature）
  // 铭文提取（Withdraw）是异步操作：
  //   1. 先调用 postVaultRedeem 发起请求
  //   2. 后端异步生成可信签名
  //   3. 本函数轮询检查签名是否已生成
  //   4. 签名生成后，前端用签名去链上完成提取
  //
  // 轮询策略：
  //   - 每次请求后检查 trustedSignature 是否非空
  //   - 若为空，等待 2000ms（delay(2000)）再试
  //   - 若非空，返回数据（调用方得到签名后继续链上操作）
  //   - 若接口报错，抛出异常（停止轮询）
  async getVaultWithdraw(orderHash: string): Promise<GetVaultWidthdrawData | undefined> {
    const queryParams = getQueryParams({ orderHash });
    let isRequest = true; // 控制循环的标志

    while (isRequest) {
      const response = await this.apiClient.get<GetVaultWidthdrawDataResponse>(
        `/vaults/ethscriptions/withdraw?${queryParams}`,
      );

      if (response?.code == 200) {
        if (response.data.trustedSignature.trim() != '') {
          isRequest = false; // 签名已生成，停止轮询
          return response.data;
        } else {
          await delay(2000); // 签名尚未生成，等 2 秒再试
        }
      } else {
        throw Error(response.message);
      }
    }
  }
}
