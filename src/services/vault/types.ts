// ============================================================================
// 【vault/types.ts】金库 & 质押相关的 TypeScript 类型定义
// ----------------------------------------------------------------------------
// 本文件定义了 VaultService 中所有接口的请求参数和响应数据的类型。
// 分为两大类：
//   1. 金库（Vault）相关：铭文存入/赎回/余额查询
//   2. 质押（Staking）相关：统计/排行/记录
// ============================================================================

import { GetEthscriptionsOrderItem, IPaymentItem, categoryType } from '../marketpalce/types';
import { BasePage, IResponse } from '../types';

// 金库铭文列表请求参数（某用户在某集合中质押的铭文）
export interface GetVaultListRequest {
  category: categoryType; // 铭文类别（nft/domain 等）
  collection: string; // 集合名称
  owner: string; // 用户钱包地址
  'page.size': number;
  'page.index': number;
}

// 金库铭文列表单条数据（铭文信息 + 支付信息）
export interface GetVaultListItem {
  order: GetEthscriptionsOrderItem; // 铭文订单数据（id/名称/类别等）
  payment: IPaymentItem; // 支付相关数据（价格/代币等）
}

// 金库铭文列表数据
export interface GetVaultListData {
  ethscriptions: GetVaultListItem[];
  page: BasePage;
}

// 质押排行请求参数
export interface GetStakingRankRequest {
  collection: string;
  'page.size': number;
  'page.index': number;
}

// 质押记录请求参数（某用户的质押记录）
export interface GetStakingRecordRequest {
  owner: string; // 钱包地址
  collection: string;
  'page.size': number;
  'page.index': number;
}

// 金库余额请求参数
export interface GetVaultBalanceRequest {
  address: string; // 用户钱包地址
  collection: string;
}

// 赎回请求参数（从金库取回铭文）
// 包含 orderId/signature 等，后端验证签名后生成 trustedSignature
export interface PostVaultRedeemRequest {
  collection: string;
  ethscriptionId: string; // 要赎回的铭文 ID
  orderId: string;
  vaultAddress: string; // 金库合约地址
  orderHash: string; // 订单哈希（用于生成签名）
  signer: string; // 签名者地址
  signature: string; // 用户签名
}

// 获取金库铭文分批数据的请求（赎回前的数据准备）
export interface GetVaultEthscriptionRequest {
  collection: string;
  address: string;
  nonce: number; // 防重放攻击的随机数
  amount: string;
}

// 金库余额数据
export interface GetVaultBalanceData {
  balances: {
    available: string; // 可用余额
    transferable: string; // 可转账余额（超出锁仓比例的部分）
    stakingLockRatio: number; // 质押锁仓比例（0-1，如 0.5 = 50% 锁仓）
  };
}

// 金库铭文分批数据（返回编码后的 calldata）
export interface GetVaultBalanceDataData {
  data: string; // 编码后的合约调用数据
}

// 质押统计数据（概览面板数据来源）
export interface GetStakingStaticData {
  stakers: number; // 质押人数
  totalLocked: string; // 总锁仓代币数量
  tvl: string; // TVL（以 ETH 计价的总锁仓价值）
  cumulativeRewards: string; // 累计发放奖励总量（ETH）
  pendingRewards: string; // 待领取奖励（ETH）
  epochStartTime: number; // 当前 Era 开始时间（Unix 秒时间戳）
  epochEndTime: number; // 当前 Era 结束时间（Unix 秒时间戳）
}

// 排行榜单条数据（某质押者的统计）
export interface GetStakingRankDataStaker {
  staker: string; // 质押者钱包地址
  totalStaked: string; // 累计质押总量
  lockStaked: string; // 锁仓中的数量
  stakes: number; // 质押笔数
  pendingRewards: string; // 待领取奖励
}

// 质押排行榜数据
export interface GetStakingRankData {
  stakes: GetStakingRankDataStaker[];
  page: BasePage;
}

// 质押记录单条数据（某铭文的质押详情）
export interface GetStakingRecordItem {
  collectionName: string; // 集合名称
  ethscriptionId: string; // 铭文 ID
  ethscriptionNumber: string; // 铭文序号
  rewards: number; // 本条质押获得的奖励
  stakeTime: number; // 质押时间（Unix 时间戳）
  stakeTxHash: string; // 质押交易哈希
  staked: string; // 质押金额
  staker: string; // 质押者地址
  tokenId: string; // 铭文 token ID
}

// 质押记录列表数据
export interface GetStakingRecordData {
  records: GetStakingRecordItem[];
  page: BasePage;
}

// 提取签名数据（getVaultWithdraw 轮询直到此数据的 trustedSignature 非空）
export interface GetVaultWidthdrawData {
  ethscriptionId: string;
  orderId: string;
  vaultAddress: string;
  signature: string; // 用户侧签名
  trustedSignature: string; // 后端生成的可信签名（用于链上提取）
}

// 所有 Response 类型（IResponse 包裹，含 code/message/data）
export type GetVaultListResponse = Awaited<Readonly<IResponse<GetVaultListData>>>;
export type GetVaultBalanceResponse = Awaited<Readonly<IResponse<GetVaultBalanceData>>>;
export type GetVaultBalanceDataResponse = Awaited<Readonly<IResponse<GetVaultBalanceDataData>>>;
export type GetStakingStaticDataResponse = Awaited<Readonly<IResponse<GetStakingStaticData>>>;
export type GetStakingRankDataResponse = Awaited<Readonly<IResponse<GetStakingRankData>>>;
export type GetStakingRecordDataResponse = Awaited<Readonly<IResponse<GetStakingRecordData>>>;
export type PostVaultRedeemDataResponse = Awaited<Readonly<IResponse<{}>>>;
export type GetVaultWidthdrawDataResponse = Awaited<Readonly<IResponse<GetVaultWidthdrawData>>>;
