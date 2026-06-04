/**
 * ==============================================================
 * 文件：src/services/marketpalce/types.ts
 * 作用：交易市场（Marketplace）相关的 TypeScript 类型定义
 *
 * 注意文件名拼写 marketpalce（历史 typo），全项目统一此路径，勿改以免破坏 import
 *
 * 类型分组速查：
 *   - categoryType          — 四大分类：token | domain | nft | image | text
 *   - GetMarketListedRequest — 市场挂单列表查询参数
 *   - GetMyEthscriptionsRequest — 个人铭文列表查询
 *   - Order / ListingRequest — 链上订单结构（与合约 ABI 字段对应）
 *   - GetCollection*        — 集合详情、Owner 面板、图表数据
 *
 * 为什么 Request 字段用 'page.size' 带点号？
 *   后端 API 约定嵌套 query 参数格式，getQueryParams 原样序列化
 *
 * 阅读建议：配合 constants/index.ts 的 CATEGORY_KEY_ENUM 一起看
 * ==============================================================
 */

import { BasePage, IResponse, SocialPlatform } from '../types';

export type categoryType = 'token' | 'domain' | 'nft' | 'image' | 'text';
export interface GetMarketListedRequest {
  category: categoryType;
  collection: string;
  show: 'ShowAll' | 'OnlyBuyNow';
  sortBy: 'PriceAsc' | 'PriceDesc' | 'TimeAsc' | 'TimeDesc';
  trait: string;
  searchBy: string;
  'page.size': number;
  'page.index': number;
}

export interface GetMyEthscriptionsRequest {
  owner: string;
  collection: string;
  category: categoryType;
  show: 'AllEthscription' | 'OnSale' | 'NotOnSale';
  trait: string;
  'page.size': number;
  'page.index': number;
}

export interface ListingRequest {
  category: categoryType;
  collectionName: string;
  protocolAddress: string;
  order: Order;
}

export interface ListingBulkRequest {
  protocolAddress: string;
  orders: OrderIdInfo[];
}

export interface Order {
  chainName: string;
  orderHash: string;
  signer: string;
  ethscriptionId: string;
  creator: string;
  currency: string;
  price: string;
  nonce: string;
  quantity: string;
  startTime: number;
  endTime: number;
  protocolFeeDiscounted: number;
  creatorFee: number;
  params: string;
  signature: string;
}

export interface GetEthscriptionsOrderItem {
  ethscriptionId: string;
  ethscriptionNumber: string;
  content: string;
  isVerified: boolean;
  isListing: boolean;
  isDeposit: boolean;
  isUnconfirmed: boolean;
  isUninscribed: boolean;
  owner: string;
  quantity: string;
  unitPrice: string;
  unitPriceUsd: string;
  price: string;
  priceUsd: string;
  listingTime: string;
  expirationTime: string;
  category: categoryType;
  collectionName: string;
  orderId: string;
  tokenId: string;
  nonce: string;
  protocolAddress: string;
  trait: string;
  vaultAddress: string;
}

export interface GetOrderData {
  order: OrderIdInfo;
}

export interface GetOrderByCartDataitem {
  order: OrderIdInfo;
  item: {
    category: categoryType;
    collectionName: string;
    ethscriptionNumber: string;
    tokenId: string;
    content: string;
    contentType: string;
    icon: string;
  };
}

export interface GetOrderByCartData {
  sweepAddress: string;
  orders: GetOrderByCartDataitem[];
}

export interface OrderIdInfo {
  chainName: string;
  category: string;
  collectionName: string;
  ethscriptionNumber: string;
  orderHash: string;
  signer: string;
  ethscriptionId: string;
  creator: string;
  currency: string;
  price: string;
  nonce: string;
  quantity: string;
  startTime: number;
  endTime: number;
  protocolFeeDiscounted: number;
  creatorFee: number;
  params: string;
  signature: string;
  trustedSignature: string;
  merkleRoot: string;
  merkleProof: {
    position: string;
    value: string;
  }[];
  bundleIndex: string;
  bundleItems: string[];
}

export interface IPaymentItem {
  chainName: string;
  name: string;
  address: string;
  decimal: string;
  icon: string;
  stakingLockRatio: number;
}

