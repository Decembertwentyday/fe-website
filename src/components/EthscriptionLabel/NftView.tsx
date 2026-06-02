// 【EthscriptionLabel/NftView.tsx】NFT类集合标签（较小）
// 显示集合图标（NftImage）+ 集合名，布局水平
'use client';

import { Box } from '@mui/material';
import NftImage from '../NftImage';

interface INftView {
  collectionName: string;
  icon: string;
  numberId?: React.ReactNode;
}

const NftView: React.FC<INftView> = ({ collectionName, icon, numberId = null }) => {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
      <Box sx={{ width: '32px', height: '32px' }}>
        <NftImage content={icon} />
      </Box>
      <Box
        sx={{
          color: '#FFF',
          fontFeatureSettings: "'clig' off, 'liga' off",
          fontSize: '14px',
          fontWeight: 500,
          letterSpacing: '1px',
        }}
      >
        {collectionName}
        {numberId}
      </Box>
    </Box>
  );
};

export default NftView;
