// ============================================================================
// 【EthscriptionsBoxFooter.tsx】铭文卡片底部操作栏（针对"我的铭文"页面）
// ----------------------------------------------------------------------------
// 作用：注入到 EthscriptionBox 的 actions 插槽中，控制我的铭文的各种操作。
// 主要逻辑：
// 1. 如果铭文是未上链状态（isUninscribed），显示【立即铭刻 ConfirmEthscribed】按钮
// 2. 如果已挂单（isListing），显示【编辑挂单 ConfirmEditListing】按钮
// 3. 默认显示【挂单 ConfirmListing】按钮
// 4. 右侧有【更多 MoreMenuButton】菜单，展开包含转移、提取、质押、销毁、取消挂单等操作。
// ============================================================================

'use client';

import { Box } from '@mui/material';
import { useImmer } from 'use-immer';

import ConfirmListing from './ConfirmListing';
import ConfirmUnListing from './ConfirmUnListing';
import ConfirmTransfer from './ConfirmTransfer';
import { useEthscriptionBoxContext } from '../EthscriptionBox/EthscriptionBoxContext';
import ConfirmWithdraw from './ConfirmWithdraw';
import ConfirmEthscribed from './ConfirmEthscribed';
import ConfirmEditListing from './ConfirmEditListing';
import ConfirmStake from './ConfirmStake';
import ConfirmBurn from './ConfirmBurn';
import MoreMenuButton, { MenuItem } from './MoreMenuButton';

const EthscriptionBoxFooter = () => {
  const { ethscription } = useEthscriptionBoxContext();
  const [buttonFlag, setButtonFlag] = useImmer<{ [key in MenuItem['value']]: boolean }>({
    transfer: false,
    withdraw: false,
    stake: false,
    burn: false,
    unlist: false,
  });

  function step() {
    if (ethscription?.order.isUninscribed) {
      return <ConfirmEthscribed />;
    }

    if (ethscription?.order.isListing) {
      return <ConfirmEditListing />;
    }

    return <ConfirmListing disabled={!Boolean(ethscription?.order.isVerified)} />;
  }

  function handleMenuOpen(item: MenuItem) {
    setButtonFlag((state) => {
      state[item.value] = true;
    });
  }

  function handleMenuClose(key: MenuItem['value']) {
    setButtonFlag((state) => {
      state[key] = false;
    });
  }

  return (
    <Box
      sx={{
        p: '16px 0',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '10px',
      }}
    >
      {step()}
      <MoreMenuButton onSelectMenu={handleMenuOpen} />

      <ConfirmUnListing open={buttonFlag.unlist} onClose={handleMenuClose} />
      <ConfirmTransfer open={buttonFlag.transfer} onClose={handleMenuClose} />
      <ConfirmWithdraw open={buttonFlag.withdraw} onClose={handleMenuClose} />
      <ConfirmStake open={buttonFlag.stake} onClose={handleMenuClose} />
      <ConfirmBurn open={buttonFlag.burn} onClose={handleMenuClose} />
    </Box>
  );
};

export default EthscriptionBoxFooter;
