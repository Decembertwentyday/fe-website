// 【EthsLabelCard/NftView.tsx】NFT类铭文卡片展示
// 展示集合图标（NftImage）+ 集合名 + tokenId
'use client';

import { Box, Typography } from '@mui/material';
import NftImage from '../NftImage';
import { GetEthscriptionsItem } from '@/services/marketpalce/types';

interface INftView {
  ethscription: GetEthscriptionsItem;
}

const NftView: React.FC<INftView> = ({ ethscription }) => {
  const { content, collectionName } = ethscription.order;

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
      }}
    >
      <Box sx={{ width: '32px', height: '32px', borderRadius: '2px' }}>
        <NftImage content={content} />
      </Box>
      <Box>
        <Typography sx={{ color: '#FFF', fontSize: '14px' }}> {collectionName}</Typography>
        <Typography sx={{ color: 'rgba(255,255,255,0.45)', fontSize: '12px' }}>
          {`#${ethscription.order.ethscriptionNumber}`}
        </Typography>
      </Box>
    </Box>
  );
};

export default NftView;
