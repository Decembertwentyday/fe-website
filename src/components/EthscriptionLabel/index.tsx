// ============================================================================
// 【EthscriptionLabel/index.tsx】铭文集合标签组件（策略模式）
// ----------------------------------------------------------------------------
// 根据 category 显示不同风格的集合标签，与 EthscriptionView 类似的策略模式设计。
// Props:
//   category     = 'token' / 'nft' / 'domain'（决定渲染哪个子组件）
//   collectionName = 集合名称（显示文字）
//   icon         = 集合图标 URL（nft 用）
//   domainDot    = 是否显示 .eth 点缀（默认 true）
//   numberId     = 延伸插槽（如显示 #tokenId）
// token 没有图标（纯文字 tick 显示），nft 有集合图标，domain 有 .eth 后缀
// ============================================================================

'use client';

import Erc20View from './Erc20View';
import { categoryType } from '@/services/marketpalce/types';

import NftView from './NftView';
import DomainView from './DomainView';

interface IEthscriptionLabel {
  category: categoryType;
  icon: string;
  collectionName: string;
  domainDot?: boolean;
  numberId?: React.ReactNode;
}

const EthscriptionLabel: React.FC<IEthscriptionLabel> = ({
  category,
  icon,
  collectionName,
  domainDot = true,
  numberId = null,
}) => {
  const EthscriptionViews: { [key: string]: JSX.Element } = {
    token: <Erc20View collectionName={collectionName} numberId={numberId} />,
    nft: <NftView collectionName={collectionName} icon={icon} numberId={numberId} />,
    domain: <DomainView collectionName={collectionName} domainDot={domainDot} numberId={numberId} />,
  };

  return EthscriptionViews[category] ?? null;
};

export default EthscriptionLabel;
