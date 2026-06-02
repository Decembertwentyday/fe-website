'use client';

import Footer from '@/containers/Footer';
import { Box } from '@mui/material';
import { Metadata } from 'next';

// export const metadata: Metadata = {
//   title: 'EtchMarket - Home',
//   description: 'EtchMarket, The First Community-driven Ethsciptions Indexer、Marketplace、Dex',
//   keywords: 'ethereum ethscriptions nft marketplace web3 etch defi dex nft did',
// };

export default function Erc20Layout({ children }: { children: React.ReactNode }) {
  return (
    <Box sx={{ paddingTop: '64px', boxSizing: 'border-box' }}>
      <Box sx={{ minHeight: 'calc(100vh - 203.5px)', width: { xs: '100%', sm: '1160px' }, margin: '0 auto' }}>
        {children}
      </Box>
      <Footer />
    </Box>
  );
}
