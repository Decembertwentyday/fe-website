// ============================================================================
// 【containers/EthscriptionBox/EthscriptionView.tsx】铭文视图路由组件
// ----------------------------------------------------------------------------
// 职责：
//   根据铭文的类别（category），选择对应的视图组件进行渲染。
//   这是一个"策略模式"（Strategy Pattern）的经典用法：
//   用对象映射（key → 组件）替代冗长的 if-else 或 switch 语句。
//
// 支持的 category 类别：
//   token  → Erc20View（展示代币符号、进度条、数量等信息）
//   nft    → NftView（展示 NFT 图片/媒体文件）
//   domain → DomainView（展示域名文字）
//   image  → NftView（与 nft 共用同一个视图，因为展示逻辑相同）
//
// 为什么 image 用 NftView？
//   image 类别的铭文本质上也是图片，展示逻辑与 nft 完全一样，
//   所以复用 NftView，不单独创建一个视图，减少重复代码。
//
// slotCheckBox：
//   从 EthscriptionBox 父组件传入的 Checkbox 节点（用于批量挂单选择）
//   透传给各视图组件，由视图组件决定放置位置（通常是图片右上角）
//
// 如果 category 不在映射中：
//   EthscriptionViews?.[ethscription.order.category] 会是 undefined
//   返回 null（不渲染），安全降级
// ============================================================================

'use client';

import Erc20View from './Erc20View';
import { GetEthscriptionsItem } from '@/services/marketpalce/types';

import NftView from './NftView';
import DomainView from './DomainView';

interface IEthscriptionView {
  ethscription: GetEthscriptionsItem;
  slotCheckBox?: React.ReactNode; // 批量选择 Checkbox（来自父容器，可选）
}

const EthscriptionView: React.FC<IEthscriptionView> = ({ ethscription, slotCheckBox = null }) => {
  // 策略模式：用对象映射替代 switch/if-else，key 是 category，value 是对应的视图 JSX
  const EthscriptionViews: { [key: string]: JSX.Element } = {
    token: <Erc20View ethscription={ethscription} slotCheckBox={slotCheckBox} />, // 代币类铭文
    nft: <NftView ethscription={ethscription} slotCheckBox={slotCheckBox} />, // NFT 类铭文
    domain: <DomainView ethscription={ethscription} slotCheckBox={slotCheckBox} />, // 域名类铭文
    image: <NftView ethscription={ethscription} slotCheckBox={slotCheckBox} />, // 图片类铭文（复用 NftView）
  };

  // 取对应 category 的视图组件；category 不匹配时返回 null（安全降级）
  return EthscriptionViews?.[ethscription.order.category] ?? null;
};

export default EthscriptionView;
