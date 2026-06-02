/**
 * ============================================================
 * 文件说明：市场（Marketplace）服务层
 *
 * 这是整个项目里**接口最多、最核心**的服务类。
 * 负责所有与"市场"相关的 API 请求，包括：
 *   - NFT 挂单列表查询
 *   - 上架（Listing）/ 下架 / 购买
 *   - 集合（Collection）信息
 *   - 购物车（Cart）订单验证
 *   - 交易历史
 *   - ETH 价格（用于显示美元价值）
 *   - Swap 兑换相关
 *
 * 注意：文件夹名 "marketpalce" 是 "marketplace" 的拼写错误（typo），
 * 属于历史遗留，不影响运行，改名会影响很多引用，暂时保留。
 *
 * 设计模式：依赖注入（Dependency Injection）
 *   构造函数接收 apiClient 参数，而不是直接 import etchClient
 *   好处：测试时可以传入 mock 客户端，不需要真实网络
 * ============================================================
 */

import ApiClient from '@/services/network/ApiClient';
// ↑ 基础 HTTP 客户端类（封装了 get/post/put/patch/delete 方法）
import {
  GetMarketListedRequest,
  GetMarketListedResponse,
  GetMyEthscriptionsRequest,
  GetMyEthscriptionsResponse,
  GetOrderDataResponse,
  GetOrderNonceDataResponse,
  ListingRequest,
  ListingResponse,
  GetCollectionListRequest,
  GetCollectionListReponse,
  GetHistoryOrderRequest,
  GetHistoryOrderReponse,
  GetCollectionOwnerListRequest,
  GetCollectionOwnerListReponse,
  GetWithdrawDataResponse,
  GetEthscribeRequest,
  GetEthscribeDataReponse,
  GetOrderNonceRequest,
  GetEthPriceDataReponse,
  GetCollectionDetailRequest,
  GetCollectionDetailReponse,
  GetOrderByCartDataResponse,
  GetOrderByCartData,
  GetEthscriptionAssetResponse,
  GetEthscriptionActivityResponse,
  ListingBulkRequest,
  GetWithdrawDataBulkResponse,
  MarketChartRequest,
  MarketChartResponse,
  GetSwapActivityRequest,
  GetSwapActivityResponse,
  GetSwapTokensInfoResponse,
  GetSwapTokensInfoRequest,
} from './types';
// ↑ 导入所有请求参数类型和响应类型（TypeScript 类型安全）
// 命名规范：Get开头 = 查询操作，Listing = 上架操作

import { getQueryParams } from '../getQueryParams';
// ↑ 工具函数：把 JS 对象 { page: 1, size: 10 } 转成 URL 查询字符串 "page=1&size=10"

export default class MarketplaceService {
  // ↑ 用 class 来组织所有市场相关的 API 方法
  // "export default" 意味着这个文件只导出一个东西（这个类本身）

  private apiClient: ApiClient;
  // ↑ private = 私有属性，只有类内部可以访问
  // 这是依赖注入的核心：把 HTTP 客户端当作外部依赖传进来，不在内部创建

  constructor(apiClient: ApiClient) {
    // ↑ constructor = 构造函数，new MarketplaceService(etchClient) 时自动执行
    this.apiClient = apiClient;
    // ↑ 把外部传入的 apiClient 保存到 this.apiClient，供类的方法使用
  }

  // ─────────────────────────────────────────────────────────────
  // 市场列表相关
  // ─────────────────────────────────────────────────────────────

  async getMarketList(data: GetMarketListedRequest): Promise<GetMarketListedResponse> {
    // ↑ 获取市场上架列表（NFT 挂单列表）
    // 参数：过滤条件（集合、价格范围、排序等）
    const queryParams = getQueryParams(data as any);
    // ↑ 把筛选条件对象转成 URL 参数字符串
    // "as any" 是临时绕过 TypeScript 类型检查（不推荐但常见）
    return await this.apiClient.get<GetMarketListedResponse>(`/markets/ethscriptions/listed?${queryParams}`);
    // ↑ 发 GET 请求，<GetMarketListedResponse> 是泛型，告诉 TypeScript 返回值的类型
  }

  async getMyEthscriptions(data: GetMyEthscriptionsRequest): Promise<GetMyEthscriptionsResponse> {
    // ↑ 获取某个钱包地址拥有的所有铭文（"我的资产"页面使用）
    const { owner, ...props } = data;
    // ↑ 解构：把 owner（钱包地址）单独拿出来，剩余参数放在 props 里
    // 原因：owner 要放在 URL 路径里（/address/:owner），其他参数放在查询字符串里
    const queryParams = getQueryParams(props as any);
    return await this.apiClient.get<GetMyEthscriptionsResponse>(
      `/markets/ethscriptions/address/${owner}?${queryParams}`,
      // ↑ RESTful URL 设计：把资源 ID（钱包地址）放在路径里，而不是查询参数里
    );
  }

