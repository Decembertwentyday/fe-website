'use client';

import { Box, IconButton } from '@mui/material';
import { useRouter, useSearchParams } from 'next/navigation';
import BackSVG from '@/assets/icons/back.svg';
import TokenOverview from '@/containers/TokenOverview';
import TokenTables from '@/containers/TokenTables';
import EthscriptionLabel from '@/components/EthscriptionLabel';

const CoinDetails = () => {
  const router = useRouter();

  const queryParams = useSearchParams();

  const data = {
    p: queryParams?.get('p') ?? '',
    tick: queryParams?.get('tick') ?? '',
    ca: queryParams?.get('ca') ?? '',
  };

  return (
    <Box sx={{ minHeight: 'calc(100vh - 203.5px)', width: { xs: '100%', sm: '1160px' }, margin: '0 auto' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: '28px' }}>
        <IconButton
          sx={{ marginRight: '16px' }}
          onClick={() => {
            router.back();
          }}
        >
          <BackSVG />
        </IconButton>
        <EthscriptionLabel collectionName={`${data.p} ${data.tick}`} category="token" icon="" />
      </Box>
      <TokenOverview {...data} />
      <TokenTables {...data} />
    </Box>
  );
};

export default CoinDetails;
