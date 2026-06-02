/**
 * ==============================================================
 * 文件：src/services/ethscriptions/index.ts
 * 作用：封装所有"铭文（Ethscriptions）"相关的后端 API 接口
 *
 * 设计模式：Service Class（服务类）
 *   把同一业务领域的所有接口方法集中在一个类里，
 *   调用时：services.ethscriptions.getLatestEths(params)
 *
 * 这个文件包含的接口：
 *   - getOwner：查询某地址持有的铭文列表（我的资产）
 *   - getErc20/getErc20Info：铭文 ERC-20 代币相关
 *   - getHoldersInfo：代币持有者列表
 *   - getLatestEths：最新铭文列表（首页用）
 *   - getLatestTransactions：最新交易列表（首页用）
 *   - getSearchedEths：搜索铭文
 *   - getAssetList：获取用户的综合资产（包含 ETH 链 + Facet 链）
 *
 * 重要概念：
 *   为什么方法都是 async/await？
 *   因为 HTTP 请求是异步操作（需要等待网络响应），
 *   async/await 让异步代码看起来像同步代码，更易读。
 * ==============================================================
 */

import ApiClient from '@/services/network/ApiClient';
// ↑ 基础 HTTP 客户端类

// 导入所有需要的 TypeScript 类型
// 这些类型定义了每个接口的"请求参数"和"响应数据"的结构
import {
  GetErc20ListRequest, // ERC20 代币列表请求参数
  GetErc20ListResponse, // ERC20 代币列表响应
  GetOwnerRequest, // 查询地址铭文列表请求参数
  GetOwnerResponse, // 查询地址铭文列表响应
  GetErc20InfoRequest, // ERC20 代币详情请求参数
  GetErc20InfoResponse, // ERC20 代币详情响应
  GetHoldersRequest, // 持有者列表请求参数
  GetOwnerInfoResponse, // 持有者列表响应
  GetTransfersRequest, // 转账记录请求参数
  GetTransfersInfoResponse, // 转账记录响应
  GetTokenSelectonResponse, // 代币选择列表响应
  GetEthscribeRequest, // 铭文查询请求参数
  GetEthscribeDataResponse, // 铭文查询响应
  GetRecentEthsRequest, // 最新铭文列表请求参数
  GetRecentEthsListResponse, // 最新铭文列表响应
  GetTransactionStatsResponse, // 交易统计响应
  GetRecentTransactionsRequest, // 最新交易列表请求参数
  GetRecentTransactionListResponse, // 最新交易列表响应
  GetSearchedEthsRequest, // 搜索铭文请求参数
  GetCategoryHoldersRequest, // 分类持有者请求参数
  GetErc20sListResponse, // ERC20s 列表响应
  getErc20FactoryAddressResponse, // ERC20 工厂地址响应
  AssetItem, // 资产项目类型
} from './types';
import { getQueryParams } from '../getQueryParams';
// ↑ URL 查询参数序列化工具函数

import services from '..';
// ↑ 导入整个服务层（用于在 getAssetList 中调用其他服务）
// 循环依赖注意：services/index.ts 创建了 EthscriptionsService 实例，
// 而 EthscriptionsService 又导入了 services。这在 Node.js 中通常能正常工作，
// 但如果出现循环依赖问题，可能需要重构。

import BigNumber from 'bignumber.js';
// ↑ 精确大数运算库
// 为什么需要？以太坊代币金额通常是 18 位小数的大整数，
// JavaScript 的普通 Number 类型精度不够（最多 15-16 位有效数字），
// 直接计算会导致精度丢失（金额显示错误）

import { ethers } from 'ethers';
// ↑ 以太坊工具库，这里主要用 ethers.utils.getAddress（地址格式标准化）
// 和 ethers.utils.formatUnits（Wei 转 ETH 格式）

import { ISwapTokenInfoItem } from '../marketpalce/types';
// ↑ 市场模块的代币信息类型

import { SwapLastPriceItem } from '../facet/types';
// ↑ Facet 模块的最新价格类型

/**
 * EthscriptionsService 类：铭文相关的所有 API 接口
 */
