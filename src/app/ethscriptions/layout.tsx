/**
 * ==============================================================
 * 文件：src/app/ethscriptions/layout.tsx
 * 作用：铭文浏览模块（/ethscriptions/*）的共享布局
 *
 * 与 search/layout 结构相同：Header 64px + 内容区 padding + Footer
 * 子路由 /ethscriptions/[ethscriptionId] 共用本 layout
 * ==============================================================
 */

'use client';

import Footer from '@/containers/Footer';
import { Box } from '@mui/material';

export default function EthscriptionsLayout({ children }: { children: React.ReactNode }) {
  return (
    <Box sx={{ paddingTop: '64px', boxSizing: 'border-box' }}>
      <Box sx={{ minHeight: 'calc(100vh - 203.5px)', p: { xs: '0 10px 110px', sm: '0 140px 110px' } }}>{children}</Box>
      <Footer />
    </Box>
  );
}
