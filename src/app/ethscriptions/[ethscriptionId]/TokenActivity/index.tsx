'use client';

import Footer from '@/containers/Footer';
import services from '@/services';
import { LoadingButton } from '@mui/lab';

import { Box, Button, Typography } from '@mui/material';
import { useEffect, useState } from 'react';
import TableData from './TableData';
import { GetHistoryOrderItem } from '@/services/marketpalce/types';

interface ITokenActivity {
  events?: GetHistoryOrderItem[];
}

const TokenActivity: React.FC<ITokenActivity> = () => {
  return (
    <Box sx={{ mt: '30px' }}>
      <Typography
        sx={{
          color: '#FFF',
          fontSize: '20px',
          fontWeight: '700',
          marginBottom: '12px',
        }}
      >
        Activity
      </Typography>
      <TableData />
    </Box>
  );
};

export default TokenActivity;