  async getWithdrawBulk(ethscriptionIds: string[]): Promise<GetWithdrawDataBulkResponse> {
    // ↑ 批量提取（撤销上架）多个铭文，获取提取所需的签名数据
    // 场景：用户批量下架多个 NFT 时调用
    return await this.apiClient.post<{ ethscriptionIds: string[] }, GetWithdrawDataBulkResponse>(
      `/markets/ethscriptions/withdraw/bulk`,
      {
        ethscriptionIds,
        // ↑ 简写语法：等价于 { ethscriptionIds: ethscriptionIds }
        // 要提取的铭文 ID 数组放在请求体（body）里，不放 URL 里
        // 原因：铭文 ID 是 bytes32 的哈希值，数组可能很长，不适合放 URL
      },
    );
  }

  async getOrderNonce(data: GetOrderNonceRequest): Promise<GetOrderNonceDataResponse> {
    // ↑ 获取用户的订单 nonce 值
    // 什么是 nonce？= 用于防重放攻击的递增数字（每次下单后 +1）
    // 用途：创建挂单时，nonce 必须是最新值，防止旧签名被重复使用
    const { address, ...props } = data;
    const queryParams = getQueryParams(props as any);
    return await this.apiClient.get<GetOrderNonceDataResponse>(`/markets/order/metadata/${address}?${queryParams}`);
  }

  async getWithdraw(ethscriptionId: string): Promise<GetWithdrawDataResponse> {
    // ↑ 获取单个铭文的提取数据（撤销上架时需要的签名信息）
    // 返回的数据包含后端签名，用于调用合约的 withdrawEthscription 函数
    return await this.apiClient.get<GetWithdrawDataResponse>(`/markets/ethscriptions/withdraw/${ethscriptionId}`);
  }

  async getOrderID(orderId: string): Promise<GetOrderDataResponse> {
    // ↑ 根据订单 ID 获取订单详情（单个订单的完整信息）
    return await this.apiClient.get<GetOrderDataResponse>(`/markets/order/${orderId}`);
  }

  async getOrderIDByCart(orderIds: string[]): Promise<GetOrderByCartData | null> {
    // ↑ 购物车结算前，验证购物车里所有订单的有效性
    // 参数：购物车里所有订单的 ID 数组
    // 返回：有效订单在前，无效订单（已成交/已撤销）在后
    const response = await this.apiClient.post<{}, GetOrderByCartDataResponse>('/markets/cart/orders', {
      orderIds,
      // ↑ 把所有订单 ID 一次性发给后端，后端批量查询状态（比逐个查询效率高）
    });

    const efficientList: GetOrderByCartData['orders'] = [];   // ← 有效订单列表
    const invalidList: GetOrderByCartData['orders'] = [];     // ← 无效订单列表

    if (response?.code == 200) {
      response.data.orders.forEach((item, index) => {
        // ↓ 被注释掉的测试代码：模拟第一个订单无效（用于开发调试）
        // if (index == 0) {
        //   item.order.signature = '';
        // }

        if (item.order.signature.trim() == '') {
          // ↑ 判断订单是否有效：signature（签名）为空字符串 = 订单已失效
          // 原因：后端在订单成交后会清空 signature，前端以此判断是否还能购买
          invalidList.push(item);
          // ↑ 无效订单放到末尾，让用户看到哪些已经买不了了
        } else {
          efficientList.push(item);
          // ↑ 有效订单放到前面，让用户优先看到
        }
      });

      response.data.orders = efficientList.concat(invalidList);
      // ↑ 重组顺序：有效 + 无效（按购买顺序展示给用户）
      // concat 不修改原数组，返回新数组赋值

      return response.data;
    }

    return null;
    // ↑ 请求失败时返回 null，调用方需要处理 null 情况
  }

  // ─────────────────────────────────────────────────────────────
  // 挂单（Listing）相关
  // ─────────────────────────────────────────────────────────────

  async addListing(data: ListingRequest): Promise<ListingResponse> {
    // ↑ 单个铭文上架（卖家填写价格后调用）
    // 上架流程：前端生成 EIP-712 签名 → 后端验证签名 → 记录挂单
    return await this.apiClient.post<{}, ListingResponse>(`/markets/ethscriptions/listing`, data);
  }

  async addListingBulk(data: ListingBulkRequest): Promise<ListingResponse> {
    // ↑ 批量上架（批量挂单功能，一次处理多个铭文）
    return await this.apiClient.post<{}, ListingResponse>(`/markets/ethscriptions/bulk_listing`, data);
  }

  async editListing(data: ListingRequest): Promise<ListingResponse> {
    // ↑ 修改挂单价格（卖家想改价格时调用，实质是撤销旧挂单并创建新挂单）
    return await this.apiClient.post<{}, ListingResponse>(`/markets/ethscriptions/edit/listing`, data);
  }

  async marketChart(data: MarketChartRequest): Promise<MarketChartResponse> {
    // ↑ 获取市场价格图表数据（用于绘制集合历史价格折线图）
    const queryParams = getQueryParams(data as any);
    return await this.apiClient.get<MarketChartResponse>(`/markets/market_chart?${queryParams}`);
  }

  // ─────────────────────────────────────────────────────────────
  // 集合（Collection）相关
  // ─────────────────────────────────────────────────────────────

