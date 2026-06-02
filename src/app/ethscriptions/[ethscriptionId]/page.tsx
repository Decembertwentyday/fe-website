// ============================================================================
// 【app/ethscriptions/[ethscriptionId]/page.tsx】单张铭文详细静态全景页
// ----------------------------------------------------------------------------
// 通过从 params 获取 ethscriptionId 动态路由，根据铭文特定 ID
// 拉取服务器包含其价格，历史，与图片渲染（TokenDisplay）等属性信息的展示底座。
// ============================================================================

'use client';

import { Box, useMediaQuery } from '@mui/material';

import { GetEthscriptionAssetItem, GetEthscriptionsItem } from '@/services/marketpalce/types';

import services from '@/services';
import TokenDisplay from './TokenDisplay';
import TokenDetails from './TokenDetails';
import { useEffect, useState } from 'react';

const EthscriptionInfo = ({ params }: { params: { ethscriptionId: string } }) => {
  const matches = useMediaQuery('(min-width:750px)');

  const ethsId = params.ethscriptionId;
  const [ethscriptionAsset, setEthscriptionAsset] = useState<GetEthscriptionAssetItem>();

  async function getEthscriptionInfo() {
    const response = await services.marketplace.getEtherscriptionAsset(ethsId);
    setEthscriptionAsset(response?.data);
  }

  useEffect(() => {
    if (ethsId !== '') {
      getEthscriptionInfo();
    }
  }, []);
  return (
    <Box
      sx={{
        p: '40px 0',
        boxSizing: 'border-box',
        width: '100%',
        display: 'flex',
        flexDirection: matches ? 'row' : 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '28px',
      }}
    >
      <TokenDisplay ethscriptionAsset={ethscriptionAsset} />
      <TokenDetails ethscriptionAsset={ethscriptionAsset} />
    </Box>
  );
};

export default EthscriptionInfo;
