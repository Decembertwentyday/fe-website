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

  async getPairs(data: GetPairsRequest): Promise<ISwapTokenData> {
    const { router, account } = data;

    try {
      const response = await this.apiClient.get<PairsData>(
        `/contracts/pairs_for_router?user_address=${account}&router=${router}&v=2`,
      );

      let tokenList: ISwapTokenData = {};

      const responseValues = Object.values(response);
      responseValues.forEach((item, index) => {
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
      return {};
    }
  }

  async getSimulate(data: GetSimulateRequest, config?: AxiosRequestConfig): Promise<GetSimulateResponse> {
    const params = getQueryParams(data as any);
    const response = await this.apiClient.get<GetSimulateResponse>(`/contracts/simulate?${params}`, config);
    return response;
  }

  async getLastSwapPrice(
    data: GetLastSwapPriceRequest,
    config?: AxiosRequestConfig,
  ): Promise<GetSwapLastPriceResponse> {
    const params = qs.stringify(data, { arrayFormat: 'comma' });
    const response = await this.apiClient.get<GetSwapLastPriceResponse>(`/tokens/token_prices?${params}`, config);
    return response;
  }
}
