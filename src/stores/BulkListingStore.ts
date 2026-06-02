/**
 * ============================================================
 * 文件说明：批量操作状态管理（BulkListingStore）
 *
 * 这个 Store 管理"批量操作面板"的所有状态，支持4种批量操作：
 *
 * ┌─────────────────────────────────────────────────────────┐
 * │  用户选择多个铭文后，可以批量执行以下操作：                    │
 * │                                                         │
 * │  1. bulkListEths     → 批量上架（同时给多个铭文设价挂单）     │
 * │  2. bulkTransferEths → 批量转账（同时转给另一个地址）         │
 * │  3. bulkUnlistEths   → 批量下架（同时撤销多个挂单）          │
 * │  4. bulkWithdrawEths → 批量提取（同时从合约取回多个铭文）     │
 * └─────────────────────────────────────────────────────────┘
 *
 * 与 CartStore 的区别：
 *   CartStore        → 买家使用，把要购买的铭文加入购物车
 *   BulkListingStore → 卖家使用，批量管理自己持有的铭文
 *
 * 核心设计：同一个铭文会同时出现在多个列表中！
 *   例如：一个未上架且存在合约里的铭文，会同时出现在：
 *     - ethsList（总列表）
 *     - bulkListEths（可上架列表）
 *     - bulkWithdrawEths（可提取列表）
 *     - bulkTransferEths（可转账列表）
 * ============================================================
 */

'use client';
// ↑ 标记为客户端模块（Next.js App Router 要求，避免服务端访问 localStorage）

import {
  GetEthPriceData,
  GetEthscriptionsItem,
  GetOrderByCartData,
  GetOrderNonceData,
} from '@/services/marketpalce/types';
// ↑ 从市场服务类型文件导入需要的类型定义

import { ethers } from 'ethers';
// ↑ 导入 ethers.js，主要用 ethers.utils.getAddress() 做地址规范化
// 以太坊地址有大小写两种格式（checksum address），比较前需要先规范化

import { proxy } from 'valtio';
// ↑ valtio 核心函数：创建响应式代理对象

// ─── 类型定义 ─────────────────────────────────────────────────────
export interface IBulkEthscriptionsItem extends GetEthscriptionsItem {
  // ↑ 扩展基础铭文类型，增加批量操作需要的字段
  floorPrice: string; // ← 集合地板价（最低成交价），显示给用户参考
  protocol: string; // ← 协议地址（合约地址），区分不同铭文协议
  royalty: string; // ← 版税比例（创作者抽成，单位 bps，1 bps = 0.01%）
}

export interface IBulkListingStore {
  // ↑ 定义整个 Store 的数据结构
  orderNonceData: GetOrderNonceData | null; // ← 用户最新的 nonce 数据（生成签名用）
  ethPriceData: GetEthPriceData | null; // ← ETH 当前美元价格
  open: boolean; // ← 批量操作面板是否打开
  cartOrderLoading: boolean; // ← 订单数据是否正在加载
  openResult: boolean; // ← 操作结果弹窗是否打开
  isSuccess: boolean; // ← 最近一次批量操作是否成功
  ethsList: IBulkEthscriptionsItem[]; // ← 所有已选铭文（总列表）
  bulkListEths: IBulkEthscriptionsItem[]; // ← 可批量上架的铭文（未上架的）
  bulkTransferEths: IBulkEthscriptionsItem[]; // ← 可批量转账的铭文（当前用户持有）
  bulkUnlistEths: IBulkEthscriptionsItem[]; // ← 可批量下架的铭文（已上架的）
  bulkWithdrawEths: IBulkEthscriptionsItem[]; // ← 可批量提取的铭文（在合约里的）
  cartOrder: GetOrderByCartData | null; // ← 购物车订单数据
  selectAll: boolean; // ← UI 状态：是否全选
}