export default class EthscriptionsService {
  private apiClient: ApiClient;
  // ↑ private：只能在类内部访问（外部不能直接 service.apiClient.get()）
  // 这是封装性的体现：外部只能用 service.getLatestEths() 等方法，不关心底层实现

  constructor(apiClient: ApiClient) {
    // ↑ 依赖注入：外部传入已配置好的 apiClient
    this.apiClient = apiClient;
  }

  /**
   * 获取某地址持有的铭文列表
   * 用途：个人资产页（/owner/[address]）
   *
   * 特别之处：把 address 从参数中取出，放在 URL 路径里（而不是查询参数）
   * 为什么：REST API 惯例，资源路径表示"是谁的"，查询参数表示"怎么过滤/分页"
   */
  async getOwner(data: GetOwnerRequest): Promise<GetOwnerResponse> {
    const { address, ...props } = data;
    // ↑ 解构赋值：把 address 单独取出，剩余属性收集到 props
    // ...props 是"剩余语法"（rest syntax），类似 Python 的 **kwargs

    const queryParams = getQueryParams(props as any);
    // ↑ 把分页、过滤等参数转为查询字符串
    // as any 是临时类型断言，跳过 TypeScript 的类型检查（实际项目中应避免滥用）

    return await this.apiClient.get<GetOwnerResponse>(`/ethscriptions/address/${address}?${queryParams}`);
    // ↑ 模板字符串拼接 URL：`/ethscriptions/address/0xABCD...?page.size=20&page.index=1`
  }

  /** 获取 ERC-20 铭文代币列表 */
  async getErc20(data: GetErc20ListRequest): Promise<GetErc20ListResponse> {
    const queryParams = getQueryParams(data as any);
    return await this.apiClient.get<GetErc20ListResponse>(`/ethscriptions/erc20?${queryParams}`);
  }

  /** 获取单个 ERC-20 代币的详细信息（如总量、进度等） */
  async getErc20Info(data: GetErc20InfoRequest): Promise<GetErc20InfoResponse> {
    const queryParams = getQueryParams(data as any);
    return await this.apiClient.get<GetErc20InfoResponse>(`/ethscriptions/erc20/info?${queryParams}`);
  }

  /** 获取 ERC-20 代币的持有者列表 */
  async getHoldersInfo(data: GetHoldersRequest): Promise<GetOwnerInfoResponse> {
    const queryParams = getQueryParams(data as any);
    return await this.apiClient.get<GetOwnerInfoResponse>(`/ethscriptions/erc20/holders?${queryParams}`);
  }

  /** 获取集合（NFT 类）的持有者列表 */
  async getCategoryHoldersInfo(data: GetCategoryHoldersRequest): Promise<GetOwnerInfoResponse> {
    const queryParams = getQueryParams(data as any);
    return await this.apiClient.get<GetOwnerInfoResponse>(`/markets/collections/holders?${queryParams}`);
    // ↑ 注意：这个接口路径在 /markets/ 下，不在 /ethscriptions/ 下
  }

  /** 获取 ERC-20 代币的转账记录 */
  async getTransfersInfo(data: GetTransfersRequest): Promise<GetTransfersInfoResponse> {
    const queryParams = getQueryParams(data as any);
    return await this.apiClient.get<GetTransfersInfoResponse>(`/ethscriptions/erc20/transfers?${queryParams}`);
  }

  /** 获取某地址可供选择的代币集合列表（用于 Swap 的代币选择下拉框） */
  async getTokenSelections(owner: string): Promise<GetTokenSelectonResponse> {
    return await this.apiClient.get<GetTokenSelectonResponse>(`/ethscriptions/collections/${owner}`);
  }

  /** 查询铭文代币的 ethscribe 信息（铭文原始数据） */
  async getEthscribe(data: GetEthscribeRequest): Promise<GetEthscribeDataResponse> {
    const queryParams = getQueryParams(data as any);
    return await this.apiClient.get<GetEthscribeDataResponse>(`/ethscriptions/erc20/ethscribe?${queryParams}`);
  }

  /**
   * 获取最新铭文列表（首页左侧列表）
   * 实时刷新，展示最近刻录的铭文
   */
  async getLatestEths(data: GetRecentEthsRequest): Promise<GetRecentEthsListResponse> {
    const queryParams = getQueryParams(data as any);
    return await this.apiClient.get<GetRecentEthsListResponse>(`/ethscriptions/latest?${queryParams}`);
  }

