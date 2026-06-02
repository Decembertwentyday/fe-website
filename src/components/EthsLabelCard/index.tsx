// ============================================================================
// 【EthsLabelCard/index.tsx】铭文卡片标签（大卡片版本，传入完整 ethscription 对象）
// ----------------------------------------------------------------------------
// 与 EthscriptionLabel 的区别：
//   - EthscriptionLabel：传入离散字段（category/icon/name），适合内嵌在列表行内
//   - EthsLabelCard：传入完整 ethscription 对象，卡片返回更多信息（傷格、数量等）
// 策略模式： category 决定渲染哪个子组件
// ============================================================================

'use client';

import { Fragment } from 'react';

import Erc20View from './Erc20View';
import { GetEthscriptionsItem, categoryType } from '@/services/marketpalce/types';

import NftView from './NftView';
import DomainView from './DomainView';

interface IEthsLabelCard {
  category: categoryType;
  ethscription: GetEthscriptionsItem;
}

const EthsLabelCard: React.FC<IEthsLabelCard> = ({ category, ethscription }) => {
  const EthscriptionViews: { [key: string]: JSX.Element } = {
    token: <Erc20View ethscription={ethscription} />,
    domain: <DomainView ethscription={ethscription} />,
    nft: <NftView ethscription={ethscription} />,
  };

  return EthscriptionViews[category] ?? null;
};

export default EthsLabelCard;
