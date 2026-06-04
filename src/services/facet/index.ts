/**
 * ==============================================================
 * 文件：src/services/facet/index.ts
 * 作用：Facet L2 链上 DEX（去中心化交易所）的 API 封装
 *
 * 什么是 Facet？
 *   以太坊 L2 网络，Gas 更低。本项目的 Swap 功能基于 Facet 上的 Uniswap V2 风格 AMM。
 *   与主网 EtchMarket API 不同，Facet 有独立后端 → 使用 facetClient（见 services/index.ts）
 *
 * 核心能力：
 *   1. getBalance    → 查某 ERC20 代币余额（通过 Facet API 的 static-call 模拟链上读）
 *   2. getPairs      → 查用户在所有交易对中的余额、授权量、TVL（Swap 页数据源）
 *   3. getSimulate   → 模拟 Swap 报价（输入数量 → 预估输出，不发真实交易）
 *   4. getLastSwapPrice → 批量查代币最新成交价（K 线、价格展示用）
 *
 * getPairs 的数据转换逻辑（重点）：
 *   后端返回 PairsData（以 pair 地址为 key 的对象）
 *   前端需要 ISwapTokenData（以 token 地址为 key，方便 SelectToken 组件 lookup）
 *   forEach 里把每个 pair 的 token0/token1 扁平化到 tokenList
 *   FETH 是 Facet 原生代币，避免重复添加（index>0 时跳过 FETH 侧）
 * ==============================================================
 */

import ApiClient from '@/services/network/ApiClient';
import qs from 'qs';

import {
  GetBalanceResponse,
  GetBalanceRequest,
  GetPairsRequest,
  PairsData,
  GetSimulateRequest,
  GetSimulateResponse,
  ISwapTokenData,
  GetLastSwapPriceRequest,
  GetSwapLastPriceResponse,
} from './types';
import { getQueryParams } from '../getQueryParams';
import { AxiosRequestConfig } from 'axios';
import { FACET_CONFIG } from '@/constants/config';

export default class FacetService {
  private apiClient: ApiClient;

  constructor(apiClient: ApiClient) {
    this.apiClient = apiClient;
  }

  /**
   * 查询 ERC20 代币余额
   * 通过 Facet API 的 static-call 端点模拟合约 balanceOf(account)
   * contract 为空时直接返回 '0'（避免无效请求）
   */
  async getBalance(data: GetBalanceRequest): Promise<string> {
    const { contract, account } = data;

    if (contract == '') {
      return '0';
    }
    const response = await this.apiClient.get<GetBalanceResponse>(
      `/contracts/${contract}/static-call/balanceOf?args={"arg0":"${account}"}`,
    );
    return response.result;
  }

  /**
   * 获取 Swap 页所需的全部交易对 + 用户余额/授权数据
   * 返回以 token 地址为 key 的字典，供 SwapContainer 下拉选币和余额展示
   */
  async getPairs(data: GetPairsRequest): Promise<ISwapTokenData> {
    const { router, account } = data;

    try {
      const response = await this.apiClient.get<PairsData>(
        `/contracts/pairs_for_router?user_address=${account}&router=${router}&v=2`,
      );

      let tokenList: ISwapTokenData = {};

      const responseValues = Object.values(response);
      responseValues.forEach((item, index) => {
        // 第一对：同时收录 token0 和 token1（通常含 FETH + 某铭文代币）
        if (index == 0) {
          tokenList[item.token0.address] = {
            ...item.token0,
            balance: item.user_balances.token0,
            allowances: item.user_allowances.token0,
            tvl_in_weth: item.tvl_in_weth,
          };
          tokenList[item.token1.address] = {
            ...item.token1,
            balance: item.user_balances.token1,
            allowances: item.user_allowances.token1,
            tvl_in_weth: item.tvl_in_weth,
          };
        } else if (item.token0.address !== FACET_CONFIG.FETH_ADDRESS) {
          // 后续 pair：跳过 FETH 重复项，只加「非 FETH」的 token0
          tokenList[item.token0.address] = {
            ...item.token0,
            balance: item.user_balances.token0,
            allowances: item.user_allowances.token0,
            tvl_in_weth: item.tvl_in_weth,
          };
        } else if (item.token1.address !== FACET_CONFIG.FETH_ADDRESS) {
          tokenList[item.token1.address] = {
            ...item.token1,
            balance: item.user_balances.token1,
            allowances: item.user_allowances.token1,
            tvl_in_weth: item.tvl_in_weth,
          };
        }
      });
      return tokenList;
    } catch (error) {
      // 钱包未连接或 Facet API 异常时返回空对象，UI 显示「无数据」而非崩溃
      return {};
    }
  }

  /** 模拟 Swap：给定输入代币/数量/路径，返回预估输出（滑点计算前） */
  async getSimulate(data: GetSimulateRequest, config?: AxiosRequestConfig): Promise<GetSimulateResponse> {
    const params = getQueryParams(data as any);
    const response = await this.apiClient.get<GetSimulateResponse>(`/contracts/simulate?${params}`, config);
    return response;
  }

  /** 批量查询代币最新 Swap 价格（K 线、历史列表用） */
  async getLastSwapPrice(
    data: GetLastSwapPriceRequest,
    config?: AxiosRequestConfig,
  ): Promise<GetSwapLastPriceResponse> {
    const params = qs.stringify(data, { arrayFormat: 'comma' });
    const response = await this.apiClient.get<GetSwapLastPriceResponse>(`/tokens/token_prices?${params}`, config);
    return response;
  }
}
