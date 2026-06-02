// ============================================================================
// 【containers/EthscriptionBox/EthscriptionBoxContext.tsx】铭文卡片上下文
// ----------------------------------------------------------------------------
// 职责：
//   提供 React Context，让 EthscriptionBox 的子组件（如 footer 中的操作按钮）
//   可以直接访问父级数据，无需通过 props 层层传递。
//
// 为什么用 Context 而不是 props？
//   EthscriptionBox 允许外部传入任意 footer 插槽（JSX.Element），
//   footer 里的按钮（如 BuyButton）需要 ethscription 数据，
//   但如果用 props 传递，父组件就需要关心 footer 的实现细节。
//   用 Context 后，footer 组件内部直接调用 useEthscriptionBoxContext()
//   就能拿到数据，父组件只需传入 footer 节点即可，解耦更彻底。
//
// IEthscriptionBoxContext 三个字段：
//   ethscription = 铭文完整数据（市场接口返回的 GetEthscriptionsItem）
//   isInCart     = 是否已加入购物车（用于按钮状态判断，如"已加入"禁用再次点击）
//   onChange     = 操作完成回调，触发父组件刷新
//
// onChange 的 op 参数（操作类型）：
//   'update' = 铭文状态变化，需要刷新（如价格变更、挂单上架等）
//   'remove' = 铭文从当前列表中移除（如取消挂单、买走后不再显示）
//
// onChange 的 action 参数（具体操作）：
//   listing       = 挂单出售
//   edit-listing  = 修改挂单价格
//   transfer      = 转账给他人
//   unlisting     = 取消挂单
//   withdraw      = 从质押合约撤回
//   ethscribed    = 铭刻新铭文
//   buy           = 购买
//   stake         = 质押
//   redeem        = 赎回（质押期满后取回）
//   burn          = 销毁
// ============================================================================

import { GetEthscriptionsItem } from '@/services/marketpalce/types';
import { createContext, useContext } from 'react';

export interface IEthscriptionBoxContext {
  ethscription: GetEthscriptionsItem | null;
  isInCart: boolean;
  onChange: (
    op: 'update' | 'remove',
    action:
      | 'listing'
      | 'edit-listing'
      | 'transfer'
      | 'unlisting'
      | 'withdraw'
      | 'ethscribed'
      | 'buy'
      | 'stake'
      | 'redeem'
      | 'burn',
    val: GetEthscriptionsItem,
  ) => Promise<void>;
}

// 创建 Context（默认值：ethscription=null，isInCart=false，onChange 空函数）
export const EthscriptionBoxContext = createContext<IEthscriptionBoxContext>({
  ethscription: null,
  isInCart: false,
  onChange: async () => {},
});

// 便捷 Hook：子组件通过 useEthscriptionBoxContext() 获取 Context 数据
export const useEthscriptionBoxContext = () => useContext(EthscriptionBoxContext);