// ─── 创建响应式 Store ────────────────────────────────────────────
export const store = proxy<IBulkListingStore>({
  // ↑ proxy() 把对象变成响应式：修改属性会自动通知组件重新渲染
  orderNonceData: null,
  ethPriceData: null,
  open: false,
  cartOrderLoading: false,
  openResult: false,
  isSuccess: false,
  ethsList: [],
  bulkListEths: [],
  bulkTransferEths: [],
  bulkUnlistEths: [],
  bulkWithdrawEths: [],
  cartOrder: null,
  selectAll: false,
});

export const setIsSuccess = async (isSuccess: boolean) => {
  // ↑ 设置批量操作结果（成功/失败）
  // async 关键字这里多余（内部没有 await），但不影响运行
  store.isSuccess = isSuccess;
};

export const setOpenResult = async (openResult: boolean) => {
  // ↑ 控制操作结果弹窗的显示/隐藏
  store.openResult = openResult;
};

export const setOpen = async (open: boolean) => {
  // ↑ 控制批量操作面板的显示/隐藏
  store.open = open;
  if (open) {
    // ↓ 打开面板：触发一次 loading 状态切换（虽然立即设置为 false，但能触发 UI 刷新）
    store.cartOrderLoading = true;
    store.cartOrderLoading = false;
  } else {
    // ↓ 关闭面板：清空订单数据，避免下次打开时看到旧数据
    store.cartOrder = null;
  }
};

export const addEthscription = (eths: IBulkEthscriptionsItem) => {
  // ↑ 添加一个铭文到批量操作列表
  // 关键：同一铭文会根据状态同时加入多个子列表
  store.ethsList.push(eths);
  // ↑ 先加入总列表（所有已选铭文，不管状态）

  const wagmiStore = JSON.parse(localStorage.getItem('wagmi.store') ?? '');
  // ↑ 从 wagmi 的 localStorage 缓存中读取当前钱包地址
  // ?? '' 防御：localStorage 没有值时用空字符串（避免 JSON.parse(null) 报错）

  // 有效铭文
  if (eths?.order.isVerified) {
    // ↑ isVerified = 已被 Ethscription 协议确认的合法铭文
    if (eths.order.isListing == false) {
      store.bulkListEths.push(eths);
      // ↑ 未上架的有效铭文 → 可批量上架
    }

    if (eths.order.isListing == true) {
      store.bulkUnlistEths.push(eths);
      // ↑ 已上架的有效铭文 → 可批量下架
    }

    if (
      eths.order.isListing == false &&
      ethers.utils.getAddress(eths.order.owner) == ethers.utils.getAddress(eths.order.protocolAddress)
      // ↑ 条件：未上架 且 拥有者地址 == 协议合约地址
      // 含义：铭文在合约里托管但没有上架 → 可以提取（withdraw）回钱包
    ) {
      store.bulkWithdrawEths.push(eths);
    }
  }

  // 无效铭文，也可以转账
  if (
    eths.order.isListing == false &&
    ethers.utils.getAddress(eths.order.owner) == ethers.utils.getAddress(wagmiStore.state.data.account)
    // ↑ 条件：未上架 且 拥有者 == 当前连接的钱包地址
    // 即使是"未验证"的铭文，只要在我钱包里，就能转账（但不能上架卖）
  ) {
    store.bulkTransferEths.push(eths);
  }
};

// 只更新“批量”挂单的数据
export const updateBulkListEths = (eths: IBulkEthscriptionsItem) => {
  // ↑ 更新 bulkListEths 里某个铭文的数据（用于价格修改后刷新显示）
  store.bulkListEths = store.bulkListEths.map((item) => {
    // ↑ map 遍历所有元素，找到匹配的替换，找不到原样返回
    if (item.order.ethscriptionId === eths.order.ethscriptionId) {
      return eths; // ← 找到：用新数据替换
    }
    return item; // ← 没找到：原样保留
  });
};

