// 【EthscriptionLabel/DomainView.tsx】域名类集合标签（较小）
// domainDot=true 时显示完整域名（如 alice.eth），false 时只显示主名
// numberId 延伸插槽，用于附加展示内容
'use client';

import { Box } from '@mui/material';

interface INftView {
  collectionName: string;
  domainDot?: boolean;
  numberId?: React.ReactNode;
}

const DomainView: React.FC<INftView> = ({ collectionName, domainDot, numberId = null }) => {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', flexDirection: 'column', gap: '4px' }}>
      <Box
        sx={{
          color: '#E5FF65',
          fontFeatureSettings: "'clig' off, 'liga' off",
          fontSize: '14px',
          fontWeight: 500,
          letterSpacing: '1px',
        }}
      >
        {`${domainDot ? '.' : ''}${collectionName.replace(/\s/g, '⌷')}`}
      </Box>
      {numberId}
    </Box>
  );
};

export default DomainView;