  /**
   * 获取最新交易记录（首页右侧列表）
   * 展示最近发生的铭文买卖交易
   */
  async getLatestTransactions(data: GetRecentTransactionsRequest): Promise<GetRecentTransactionListResponse> {
    const queryParams = getQueryParams(data as any);
    return await this.apiClient.get<GetRecentTransactionListResponse>(
      `/ethscriptions/transactions/latest?${queryParams}`,
    );
  }

  /** 获取交易统计数据（如 24h 交易量、总交易数等） */
  async getTransactionStats(): Promise<GetTransactionStatsResponse> {
    return await this.apiClient.get<GetTransactionStatsResponse>(`/ethscriptions/transactions/stats`);
    // ↑ 这个接口不需要参数，直接 get 即可
  }

  /**
   * 搜索铭文（搜索结果页）
   * 注意：搜索接口超时时间设置为 20 秒（比默认的 10 秒更长）
   * 原因：搜索涉及全文检索，可能比普通查询慢
   */
  async getSearchedEths(data: GetSearchedEthsRequest): Promise<GetRecentEthsListResponse> {
    const queryParams = getQueryParams(data as any);
    return await this.apiClient.get<GetRecentEthsListResponse>(`/ethscriptions/search?${queryParams}`, {
      timeout: 20 * 1000, // 20 秒超时（覆盖默认的 10 秒）
    });
  }

  /** 获取 ERC-20s 代币列表（新版铭文代币协议） */
  async getErc20sList(data: GetErc20ListRequest): Promise<GetErc20sListResponse> {
    const queryParams = getQueryParams(data as any);
    return await this.apiClient.get<GetErc20sListResponse>(`/ethscriptions/erc20s?${queryParams}`);
  }

  /** 获取 ERC-20s 代币部署工厂合约地址 */
  async getErc20FactoryAddress(): Promise<getErc20FactoryAddressResponse> {
    return await this.apiClient.get<getErc20FactoryAddressResponse>('/ethscriptions/erc20s/factory');
  }

