// ============================================================================
// 【ConfirmWithdraw.tsx】提取（Withdraw）资产操作弹窗/逻辑
// ----------------------------------------------------------------------------
// 作用：将存入（Deposit）到交易所合约或 Facet L2 中的铭文，提取回用户的以太坊主网 L1 原生钱包地址中。
// 逻辑：
// 1. 发起 evmService 的 withdrawEthscription 交易。
// 2. 成功后更新本地铭文状态 isDeposit = false，触发 Context onChange 更新界面。
// ============================================================================

'use client';

import { Fragment, useEffect, useState } from 'react';
import LoadingButton from '@mui/lab/LoadingButton';
import { useEthscriptionBoxContext } from '@/containers/EthscriptionBox/EthscriptionBoxContext';
import { evmService } from '@/services';
import { useEthersSigner } from '@/hooks/useEthersSigner';
import { MenuItem } from './MoreMenuButton';

interface IConfirmWithdraw {
  open: boolean;
  onClose: (flag: MenuItem['value']) => void;
}

const ConfirmWithdraw: React.FC<IConfirmWithdraw> = ({ open, onClose }) => {
  const { ethscription, onChange } = useEthscriptionBoxContext();
  const singer = useEthersSigner();

  async function handleWithdraw() {
    try {
      await evmService.etchMarket.withdrawEthscription({ singer: singer!, ethscription: ethscription! });
      ethscription!.order.isDeposit = false;
      await onChange('update', 'withdraw', ethscription!);
    } catch (error) {
    } finally {
      onClose('withdraw');
    }
  }

  useEffect(() => {
    if (open) {
      handleWithdraw();
    }
  }, [open]);

  return <Fragment />;
};

export default ConfirmWithdraw;
