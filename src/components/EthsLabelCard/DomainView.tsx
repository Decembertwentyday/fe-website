// 【EthsLabelCard/DomainView.tsx】域名类铭文卡片展示
// 使用完整 ethscription 对象，从 order.content 提取域名显示
// content 可能含 'data:,' 前缀，需加以剔除
'use client';

import { GetEthscriptionsItem } from '@/services/marketpalce/types';
import { Box, Typography } from '@mui/material';

interface INftView {
  ethscription: GetEthscriptionsItem;
}

const DomainView: React.FC<INftView> = ({ ethscription }) => {
  let { content } = ethscription.order;
  if (content.includes('data')) {
    content = content.replace('data:,', '');
  }

  const ethsId = ethscription.order.ethscriptionNumber;

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'flex-start',
        flexDirection: 'column',
        gap: '4px',
      }}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'flex-end',
          gap: '8px',
        }}
      >
        <Typography
          sx={{
            color: '#E5FF65',
            fontSize: '14px',
            fontWeight: 500,
          }}
        >
          {content.replace(/\s/g, '⌷')}
        </Typography>
        <Typography
          sx={{
            color: '#FFF',
            fontSize: '12px',
            fontWeight: 500,
          }}
        >
          {`#${ethsId}`}
        </Typography>
      </Box>
      <Typography
        sx={{
          fontSize: '12px',
          p: '0 4px',
          boxSizing: 'border-box',
          borderRadius: '3px',
          border: '1px solid rgba(255, 255, 255, 0.20)',
          color: 'rgba(255, 255, 255, 0.45)',
        }}
      >
        {ethscription.order.trait}
      </Typography>
    </Box>
  );
};

export default DomainView;
