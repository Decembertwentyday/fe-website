// 【EthsLabelCard/Erc20View.tsx】Token类铭文卡片展示
// collectionName 格式："protocol tick"（空格分隔）
// 显示 tick、amount、可买/可卖数量等信息
'use client';

import { GetEthscriptionsItem } from '@/services/marketpalce/types';
import { Box, BoxProps, Typography } from '@mui/material';

interface IErc20View {
  ethscription: GetEthscriptionsItem;
}

const BorderSx: BoxProps['sx'] = {
  p: '2px 4px',
  borderRadius: '3px',
  border: '1px solid rgba(255, 255, 255, 0.20)',
  color: 'rgba(255,255,255,0.45)',
  fontSize: '12px',
  fontWeight: '400',
};

const Erc20View: React.FC<IErc20View> = ({ ethscription }) => {
  const [p, tick] = ethscription.order.collectionName.split(' ');
  const content = ethscription.order.content.replace('data:,', '');
  const parsedContent = JSON.parse(content);

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <Box sx={{ fontSize: '14px', color: 'rgba(229, 255, 101, 1)' }}>{tick}</Box>
        <Box sx={{ fontSize: '12px', color: '#fff' }}>{`#${ethscription.order.ethscriptionNumber}`}</Box>
      </Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: '8px', mt: '5px' }}>
        <Box sx={BorderSx}>{p}</Box>
        <Box sx={BorderSx}>{parsedContent.op}</Box>
        <Box sx={BorderSx}>{`#${ethscription.order.tokenId}`}</Box>
      </Box>
    </Box>
  );
};

export default Erc20View;
