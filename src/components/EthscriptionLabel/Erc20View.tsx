// 【EthscriptionLabel/Erc20View.tsx】Token类集合标签（较小）
// collectionName 格式为 "protocol tick contractAddress"（空格分隔）
// 显示 tick + 缩短后的合约地址（正确区分不同部署的同名 Token）
'use client';

import { formatAddress } from '@/utils/addressHelper';
import { Box, Typography } from '@mui/material';

interface IErc20View {
  collectionName: string;
  numberId?: React.ReactNode;
}

const Erc20View: React.FC<IErc20View> = ({ collectionName, numberId = null }) => {
  const [p, tick, CA] = collectionName.split(' ');

  return (
    <Box
      sx={{
        width: 'max-content',
      }}
    >
      <Box
        sx={{
          color: '#E5FF65',
          fontSize: '16px',
          fontWeight: '500',
          lineHeight: '16px',
          letterSpacing: '1px',
          display: 'flex',
          alignItems: 'center',
        }}
      >
        {tick}
        <Box
          sx={{
            borderRadius: '30px',
            padding: '0 4px',
            background: 'rgba(255, 255, 255, 0.10)',
            color: '#FFF',
            fontSize: '12px',
            ml: '6px',
          }}
        >
          {p}
        </Box>
      </Box>
      {CA && <Typography sx={{ fontSize: '14px', color: 'rgba(255,255,255,0.45)' }}>{formatAddress(CA)}</Typography>}

      {numberId}
    </Box>
  );
};

export default Erc20View;