  /**
   * ★ 获取用户的综合资产列表
   * 这是最复杂的接口方法，需要聚合多个来源的数据：
   *   1. EtchMarket 后端：用户在以太坊主链的铭文代币余额
   *   2. Facet 链：用户在 Facet 网络上的代币余额 + 价格信息
   *
   * 并行请求优化：使用 Promise.all 同时发起多个请求（而不是串行等待），
   * 大幅减少总等待时间。
   *
   * @param data - { owner: 用户钱包地址 }
   * @returns    - 统一格式的资产列表（包含名称、数量、美元价值等）
   */
  async getAssetList(data: { owner: string }): Promise<AssetItem[]> {
    const { owner } = data;

    // 第 1 步：获取 ERC-20 集合的详情（需要其中的 Facet 路由地址）
    const collectionDetail = await services.marketplace.getCollectionDetail({
      category: 'token',
      collectionName: 'erc-20 eths',
    });

    // 第 2 步：并行请求两个数据源（Promise.all 让两个请求同时发出）
    // 效率对比：
    //   串行：请求1耗时 + 请求2耗时（如 2s + 1s = 3s）
    //   并行：max(请求1耗时, 请求2耗时)（如 max(2s, 1s) = 2s）
    const [etchAssset, facetAsset] = await Promise.all([
      services.marketplace.getCollectionOwnerList({
        category: 'token',
        tokenQuery: '',
        address: owner,
      }),
      // ↑ 从 EtchMarket 后端获取用户在以太坊链上的代币余额

      services.facet.getPairs({
        router: collectionDetail.data.collections.facetStat.routerAddress,
        account: owner,
      }),
      // ↑ 从 Facet 链获取用户在 Facet 网络上的代币对信息
    ]);

    const assetList: AssetItem[] = [];
    // ↑ 最终返回的资产列表（两个来源的数据都会 push 进来）

    // 第 3 步：处理 Facet 链资产
    let facetAssetList = Object.values(facetAsset);
    // ↑ Object.values：把对象的"所有值"提取为数组
    // facetAsset 的格式是 { '0xabc': { balance, address, name... }, ... }

    facetAssetList = facetAssetList.filter((item) => new BigNumber(item.balance).gt(0));
    // ↑ 过滤掉余额为 0 的代币（只展示有余额的）
    // new BigNumber(item.balance).gt(0)：BigNumber 的大于比较（gt = greater than）
    // 为什么用 BigNumber 而不是 item.balance > 0？
    // 因为 balance 是很大的整数字符串（如 "1000000000000000000"），
    // 普通 JS 的数字比较会丢失精度

    // 第 4 步：获取代币价格信息（需要先知道 facetAssetList 里有哪些代币地址）
    const tokenInfo = await services.marketplace.getSwapTokensInfo({
      tokenAddresses: facetAssetList.map((item) => item.address),
      // ↑ map：提取每个代币的合约地址，组成地址数组
    });

    // 第 5 步：获取代币最新兑换价格
    const tokenSwapLastPrice = await services.facet.getLastSwapPrice({
      token_addresses: facetAssetList.map((item) => item.address),
      eth_contract_address: collectionDetail.data.collections.facetStat.ethAddress,
      router_address: collectionDetail.data.collections.facetStat.routerAddress,
    });

    // 第 6 步：把数组转为对象（以合约地址为 key），方便后续 O(1) 查找
    let tokenInfoObj: { [key in string]: ISwapTokenInfoItem } = {};
    tokenInfo.data.tokens.forEach((item) => {
      tokenInfoObj[ethers.utils.getAddress(item.contractAddress)] = item;
      // ↑ ethers.utils.getAddress：把地址转为 EIP-55 校验和格式（混合大小写）
      // 目的：统一地址格式，避免 '0xabc' 和 '0xABC' 被当成不同的 key
    });

    let tokenSwapLastPriceObj: { [key in string]: SwapLastPriceItem } = {};
    tokenSwapLastPrice.result.forEach((item) => {
      tokenSwapLastPriceObj[ethers.utils.getAddress(item.token_address)] = item;
    });

    // 第 7 步：整合 Facet 代币数据，计算美元价值
    facetAssetList.map((item) => {
      const decimals = tokenInfoObj[ethers.utils.getAddress(item.address)].decimals;
      // ↑ 获取代币精度（如 18 位小数）

      const priceUsd = new BigNumber(tokenInfo.data.ethPrice)
        .multipliedBy(
          ethers.utils.formatUnits(tokenSwapLastPriceObj[ethers.utils.getAddress(item.address)].last_swap_price),
          // ↑ formatUnits：把 Wei 格式的价格转为 ETH 格式的小数
          // 乘以 ETH 的美元价格，得到该代币的美元价格
        )
        .toString(10);
      // ↑ .toString(10)：把 BigNumber 转为十进制字符串（避免科学计数法）

      console.log(priceUsd, item.balance);
      // ↑ 调试日志（生产环境会被 next.config.js 的 removeConsole 删除）

      assetList.push({
        name: item.name,
        symbol: item.symbol,
        priceUsd,
        amount: item.balance,
        valueUsd: new BigNumber(priceUsd).multipliedBy(item.balance).toString(10),
        // ↑ 美元总价值 = 单价 × 数量
        category: 'facet', // 标记来源：Facet 链
        contractAddress: item.address,
        icon: '', // Facet 代币暂无图标
        decimals,
        bridgedToken: tokenInfoObj[ethers.utils.getAddress(item.address)].bridgedToken,
        // ↑ bridgedToken：对应的以太坊主链代币地址（跨链桥相关）
      });
    });

    // 第 8 步：整合 EtchMarket（以太坊链）代币数据
    if (etchAssset.code == 200 && etchAssset.data.collections.length > 0) {
      etchAssset.data.collections
        .filter((item) => new BigNumber(item.verifiedAmt).gt(0))
        // ↑ 只处理已验证余额 > 0 的代币
        .map((item) => {
          assetList.push({
            name: item.collectionName,
            symbol: item.collectionName.split(' ')[1],
            priceUsd: String(item.floorPrice),
            amount: String(item.verifiedAmt),
            valueUsd: String(item.value),
            category: 'ethereum',
            contractAddress: '',
            icon: item.icon,
          });
        });
    }

    return assetList;
  }
}
