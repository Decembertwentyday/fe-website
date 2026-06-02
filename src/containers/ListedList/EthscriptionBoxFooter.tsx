// ============================================================================
// 【EthscriptionBoxFooter.tsx】挂单列表(ListedList)展示所用的铭文卡片底部栏
// ----------------------------------------------------------------------------
// 作用：注入到市场的 EthscriptionBox 的 actions 中。
// 逻辑：
// 仅当卡片是正在挂牌状态 (isListing) 才显示：【Buy】和【购物车】两个按钮组件。
// ============================================================================

'use client';

import { Box } from '@mui/material';

import ConfirmBuy from './ConfirmBuy';
import { useEthscriptionBoxContext } from '../EthscriptionBox/EthscriptionBoxContext';
import { useAccount } from 'wagmi';
import CartButton from './CartButton';

const EthscriptionBoxFooter = () => {
  const { ethscription } = useEthscriptionBoxContext();
  return (
    ethscription?.order.isListing && (
      <Box
        sx={{
          pb: '16px',
          display: 'flex',
          alignItems: 'flex-end',
          justifyContent: 'space-between',
          gap: '16px',
        }}
      >
        <ConfirmBuy ethscription={ethscription} />
        <CartButton />
      </Box>
    )
  );
};

export default EthscriptionBoxFooter;