// 删除 多状态的 批量数据
export const removeBulkEthsciption = (
  eths: IBulkEthscriptionsItem,
  key: 'bulkListEths' | 'bulkTransferEths' | 'bulkUnlistEths' | 'bulkWithdrawEths',
  // ↑ 联合类型：只允许传这4个字符串之一（TypeScript 类型约束，避免拼写错误）
) => {
  let _orderIdIndex = store?.[key].findIndex((item) => item.order.ethscriptionId === eths.order.ethscriptionId);
  // ↑ store?.[key] 是动态属性访问，等价于 store.bulkListEths 等
  // findIndex 返回第一个匹配元素的下标，没找到返回 -1

  if (_orderIdIndex !== -1) {
    store?.[key].splice(_orderIdIndex, 1);
    // ↑ splice(起始位置, 删除数量)：就地修改数组
    // 为什么用 splice 而不是 filter？valtio 监听的是同一个数组对象，
    // 用 filter 返回新数组赋值会断开监听
  }
};

// 全家桶铭文, 删除单个数据
export const removeEthscription = (eths: IBulkEthscriptionsItem) => {
  // ↑ 从所有列表中删除一个铭文（同时清理 ethsList 和相关子列表）
  let _orderIdIndex = store.ethsList?.findIndex((item) => item.order.ethscriptionId === eths.order.ethscriptionId);

  const wagmiStore = JSON.parse(localStorage.getItem('wagmi.store') ?? '');
  // ↑ 读取当前钱包地址（判断是否是自己的铭文）

  if (_orderIdIndex !== -1) {
    store.ethsList.splice(_orderIdIndex, 1);
    // ↑ 先从总列表删除
  }

  // ↓ 根据铭文状态，从对应子列表删除（逻辑与 addEthscription 镜像对称）
  if (eths.order.isListing == false) {
    removeBulkEthsciption(eths, 'bulkListEths');
  }

  if (eths.order.isListing == true) {
    removeBulkEthsciption(eths, 'bulkUnlistEths');
  }

  if (
    eths.order.isListing == false &&
    ethers.utils.getAddress(eths.order.owner) == ethers.utils.getAddress(wagmiStore.state.data.account)
  ) {
    removeBulkEthsciption(eths, 'bulkTransferEths');
  }

  if (
    eths.order.isListing == false &&
    ethers.utils.getAddress(eths.order.owner) == ethers.utils.getAddress(eths.order.protocolAddress)
  ) {
    removeBulkEthsciption(eths, 'bulkWithdrawEths');
  }
};

// 全家桶铭文数据查找
export const findEthsciption = (eths: IBulkEthscriptionsItem) => {
  // ↑ 在总列表中查找某个铭文（用于判断是否已选中）
  return store.ethsList?.find((item) => item.order.ethscriptionId === eths.order.ethscriptionId);
  // ↑ find 返回第一个匹配元素，没找到返回 undefined
};

// UI 状态, 全部选中
export const setSelectAll = (checked: boolean) => {
  store.selectAll = checked;
};

// 全家桶铭文, 添加、删除 切换
export const toggleEthscriptionToCart = (eths: IBulkEthscriptionsItem) => {
  // ↑ 已在列表里 → 删除；不在 → 添加
  // 用于"勾选/取消勾选"铭文卡片
  const _currentOrderId = findEthsciption(eths);
  if (_currentOrderId) {
    removeEthscription(eths); // ← 已选中 → 取消选中
  } else {
    addEthscription(eths); // ← 未选中 → 选中
  }
};

// 全家桶铭文，全部删除
export const clearAllEthsciption = () => {
  // ↑ 一键清空所有列表（用户点击"清空选择"按钮时调用）
  // 注意：每个数组都用 splice(0, length) 而不是 = []
  // 原因同上：保持数组引用不变，valtio 才能正确响应
  store.ethsList.splice(0, store.ethsList.length);
  store.bulkListEths.splice(0, store.bulkListEths.length);
  store.bulkTransferEths.splice(0, store.bulkTransferEths.length);
  store.bulkUnlistEths.splice(0, store.bulkUnlistEths.length);
  store.bulkWithdrawEths.splice(0, store.bulkWithdrawEths.length);

  store.cartOrder = null;
  // ↑ 顺便清空订单数据
};

export const setOrderNonceData = (orderNonceData: GetOrderNonceData) => {
  store.orderNonceData = orderNonceData;
};

export const setEthPriceData = (ethPriceData: GetEthPriceData) => {
  store.ethPriceData = ethPriceData;
};
