// ============================================================================
// 【EthscriptionsStore】铭文数据缓存——存储当前页面已加载的铭文列表
// ----------------------------------------------------------------------------
// 做什么：
//   在 valtio 全局 store 里缓存三块数据：
//     1. listedList  → 当前「挂单中」的铭文列表（市场页 / 集合页可购买的商品）
//     2. ownerList   → 某地址「持有」的铭文列表（我的资产页）
//     3. collectionDetail → 当前集合的详情信息（名称、地板价、合约地址等）
//
// 为什么需要全局缓存（而不是每个组件自己 fetch）？
//   场景：用户买完商品后，希望列表立刻消失，不需要等待下一次接口刷新。
//   方案：CartSettlement 里「成功付款」后，调用 removeListedItem() 直接从
//         store 里删掉已购商品，用户立刻看到更新。
//
// 典型数据流：
//   页面加载 → API 拉取数据 → setListedList/setOwnerList 写入 store
//   用户购买 → CartSettlement 付款成功 → removeListedItem 更新 store
//   组件用 useSnapshot(store) 订阅 → 数据变化时自动重渲染
// ============================================================================

'use client';

import { GetCollectionDetailData, GetEthscriptionsData, GetOrderByCartDataitem } from '@/services/marketpalce/types';
import { proxy } from 'valtio';
import { IBulkEthscriptionsItem } from './BulkListingStore';

// ── 数据结构定义 ──────────────────────────────────────────────────────────────
export interface IEthscriptionsStore {
  listedList: GetEthscriptionsData; // 挂单中的铭文列表（市场可购买的商品）
  ownerList: GetEthscriptionsData; // 我的铭文列表（我的资产页）
  collectionDetail?: GetCollectionDetailData; // 集合详情（可选，详情页才有）
}

// ── 初始化 store ──────────────────────────────────────────────────────────────
export const store = proxy<IEthscriptionsStore>({
  listedList: {
    ethscriptions: [],
    page: {
      size: 50,
      index: 1,
      total: '0',
    },
  },
  ownerList: {
    ethscriptions: [],
    page: {
      size: 50,
      index: 1,
      total: '0',
    },
  },
  collectionDetail: undefined,
});

// ── Action 函数（修改 store 的唯一入口）─────────────────────────────────────

/**
 * 设置挂单铭文列表（市场首次加载或翻页时调用）
 * @param listedList - 从 API 拿到的挂单数据
 */
export const setListedList = async (listedList: GetEthscriptionsData) => {
  store.listedList = listedList;
};

/**
 * 从挂单列表中移除已购买的铭文（批量扫货成功后立即调用）
 *
 * 实现「本地乐观更新」：
 *   不等后端刷新，直接从本地 store 删掉已买的商品，用户立刻看到列表变化。
 *   下一次页面刷新时，后端数据和本地保持一致。
 *
 * @param sweepCart - 刚刚购买成功的订单列表（用 orderHash 做匹配 key）
 */
export const removeListedItem = async (sweepCart: GetOrderByCartDataitem[]) => {
  sweepCart.forEach((item) => {
    // 过滤掉 orderId === 已购 orderHash 的铭文
    // 注意：orderId 和 orderHash 是同一个标识的两个命名（历史不一致，实际值相同）
    const _ethsFilter = store.listedList.ethscriptions.filter(
      (ethscriptionItem) => ethscriptionItem.order.orderId != item.order.orderHash,
    );
    // 注意：这里用 store.listedList = {...} 整体替换而非 splice
    // 因为这里要同时保留 page 字段，不能只操作 ethscriptions 数组
    store.listedList = { ...store.listedList, ethscriptions: _ethsFilter };
  });
};

/**
 * 设置我的铭文列表（我的资产页加载时调用）
 * @param ownerList - 从 API 拿到的持有铭文数据
 */
export const setOwnerList = async (ownerList: GetEthscriptionsData) => {
  store.ownerList = ownerList;
};

/**
 * 从我的铭文列表中移除已转出/已操作的铭文（批量操作成功后调用）
 * @param ethsList - 已执行操作的铭文列表（用 ethscriptionId 做匹配 key）
 */
export const removeOwnerItem = async (ethsList: IBulkEthscriptionsItem[]) => {
  ethsList.forEach((item) => {
    const _ethsFilter = store.ownerList.ethscriptions.filter(
      (ethscriptionItem) => ethscriptionItem.order.ethscriptionId != item.order.ethscriptionId,
    );
    store.ownerList = { ...store.ownerList, ethscriptions: _ethsFilter };
  });
};

/**
 * 设置集合详情（进入集合详情页时调用）
 * 集合详情包含：集合名称、地板价、Facet 合约地址等
 * Swap 容器也依赖 collectionDetail 来获取 Swap 代币的合约地址
 * @param collectionDetail - 集合详情数据（离开详情页时传 undefined 清除）
 */
export const setCollectionDetail = async (collectionDetail?: GetCollectionDetailData) => {
  store.collectionDetail = collectionDetail;
};
