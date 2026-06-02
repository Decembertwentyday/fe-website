/**
 * ==============================================================
 * 文件：src/stores/CartStore.ts
 * 作用：购物车全局状态管理
 *
 * 功能类比：
 *   就像电商网站的购物车，用户可以：
 *   - 把铭文 NFT 加入购物车（addEthscription）
 *   - 从购物车移除（removeEthscription）
 *   - 一键清空（clearAllEthsciption）
 *   - 打开/关闭购物车抽屉（setOpen）
 *
 * 技术亮点：
 *   1. 使用 valtio 的 subscribe 实现"自动持久化"：
 *      每次购物车内容变化，自动同步到 localStorage
 *      用户刷新页面后，购物车内容不丢失
 *
 *   2. 打开购物车时自动验证订单有效性：
 *      过滤掉已失效的订单（signature 为空 = 订单已被撤销或成交）
 *
 * 数据结构说明：
 *   orderIds：string[]  → 购物车中所有 NFT 的订单 Hash 数组（轻量，本地持久化）
 *   cartOrder：完整的订单详情（含价格、卖家信息等，从后端获取，不持久化）
 * ==============================================================
 */

'use client';
// ↑ 使用了 localStorage（浏览器 API），必须是客户端组件

import services from '@/services';
// ↑ 服务层（调用 marketplace.getOrderIDByCart 接口）

import { GetOrderByCartData } from '@/services/marketpalce/types';
// ↑ 购物车订单的 TypeScript 类型定义

import { proxy, subscribe } from 'valtio';
// ↑ proxy：创建响应式状态
// subscribe：订阅状态变化（类似 useState 的 useEffect，但作用于 store 级别）
// 当被订阅的对象变化时，subscribe 的回调函数会被调用

// ─────────────────────────────────────────────────────────────
// 类型定义
// ─────────────────────────────────────────────────────────────
export interface ICartStore {
  open: boolean; // 购物车抽屉是否展开
  cartOrderLoading: boolean; // 打开购物车时，加载订单详情的 loading 状态
  openResult: boolean; // 是否显示购买结果弹窗（成功/失败）
  isSuccess: boolean; // 购买操作是否成功
  orderIds: string[]; // 购物车中的订单 Hash 列表（本地持久化）
  cartOrder: GetOrderByCartData | null; // 从后端获取的完整订单详情（含价格等）
}

// ─────────────────────────────────────────────────────────────
// 创建响应式 Store
// ─────────────────────────────────────────────────────────────
export const store = proxy<ICartStore>({
  open: false, // 初始：购物车关闭
  cartOrderLoading: false, // 初始：不在加载中
  openResult: false, // 初始：不显示结果弹窗
  isSuccess: false, // 初始：未有购买操作

  orderIds: JSON.parse(typeof window != 'undefined' ? localStorage?.getItem('sweepOrderIds') || '[]' : '[]'),
  // ↑ 初始化购物车列表（从 localStorage 恢复）
  //
  // 为什么需要 typeof window != 'undefined' 判断？
  //   Next.js 服务端渲染时，代码在 Node.js 中执行，没有 window 对象
  //   如果直接访问 localStorage，服务端会报 "localStorage is not defined" 错误
  //   这个判断确保只在浏览器环境（有 window）才访问 localStorage
  //
  // 流程：
  //   浏览器环境：从 localStorage 读取 'sweepOrderIds' → 解析 JSON
  //   服务端环境：直接用空数组 '[]'
  //   如果 localStorage 中没有 'sweepOrderIds'：|| '[]' 提供默认值

  cartOrder: null, // 初始：无订单详情（需要打开购物车时从后端加载）
});

// ─────────────────────────────────────────────────────────────
// 自动持久化：购物车变化时同步到 localStorage
// ─────────────────────────────────────────────────────────────
subscribe(store.orderIds, () => {
  // ↑ 订阅 store.orderIds 数组的变化
  // 每当 orderIds 有任何改变（添加/删除/清空），这个回调就会执行

  localStorage.setItem('sweepOrderIds', JSON.stringify(store.orderIds));
  // ↑ 把最新的购物车列表序列化后存入 localStorage
  // 下次用户访问页面时，可以从这里恢复购物车内容
  //
  // 为什么叫 'sweepOrderIds' 而不是 'cartOrderIds'？
  // 这个功能也叫 "sweep"（扫货），是批量买入的操作，历史命名遗留
});

// ─────────────────────────────────────────────────────────────
// 状态操作函数
// ─────────────────────────────────────────────────────────────

/** 设置购买结果是否成功 */
export const setIsSuccess = async (isSuccess: boolean) => {
  store.isSuccess = isSuccess;
};

/** 显示/隐藏购买结果弹窗 */
export const setOpenResult = async (openResult: boolean) => {
  store.openResult = openResult;
};

