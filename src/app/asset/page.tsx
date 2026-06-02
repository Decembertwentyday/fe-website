// ============================================================================
// 【app/asset/page.tsx】详细资产列表页（展示 MyAssets 容器）
// ----------------------------------------------------------------------------
// 主要为用户展现代币、资金等汇总量，以太坊原生单位和其衍生的代币资金面板。
// ============================================================================

'use client';

import { Box, IconButton } from '@mui/material';
import { useRouter } from 'next/navigation';

import BackSVG from '@/assets/icons/back.svg';
import MyAssets from '@/containers/MyAssets';

const Asset = () => {
  const router = useRouter();

  return (
    <Box sx={{ minHeight: 'calc(100vh - 203.5px)', width: { xs: '100%', sm: '1160px' }, margin: '0 auto' }}>
      <Box
        sx={{ display: 'flex', alignItems: 'center', mb: '28px', cursor: 'pointer' }}
        onClick={() => {
          router.back();
        }}
      >
        <IconButton sx={{ marginRight: '16px' }}>
          <BackSVG />
        </IconButton>
        My Assets
      </Box>
      <MyAssets />
    </Box>
  );
};

export default Asset;
