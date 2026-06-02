import services from '@/services';
import { GetTransactionStats } from '@/services/ethscriptions/types';
import { Box, Typography } from '@mui/material';
import { useEffect, useState } from 'react';
import _ from 'lodash-es';
import getTruncate from '@/utils/getTruncate';
import ETHSVG from '@/assets/icons/eth16.svg';
import { stat } from 'fs';

const TransactionOverview = () => {
  const [stats, setStats] = useState<GetTransactionStats>({
    sales24h: '',
    totalSales: '',
    volume24h: '',
    totalVolume: '',
  });

  const getStats = async () => {
    const response = await services.ethscriptions.getTransactionStats();

    if (response?.code == 200) {
      setStats(response.data);
    }
  };

  useEffect(() => {
    getStats();
  }, []);

  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(269px, 1fr))',
        justifyContent: 'space-between',
        gridGap: '28px',
      }}
    >
      <Box
        sx={{
          height: '103px',
          p: '24px',
          borderRadius: '12px',
          border: '1px solid #2F343E',
          background: '#202229',
        }}
      >
        <Typography fontSize={'14px'} color={'rgba(255,255,255,0.4)'}>
          Sales (24H)
        </Typography>
        <Typography fontSize="20px" fontWeight="700">
          {stats.sales24h ? getTruncate(stats.sales24h, 0) : '--'}
        </Typography>
      </Box>
      <Box
        sx={{
          height: '103px',
          p: '24px',
          borderRadius: '12px',
          border: '1px solid #2F343E',
          background: '#202229',
        }}
      >
        <Typography fontSize={'14px'} color={'rgba(255,255,255,0.4)'}>
          Volume (24H)
        </Typography>
        <Box display={'flex'} alignItems="center">
          <Typography fontSize="20px" fontWeight="700">
            {stats.volume24h ? getTruncate(stats.volume24h, 0) : '--'}
          </Typography>
          <ETHSVG />
        </Box>
      </Box>
      <Box
        sx={{
          height: '103px',
          p: '24px',
          borderRadius: '12px',
          border: '1px solid #2F343E',
          background: '#202229',
        }}
      >
        <Typography fontSize={'14px'} color={'rgba(255,255,255,0.4)'}>
          Total Sales
        </Typography>
        <Typography fontSize="20px" fontWeight="700">
          {stats.totalSales ? getTruncate(stats.totalSales, 0) : '--'}
        </Typography>
      </Box>
      <Box
        sx={{
          height: '103px',
          p: '24px',
          borderRadius: '12px',
          border: '1px solid #2F343E',
          background: '#202229',
        }}
      >
        <Typography fontSize={'14px'} color={'rgba(255,255,255,0.4)'}>
          Total Volume
        </Typography>
        <Box display={'flex'} alignItems={'center'}>
          <Typography fontSize="20px" fontWeight="700">
            {stats.totalVolume ? getTruncate(stats.totalVolume, 0) : '--'}
          </Typography>
          <ETHSVG />
        </Box>
      </Box>
    </Box>
  );
};

export default TransactionOverview;