  async getCollectionList(data: GetCollectionListRequest): Promise<GetCollectionListReponse> {
    // ↑ 获取市场集合列表（市场首页的那个大表格）
    // 包含：集合名称、地板价、交易量、持有者数量等统计数据
    const queryParams = getQueryParams(data as any);
    return await this.apiClient.get<GetCollectionListReponse>(`/markets/collections?${queryParams}`);
  }

  async getCollectionOwnerList(data: GetCollectionOwnerListRequest): Promise<GetCollectionOwnerListReponse> {
    // ↑ 获取某个集合内、某个地址持有的所有铭文（用于"我的资产"筛选集合）
    const { address, ...props } = data;
    // ↑ address = 合约/集合地址，放在路径里；其他筛选条件放查询字符串
    const queryParams = getQueryParams(props as any);
    return await this.apiClient.get<GetCollectionOwnerListReponse>(
      `/markets/ethscriptions/collections/${address}?${queryParams}`,
    );
  }

  async getCollectionDetail(data: GetCollectionDetailRequest): Promise<GetCollectionDetailReponse> {
    // ↑ 获取单个集合的详细信息（集合页面顶部的概览信息）
    // 包含：总量、地板价、总交易量、7日交易量、持有者分布等
    const queryParams = getQueryParams(data as any);
    return await this.apiClient.get<GetCollectionDetailReponse>(`/markets/collections/details?${queryParams}`);
  }

  // ─────────────────────────────────────────────────────────────
  // 交易历史相关
  // ─────────────────────────────────────────────────────────────

  async getHistoryOrder(data: GetHistoryOrderRequest): Promise<GetHistoryOrderReponse> {
    // ↑ 获取历史订单（交易记录）
    // 支持两种模式：
    //   - 传 address：查某个地址的交易历史（"我的交易"）
    //   - 不传 address：查全局交易历史（"最新交易"）
    const { address, ...props } = data;
    const queryParams = getQueryParams(props as any);
    if (address) {
      // ↑ 有地址：查个人历史，URL 里带地址
      return await this.apiClient.get<GetHistoryOrderReponse>(`/markets/history/orders/${address}?${queryParams}`);
    }
    // ↑ 无地址：查全局历史
    return await this.apiClient.get<GetHistoryOrderReponse>(`/markets/history/orders?${queryParams}`);
  }

  async getEthscribe(data: GetEthscribeRequest): Promise<GetEthscribeDataReponse> {
    // ↑ 获取"铭刻"（Ethscribe）相关数据
    // Ethscribe = 创建新铭文的操作，这里查询相关信息
    const queryParams = getQueryParams(data as any);
    return await this.apiClient.get<GetEthscribeDataReponse>(`/markets/ethscriptions/ethscribe?${queryParams}`);
  }

  async getEthPrice(): Promise<GetEthPriceDataReponse> {
    // ↑ 获取当前 ETH 美元价格（用于在 UI 上显示"≈ $xxx"）
    // 后端会缓存这个数据，每隔一段时间更新一次（避免频繁请求外部价格 API）
    return await this.apiClient.get<GetEthPriceDataReponse>(`/markets/currencies/ethprice`);
  }

  // ─────────────────────────────────────────────────────────────
  // 铭文资产详情相关
  // ─────────────────────────────────────────────────────────────

  async getEtherscriptionAsset(ethscriptionIdOrNumber: string): Promise<GetEthscriptionAssetResponse> {
    // ↑ 获取单个铭文的完整资产信息（铭文详情页使用）
    // 参数可以是铭文 ID（bytes32 哈希）或铭文编号（序号）
    return await this.apiClient.get<GetEthscriptionAssetResponse>(`/ethscriptions/asset/${ethscriptionIdOrNumber}`);
  }

  async getEtherscriptionActivity(ethscriptionId: string): Promise<GetEthscriptionActivityResponse> {
    // ↑ 获取单个铭文的活动历史（转账、上架、成交等事件时间线）
    return await this.apiClient.get<GetEthscriptionActivityResponse>(`/ethscriptions/activity/${ethscriptionId}`);
  }

  // ─────────────────────────────────────────────────────────────
  // Swap（兑换）相关
  // ─────────────────────────────────────────────────────────────

  async getSwapActivity(data: GetSwapActivityRequest): Promise<GetSwapActivityResponse> {
    // ↑ 获取 Swap（铭文代币兑换）的历史交易记录
    const queryParams = getQueryParams(data as any);
    return await this.apiClient.get<GetSwapActivityResponse>(`/markets/history/swaps?${queryParams}`);
  }

  async getSwapTokensInfo(data: GetSwapTokensInfoRequest): Promise<GetSwapTokensInfoResponse> {
    // ↑ 获取 Swap 页面两个代币的详细信息（用于展示兑换比率、流动性等）
    // 用 POST 而不是 GET 的原因：参数是复杂对象（两个代币对），不适合放 URL
    return await this.apiClient.post<{}, GetSwapTokensInfoResponse>(`/markets/swap/tokens`, data);
  }
}
