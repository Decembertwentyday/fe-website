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
