/**
 * ==============================================================
 * 文件：src/constants/index.ts
 * 作用：全站通用的业务常量（与 config.ts 的环境配置互补）
 *
 * config.ts vs index.ts 的分工：
 *   - config.ts  → 环境相关（主网/测试网切换、RPC、合约地址）
 *   - index.ts   → 业务逻辑常量（零地址、默认订单、分类映射、外链 URL）
 *
 * 为什么要把常量集中管理？
 *   1. 避免魔法字符串散落在各组件里（如 '0x000...000' 写十遍）
 *   2. 修改一处，全站生效（比如测试网区块浏览器 URL 变更）
 *   3. 新人读代码时，来这里查「这个枚举值是什么意思」
 * ==============================================================
 */

import { GetCollectionOwnerListItem, categoryType } from '@/services/marketpalce/types';
import { mainnet, goerli } from 'wagmi/chains';
import { invert } from 'lodash-es';

/** 以太坊零地址：表示「无地址 / 未设置 / ETH 原生代币」 */
export const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';

/**
 * 市场订单的「空模板」
 * 用途：初始化表单、对比默认值、合约调用前的占位结构
 * 为什么全是 0：表示尚未创建的有效订单
 */
export const DEFAULT_ORDER = {
  signer: ZERO_ADDRESS,
  creator: ZERO_ADDRESS,
  ethscriptionId: '0x0000000000000000000000000000000000000000000000000000000000000000',
  quantity: '0',
  currency: ZERO_ADDRESS,
  price: '0',
  nonce: '0',
  startTime: 0,
  endTime: 0,
  protocolFeeDiscounted: 0,
  creatorFee: 0,
  params: '0x',
};

/**
 * 按链 ID 映射的外部链接
 * 为什么用 chainId 做 key：wagmi 的 useNetwork().chain.id 直接可用
 * 组件里：URL_CONFIG[chainId].etherScanUrl + txHash → 跳转区块浏览器
 */
interface IURL_CONFIG {
  [number: number]: {
    etherscription: string; // Ethscriptions 官方浏览器
    etherScanUrl: string; // Etherscan 区块浏览器
    collectionUrl: string; // EtchMarket 市场页（分享链接用）
  };
}

export const URL_CONFIG: IURL_CONFIG = {
  [goerli.id]: {
    etherscription: 'https://goerli.ethscriptions.com/',
    etherScanUrl: 'https://goerli.etherscan.io/',
    collectionUrl: 'https://goerli.etch.market/market/',
  },
  [mainnet.id]: {
    etherscription: 'https://ethscriptions.com',
    etherScanUrl: 'https://etherscan.io/',
    collectionUrl: 'https://www.etch.market/market',
  },
};

/** 集合 Owner 面板的默认占位数据（加载中 / 空状态展示用） */
export const DEFAULT_COLLECTION_OWNNER_ITEM: GetCollectionOwnerListItem = {
  category: 'token',
  collectionName: 'erc-20 eths',
  isBlue: false,
  floorPrice: 0,
  verified: 2,
  verifiedAmt: 2000,
  unverified: 52,
  unverifiedAmt: 52000,
  totalQuantity: 54,
  totalAmt: 54000,
  value: 0,
  icon: '',
  iconContentType: '',
};

/** 市场三大分类的 UI 展示名（用于 Tab、下拉框 label） */
export type CategoryKeyType = 'Tokens' | 'Domains' | 'Collections';

/** 后端 category 字段 → 前端展示名 */
export const CATEGORY_KEY_ENUM: { [key in categoryType]?: CategoryKeyType } = {
  token: 'Tokens',
  domain: 'Domains',
  nft: 'Collections',
};

/**
 * 反向映射：UI 展示名 → 后端 category 值
 * invert() 把 { token: 'Tokens' } 变成 { Tokens: 'token' }
 * 用于：用户点击 Tab 时，把 'Tokens' 转成 API 需要的 'token'
 */
export const CATEGORY_VALUE_ENUM = invert(CATEGORY_KEY_ENUM) as {
  [key in CategoryKeyType]: categoryType;
};

/** 特定 Token 集合的图标 URL（S3 托管） */
export const TOKEN_ICONS: { [key in string]: string } = {
  'erc-20 eths': 'https://etchmarket.s3.amazonaws.com/eths.png',
};

/** MIME 类型前缀：判断铭文内容是否为图片（用于 NftImage 组件） */
export const mimeTypeImagePre = 'image/';
