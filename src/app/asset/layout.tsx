// ============================================================================
// 【app/asset/layout.tsx】资金资产页的路由布局
// ----------------------------------------------------------------------------
// ============================================================================

'use client';

import Footer from '@/containers/Footer';
import { Box } from '@mui/material';

export default function Erc20Layout({ children }: { children: React.ReactNode }) {
  return (
    <Box sx={{ p: { xs: '0 10px 0', sm: '144px 0 0' } }}>
      {children}
      <Footer />
    </Box>
  );
}
