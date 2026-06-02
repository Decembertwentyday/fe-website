// ============================================================================
// 【app/bulk/layout.tsx】批量操作页面的路由布局
// ----------------------------------------------------------------------------
// ============================================================================

'use client';

import Footer from '@/containers/Footer';
import { Box, useMediaQuery } from '@mui/material';

// export const metadata: Metadata = {
//   title: 'EtchMarket - Home',
//   description: 'EtchMarket, The First Community-driven Ethsciptions Indexer、Marketplace、Dex',
//   keywords: 'ethereum ethscriptions nft marketplace web3 etch defi dex nft did',
// };

export default function OwnerLayout({ children }: { children: React.ReactNode }) {
  const matches = useMediaQuery('(min-width:750px)');

  return (
    <Box sx={{ paddingTop: matches ? '0' : '80px', position: 'relative' }}>
      <Box sx={{ minHeight: 'calc(100vh - 203.5px)', p: { xs: '0 10px 110px', sm: '84px 140px 110px' } }}>
        {children}
      </Box>
      <Footer />
    </Box>
  );
}
