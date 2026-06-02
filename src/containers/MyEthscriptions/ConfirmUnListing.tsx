// ============================================================================
// 【ConfirmUnListing.tsx】确认取消挂单逻辑
// ----------------------------------------------------------------------------
// 作用：把正在市场上出售的铭文撤回，不在市场显示（取消挂单上链确认）。
// 逻辑流程：
// 1. 调用 evmService.cancelMultipleMakerOrders 方法上链使签名失效（取消交易）。
// 2. 成功后设置 ethscription.order.isListing = false，更新状态。
// ============================================================================

'use client';

import { Fragment, useEffect } from 'react';
import { useEthscriptionBoxContext } from '@/containers/EthscriptionBox/EthscriptionBoxContext';
import { evmService } from '@/services';
import { useEthersSigner } from '@/hooks/useEthersSigner';
import { MenuItem } from './MoreMenuButton';

interface IComfirmListing {
  open: boolean;
  onClose: (flag: MenuItem['value']) => void;
}
const ComfirmListing: React.FC<IComfirmListing> = ({ open, onClose }) => {
  const { ethscription, onChange } = useEthscriptionBoxContext();
  const singer = useEthersSigner();

  async function handleUnListed() {
    try {
      await evmService.etchMarket.cancelMultipleMakerOrders({ singer: singer!, ethscription: [ethscription!] });
      ethscription!.order.isDeposit = true;
      ethscription!.order.isListing = false;
      await onChange('update', 'unlisting', ethscription!);
    } catch (error) {
    } finally {
      onClose('unlist');
    }
  }

  useEffect(() => {
    if (open) {
      handleUnListed();
    }
  }, [open]);

  return <Fragment />;
};

export default ComfirmListing;
