// ============================================================================
// 【FacetSwapStore】Facet L2 上的代币兑换（Swap）全局状态
// ----------------------------------------------------------------------------
// 做什么：
//   管理 Swap（代币兑换）页面所需的所有状态：
//     - 交易对列表（pairs）
//     - 当前选择的输入代币（token0）和输出代币（token1）
//     - 代币价格/市值等元信息（tokenInfo）
//     - 历史记录地址过滤（historyAddress）
//     - UI 交互状态（isExactTokens、isLoadingSync）
//
// 什么是 Swap（代币兑换）？
//   类似 Uniswap / PancakeSwap 的 AMM 自动做市商兑换。
//   用户选 token0（付出）→ token1（换取），合约自动计算兑换比例，完成链上交换。
//
// 什么是 pairs（交易对）？
//   每种代币在 DEX（去中心化交易所）上都有对应的流动性池。
//   pairs 是一个 Map：{ 合约地址 → 代币详情（余额、价格、流动性等）}
//   格式：{ '0xabc...' : { address, symbol, price, balance, ... } }
//
// token0 / token1 的命名来源：
//   Uniswap V2 协议把交易对的两个代币称为 token0 和 token1（按地址大小排序）。
//   这里借用该命名：token0 = 输入代币（付出），token1 = 输出代币（换取）。
//
// isExactTokens（精确模式）：
//   false → 用户指定「输入数量」（exactInput 模式）
//   true  → 用户指定「输出数量」（exactOutput 模式）
//   影响合约调用的函数选择（swapExactTokensForTokens vs swapTokensForExactTokens）
// ============================================================================

'use client';

import { proxy } from 'valtio';
import { ISwapToken, ISwapTokenData } from '@/services/facet/types';
import { FACET_CONFIG } from '@/constants/config';
import * as EthscriptionsStore from '@/stores/EthscriptionsStore';
import { ISwapTokenInfoItem } from '@/services/marketpalce/types';

// ── 数据结构 ──────────────────────────────────────────────────────────────────
export interface IFacetSwapStore {
  pairs: ISwapTokenData; // 所有可兑换代币对（key=合约地址）
  isExactTokens: boolean; // 是否「精确输出」模式（true=用户指定输出量）
  isLoadingSync: boolean; // 是否正在同步/刷新兑换比例
  historyAddress: string; // 历史记录筛选地址（空字符串=全部）
  token0?: ISwapToken; // 输入代币（用户付出的代币）
  token1?: ISwapToken; // 输出代币（用户换取的代币）
  tokenInfo?: {
    tokens: { [key in string]: ISwapTokenInfoItem }; // key=合约地址，value=价格/市值等
    ethPrice: string; // 当前 ETH 美元价格（用于显示美元估值）
  };
}

// ── 初始化 store ──────────────────────────────────────────────────────────────
export const store = proxy<IFacetSwapStore>({
  pairs: {},
  historyAddress: '',
  isExactTokens: false,
  isLoadingSync: false,
  token0: undefined,
  token1: undefined,
});

// ── Action 函数 ───────────────────────────────────────────────────────────────

/** 更新代币价格/市值元信息 */
export const setTokenInfo = (tokenInfo: IFacetSwapStore['tokenInfo']) => {
  store.tokenInfo = tokenInfo;
};

/** 设置历史记录筛选地址（传空字符串=查全部） */
export const setHistoryAddress = (historyAddress: string) => {
  store.historyAddress = historyAddress;
};

/**
 * 设置交易对列表，并自动更新 token0 / token1 的选中状态
 *
 * 逻辑：
 *   - token0（输入代币）优先选 FETH（Facet 原生代币），类似 ETH
 *   - token1（输出代币）优先选当前集合的合约地址对应的代币
 *   - 如果已经有 token0/token1 的选择，刷新其最新数据（价格、余额）
 *
 * 这样用户进入 Swap 页面时，默认已经预填好「FETH → 当前集合代币」的兑换对。
 */
export const setPairs = (pairs: ISwapTokenData) => {
  store.pairs = pairs;

  // token0 已有选择 → 用新数据刷新；否则默认选 FETH
  if (store.token0) {
    setInSelectToken(store.pairs[store.token0.address]);
  } else {
    setInSelectToken(store.pairs[FACET_CONFIG.FETH_ADDRESS]);
  }

  // token1 已有选择 → 用新数据刷新；否则默认选当前集合代币
  if (store.token1) {
    setOutSelectToken(store.pairs[store.token1.address]);
  } else {
    setOutSelectToken(
      store.pairs[EthscriptionsStore.store.collectionDetail?.collections.facetStat.contractAddress || ''],
      // ↑ collectionDetail 中保存了集合对应的 Facet 合约地址，用它在 pairs 里查找代币详情
    );
  }
};

/** 切换精确模式（用户是否指定输出数量） */
export const setIsExactTokens = (isExactTokens: boolean) => {
  store.isExactTokens = isExactTokens;
};

/** 设置同步加载状态（刷新兑换比例时 loading） */
export const setIsLoadingSync = (isLoadingSync: boolean) => {
  store.isLoadingSync = isLoadingSync;
};

/**
 * 更新「输入代币」(token0) 的选中状态
 *
 * 合并策略：如果已有 token0，用展开运算符合并新数据（保留用户输入的数量等字段）；
 * 否则直接赋值（首次选择）。
 */
export const setInSelectToken = (data?: ISwapToken) => {
  if (store.token0) {
    store.token0 = { ...store.token0, ...data }; // 合并更新（保留用户输入数量等）
  } else {
    store.token0 = data; // 首次选择
  }
};

/**
 * 更新「输出代币」(token1) 的选中状态（逻辑与 setInSelectToken 相同）
 */
export const setOutSelectToken = (data?: ISwapToken) => {
  if (store.token1) {
    store.token1 = { ...store.token1, ...data };
  } else {
    store.token1 = data;
  }
};

/**
 * 清空所有 Swap 状态（离开 Swap 页面时调用，防止旧状态影响下一次进入）
 */
export const clearToken = () => {
  store.token0 = undefined;
  store.token1 = undefined;
  store.isExactTokens = false;
  store.isLoadingSync = false;
  store.historyAddress = '';
};