/**
 * 打开/关闭购物车抽屉
 * 打开时：自动从后端加载最新订单详情（验证有效性）
 * 关闭时：清空本地的订单详情缓存
 */
export const setOpen = async (open: boolean) => {
  store.open = open;

  if (open) {
    // ─── 打开购物车 ───
    store.cartOrderLoading = true;
    // ↑ 设置 loading 状态（UI 显示骨架屏或 spinner）

    let _cartOrder = await services.marketplace.getOrderIDByCart(store.orderIds);
    // ↑ 根据本地的 orderIds 列表，向后端查询完整的订单信息
    // 传入 orderIds → 后端返回每个订单的价格、卖家、状态等详情

    if (_cartOrder?.orders) {
      const _orderIds = _cartOrder.orders.filter((item) => item.order.signature == '');
      // ↑ 找出 signature 为空的订单
      // signature（签名）为空意味着：这个挂单已经被取消或已经成交
      // 这些失效的订单需要自动从购物车移除

      store.cartOrder = _cartOrder;
      // ↑ 保存完整订单详情到 store

      _orderIds.forEach((item) => {
        removeEthscription(item.order.orderHash);
        // ↑ 把每个失效订单从购物车移除
        // 用户看到的效果：购物车打开时，失效商品自动消失
      });
    }

    store.cartOrderLoading = false;
    // ↑ 加载完成，取消 loading 状态
  } else {
    // ─── 关闭购物车 ───
    store.cartOrder = null;
    // ↑ 清空订单详情缓存
    // 原因：下次打开时需要重新从后端获取最新数据（价格可能已变化）
  }
};

/**
 * 添加铭文到购物车
 * @param orderId - 挂单的 orderHash（唯一标识）
 */
export const addEthscription = (orderId: string) => {
  store.orderIds.push(orderId);
  // ↑ 直接 push（valtio proxy 会检测到这个变化）
  // 变化后 subscribe 回调执行，自动同步到 localStorage
};

/**
 * 从购物车移除铭文
 * @param orderId - 要移除的订单 Hash
 *
 * 需要同时从两个地方移除：
 * 1. store.orderIds（ID 列表）
 * 2. store.cartOrder.orders（完整订单详情列表）
 */
export const removeEthscription = (orderId: string) => {
  const _orderIdIndex = store.orderIds?.findIndex((item) => item === orderId);
  // ↑ findIndex：找到目标 orderId 在数组中的位置
  // 返回索引（找不到返回 -1）

  const _orderCartIndex = store.cartOrder?.orders.findIndex((item) => item.order.orderHash === orderId);
  // ↑ 在完整订单列表中找到对应的位置
  // ?.：可选链，如果 cartOrder 是 null，直接返回 undefined（不报错）

  if (_orderIdIndex !== -1) {
    store.orderIds.splice(_orderIdIndex, 1);
    // ↑ splice(index, 1)：从 index 位置删除 1 个元素
    // valtio 监测到数组变化 → 触发 subscribe 回调 → 同步 localStorage
  }

  if (_orderCartIndex != undefined && _orderCartIndex !== -1) {
    store.cartOrder?.orders.splice(_orderCartIndex, 1);
    // ↑ 同时从订单详情列表删除（UI 同步更新，不需要重新请求后端）
  }
};

/**
 * 查找铭文是否在购物车中
 * 用途：判断某个 NFT 的"加入/移出购物车"按钮状态
 */
export const findEthsciption = (orderId: string) => {
  return store.orderIds?.find((item) => item === orderId);
  // ↑ find：找到第一个匹配的元素（找不到返回 undefined）
  // 返回值：undefined（不在购物车）或 orderId 字符串（在购物车）
};

/**
 * 切换购物车状态（在购物车中 → 移除，不在 → 加入）
 * 这是一个常用的 toggle 操作，让调用方代码更简洁
 */
export const toggleEthscriptionToCart = (orderId: string) => {
  const _currentOrderId = findEthsciption(orderId);
  if (_currentOrderId) {
    removeEthscription(orderId); // 已在购物车 → 移除
  } else {
    addEthscription(orderId); // 不在购物车 → 添加
  }
};

/**
 * 清空购物车（全部移除）
 * 使用场景：购买成功后清空购物车
 */
export const clearAllEthsciption = () => {
  store.orderIds.splice(0, store.orderIds.length);
  // ↑ splice(0, length)：从第 0 个元素开始，删除所有元素
  //
  // 为什么不用 store.orderIds = []？
  // 因为 valtio 订阅的是 store.orderIds 这个"具体数组对象"，
  // 如果直接赋值新数组，subscribe 监听的是旧对象，不会触发回调
  // 使用 splice 就地修改同一个数组，subscribe 能检测到变化
  // 这是 valtio 使用的一个重要细节！

  store.cartOrder = null;
  // ↑ 同时清空订单详情
};
