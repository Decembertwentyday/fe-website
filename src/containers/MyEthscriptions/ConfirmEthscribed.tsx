// ============================================================================
// 【ConfirmEthscribed.tsx】确认铭刻操作安钮（上链）
// ----------------------------------------------------------------------------
// 作用：如果某个铭文在平台内部记录为"未上链"（如购买了盲盲盒/抢跑数据），可点击此按钮发送交易真正铭刻到链上。
// 逻辑流程：
// 1. 请求后端 `getEthscribe` 接口获取需铭文 calldata 内容（如 data:,{"p":"erc-20"...} 的十六进制）
// 2. 调用 `evmService.inscribeEthscription` 方法，向自己的地址发送上述 calldata，完成铭刻。
// ============================================================================

'use client';

import { useState } from 'react';
import LoadingButton from '@mui/lab/LoadingButton';
import { useEthscriptionBoxContext } from '@/containers/EthscriptionBox/EthscriptionBoxContext';
import services, { evmService } from '@/services';
import { useEthersSigner } from '@/hooks/useEthersSigner';

const ConfirmEthscribed = () => {
  const { ethscription } = useEthscriptionBoxContext();
  const singer = useEthersSigner();
  const [isSumbit, setIsSubmit] = useState<boolean>(false);
  const [isEthscribed, setEthscribed] = useState<boolean>(false);

  async function handleEthscribed() {
    try {
      setIsSubmit(true);

      const response = await services.marketplace.getEthscribe({
        collectionName: ethscription?.order.collectionName || '',
        tokenId: ethscription?.order.tokenId || '',
      });

      if (response?.code == 200) {
        await evmService.etchMarket.inscribeEthscription({ singer: singer!, data: response.data.data });
        setEthscribed(true);
      }
    } catch (error) {
      setEthscribed(false);
    } finally {
      setIsSubmit(false);
    }
  }

  return (
    <LoadingButton
      variant="outlined"
      fullWidth
      disableElevation
      loading={isSumbit}
      color="primary"
      disabled={isEthscribed}
      sx={{
        margin: '0 auto',
        height: '36px',
        borderRadius: '46px',
        border: '1px solid #D5E970',
        textTransform: 'none',
        '&:hover': {
          color: '#000',
          bgcolor: 'rgba(229, 255, 101, 1)',
        },
      }}
      onClick={handleEthscribed}
    >
      {isEthscribed ? 'Ethscribed' : 'Ethscribe'}
    </LoadingButton>
  );
};

export default ConfirmEthscribed;
