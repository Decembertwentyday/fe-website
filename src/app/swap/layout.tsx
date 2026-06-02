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
    <Box sx={{ paddingTop: '188px', boxSizing: 'border-box' }}>
      <Box sx={{ minHeight: 'calc(100vh - 203.5px)', p: { xs: '0 10px 110px', sm: '0' } }}>{children}</Box>
      <Footer />
    </Box>
  );
}
