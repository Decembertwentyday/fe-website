// ============================================================================
// 【app/owner/layout.tsx】用户资产/主页详情的路由布局
// ----------------------------------------------------------------------------
// 提供了顶部留白以及底部固定的 Footer 垫底。
// ============================================================================

'use client';

import Footer from '@/containers/Footer';
import { Box } from '@mui/material';
import BulkOperation from '@/containers/MyEthscriptions/BulkOperation';

// export const metadata: Metadata = {
//   title: 'EtchMarket - Home',
//   description: 'EtchMarket, The First Community-driven Ethsciptions Indexer、Marketplace、Dex',
//   keywords: 'ethereum ethscriptions nft marketplace web3 etch defi dex nft did',
// };

export default function OwnerLayout({ children }: { children: React.ReactNode }) {
  return (
    <Box sx={{ paddingTop: '80px', position: 'relative' }}>
      <Box sx={{ minHeight: 'calc(100vh - 203.5px)', p: { xs: '0 10px 110px', sm: '0 140px 110px' } }}>{children}</Box>
      <Footer />
    </Box>
  );
}
