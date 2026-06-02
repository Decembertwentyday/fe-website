'use client';

import Footer from '@/containers/Footer';
import { Box } from '@mui/material';

// export const metadata: Metadata = {
//   title: 'EtchMarket - Home',
//   description: 'EtchMarket, The First Community-driven Ethsciptions Indexer、Marketplace、Dex',
//   keywords: 'ethereum ethscriptions nft marketplace web3 etch defi dex nft did',
// };

export default function Erc20Layout({ children }: { children: React.ReactNode }) {
  return (
    <Box sx={{ pt: '64px' }}>
      {children}
      <Footer />
    </Box>
  );
}