export interface GetWithdrawDataBulk {
  ethscriptionIds: string[];
  expiration: string;
  recipient: string;
  trustedSignature: string;
}

export interface GetEthscriptionsItem {
  order: GetEthscriptionsOrderItem;
  payment: IPaymentItem;
}

export interface GetEthscriptionsData {
  ethscriptions: GetEthscriptionsItem[];
  page: BasePage;
}

export interface GetEthscriptionAssetItem {
  ethscription: GetEthscriptionsItem & {
    order: {
      seller?: string;
      mimetype?: string;
      creator?: string;
      createdAt?: string;
    };
  };
}

export interface GetOrderNonceData {
  nonce: string;
  floorPrice: string;
  protocolData: ProtocolData;
  creatorData: CreatorData;
  unitPrice: string;
  unitPriceUsd: string;
  startTime: string;
}

export interface CreatorData {
  creatorAddress: string;
  creatorFeeBps: number;
}

export interface ProtocolData {
  protocolAddress: string;
  protocolFeeRecipient: string;
  protocolFeeBps: number;
  protocolFeeOff: 5000;
}

export interface GetCollectionListRequest {
  category: categoryType;
  tokenQuery: string;
  'page.size': number;
  'page.index': number;
}

export interface GetCollectionDetailRequest {
  category: categoryType;
  collectionName: string;
}

export interface GetCollectionOwnerListRequest {
  category: categoryType;
  tokenQuery: string;
  address: string;
}

export interface GetHistoryOrderRequest {
  address?: string;
  category: categoryType;
  events: string[];
  collection: string;
  'page.size': number;
  'page.index': number;
}

export interface GetEthscribeRequest {
  collectionName: string;
  tokenId: string;
}

export interface GetSwapTokensInfoRequest {
  tokenAddresses: string[];
}

export interface IFacetStat {
  ethAddress: string;
  contractAddress: string;
  pairAddress: string;
  routerAddress: string;
}

export interface GetCollectionListItem {
  chainName: string;
  category: categoryType;
  collectionName: string;
  isBlue: boolean;
  floorPrice: string;
  unitPrice: string;
  unitPriceUsd: string;
  volume24h: string;
  totalVolume: string;
  marketCap: string;
  marketCapRank: number;
  sales24h: string;
  totalSales: string;
  totalSupply: string;
  itemListed: string;
  owners: string;
  priceChange24h: number;
  priceChangePercentage24h: number;
  icon: string;
  iconContentType:
    | 'image/png'
    | 'image/jpeg'
    | 'image/png'
    | 'image/gif'
    | 'image/jpg'
    | 'image/avif'
    | 'image/webp'
    | 'image/svg+xml'
    | 'image/vnd.mozilla.apng'
    | 'image/bmp'
    | 'image/x-icon'
    | 'image/x-xpixmap';
  facetStat: IFacetStat;
}

export interface GetCollectionListData {
  collections: GetCollectionListItem[];
  page: BasePage;
}
export interface GetCollectionDetailData {
  collections: GetCollectionListItem;
  socialLinks: SocialPlatform;
}

export interface GetOrderNonceRequest {
  address: string;
  category: categoryType;
  collection: string;
}

export interface MarketChartRequest {
  period: string;
  category: categoryType;
  collectionName: string;
  contractAddress?: string;
}

export interface GetSwapActivityRequest {
  tokenAddress: string;
  events?: 'buy' | 'sell' | 'add' | 'remove' | 'transfer';
  'page.size': number;
  'page.index': number;
}

export interface GetCollectionOwnerListItem {
  category: categoryType;
  collectionName: string;
  isBlue: boolean;
  floorPrice: number;
  verified: number;
  verifiedAmt: number;
  unverified: number;
  unverifiedAmt: number;
  totalQuantity: number;
  totalAmt: number;
  value: number;
  icon: string;
  iconContentType:
    | 'image/png'
    | 'image/jpeg'
    | 'image/png'
    | 'image/gif'
    | 'image/jpg'
    | 'image/avif'
    | 'image/webp'
    | 'image/svg+xml'
    | 'image/vnd.mozilla.apng'
    | 'image/bmp'
    | 'image/x-icon'
    | 'image/x-xpixmap'
    | string;
}

