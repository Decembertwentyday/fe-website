/**
 * ==============================================================
 * 文件：src/app/launchpad/layout.tsx
 * 作用：Launchpad（发射台）模块（/launchpad）的共享布局
 *
 * pt: 64px — Header 高度；Launchpad 页自带顶部 Banner（227px），layout 只需 Header 偏移
 * Footer — 全站统一
 * ==============================================================
 */

'use client';

import Footer from '@/containers/Footer';
import { Box } from '@mui/material';

export default function LaunchpadLayout({ children }: { children: React.ReactNode }) {
  return (
    <Box sx={{ pt: '64px' }}>
      {children}
      <Footer />
    </Box>
  );
}
