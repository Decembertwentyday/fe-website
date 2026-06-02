// ============================================================================
// 【DetailBack】详情页返回按钮
// ----------------------------------------------------------------------------
// 职责：
//   显示「← {label}」的返回按钮，点击调用 router.back() 返回上一个路由历史。
//   复用于 staking/detail 页，用于「← Staking / 0x123...」导航。
// ============================================================================

'use client';

import { Box, Typography } from '@mui/material';
import { useRouter } from 'next/navigation';
import ArrowLeft from '@/assets/icons/arrow_left.svg';

interface IDetailBack {
  label: string;
}

const DetailBack: React.FC<IDetailBack> = ({ label }) => {
  const router = useRouter();
  return (
    <Box
      sx={{ display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer', mb: '22px', width: 'max-content' }}
      onClick={() => {
        router.back();
      }}
    >
      <ArrowLeft />
      <Typography
        sx={{
          fontFamily: 'Poppins',
          fontSize: '14px',
          fontWeight: 500,
          color: 'rgba(255,255,255,0.45)',
        }}
      >
        {label}
      </Typography>
    </Box>
  );
};

export default DetailBack;