export interface GetCollectionOwnerListData {
  collections: GetCollectionOwnerListItem[];
}

export interface GetHistoryOrderItem {
  category: categoryType;
  collectionName: string;
  ethscriptionId: string;
  ethscriptionNumber: string;
  content: string;
  event: 'sold' | 'cancelled' | 'listing' | 'transfer' | 'contract-transfer';
  from: string;
  to: string;
  quantity: string;
  unitPrice: string;
  unitPriceUsd: string;
  price: string;
  priceUsd: string;
  eventTime: string;
  txHash: string;
  payment: IPaymentItem;
}

export interface GetHistoryOrderData {
  events: GetHistoryOrderItem[];
  page: BasePage;
}

export interface GetEtherscriptionOrderItemActivityData {
  events: GetHistoryOrderItem[];
}

export interface GetWithdrawData {
  ethscriptionId: string;
  expiration: string;
  recipient: string;
  trustedSignature: string;
}

export interface GetEthscribeData {
  data: string;
}

export interface GetEthPriceData {
  price: string;
}

export interface MarketChartData {
  prices: {
    date: 0;
    ethPrice: string;
    usdPrice: string;
  }[];
  currentPrice: string;
  priceChange24h: number;
  priceChangePercentage24h: number;
  marketCap: string;
  volume24h: string;
  high24h: string;
  low24h: string;
  liquidity: string;
  buy24h: string;
  sell24h: string;
}

export interface ISwapActivityDataItem {
  opType: string;
  maker: string;
  amountFrom: string;
  amountTo: string;
  unitPrice: string;
  unitPriceUsd: string;
  volume: string;
  volumeUsd: string;
  eventTime: number;
  txHash: string;
}

export interface GetSwapActivityData {
  events: ISwapActivityDataItem[];
  page: BasePage;
}

export interface ISwapTokenInfoItem {
  contractAddress: string;
  name: string;
  symbol: string;
  totalSupply: string;
  decimals: number;
  contractType: string;
  bridgedToken: string;
}

export interface GetSwapTokensInfo {
  tokens: ISwapTokenInfoItem[];
  ethPrice: string;
}

export type GetMarketListedResponse = Awaited<Readonly<IResponse<GetEthscriptionsData>>>;
export type GetMyEthscriptionsResponse = Awaited<Readonly<IResponse<GetEthscriptionsData>>>;
export type GetOrderNonceDataResponse = Awaited<Readonly<IResponse<GetOrderNonceData>>>;
export type GetWithdrawDataResponse = Awaited<Readonly<IResponse<GetWithdrawData>>>;
export type GetEthscriptionAssetResponse = Awaited<Readonly<IResponse<GetEthscriptionAssetItem>>>;
export type GetEthscriptionActivityResponse = Awaited<Readonly<IResponse<GetEtherscriptionOrderItemActivityData>>>;
export type GetWithdrawDataBulkResponse = Awaited<Readonly<IResponse<GetWithdrawDataBulk>>>;

export type GetOrderDataResponse = Awaited<Readonly<IResponse<GetOrderData>>>;
export type GetOrderByCartDataResponse = Awaited<Readonly<IResponse<GetOrderByCartData>>>;

export type ListingResponse = Awaited<Readonly<IResponse<null>>>;
export type GetCollectionListReponse = Awaited<Readonly<IResponse<GetCollectionListData>>>;
export type GetCollectionDetailReponse = Awaited<IResponse<GetCollectionDetailData>>;
export type GetCollectionOwnerListReponse = Awaited<Readonly<IResponse<GetCollectionOwnerListData>>>;
export type GetHistoryOrderReponse = Awaited<Readonly<IResponse<GetHistoryOrderData>>>;
export type GetEthscribeDataReponse = Awaited<Readonly<IResponse<GetEthscribeData>>>;
export type GetEthPriceDataReponse = Awaited<Readonly<IResponse<GetEthPriceData>>>;
export type MarketChartResponse = Awaited<Readonly<IResponse<MarketChartData>>>;
export type GetSwapActivityResponse = Awaited<IResponse<GetSwapActivityData>>;
export type GetSwapTokensInfoResponse = Awaited<IResponse<GetSwapTokensInfo>>;
