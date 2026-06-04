/**
 * ==============================================================
 * 文件：src/app/search/layout.tsx
 * 作用：全局搜索页（/search）的共享布局
 *
 * paddingTop: 64px — 与 market 一致，为固定 Header 留出空间
 * 左右 padding 140px（桌面）— 搜索 results 宽表格需要居中留白
 * Footer — 全站统一页脚
 * ==============================================================
 */

'use client';

import Footer from '@/containers/Footer';
import { Box } from '@mui/material';

export default function SearchLayout({ children }: { children: React.ReactNode }) {
  return (
    <Box sx={{ paddingTop: '64px', boxSizing: 'border-box' }}>
      <Box sx={{ minHeight: 'calc(100vh - 203.5px)', p: { xs: '0 10px 110px', sm: '0 140px 110px' } }}>{children}</Box>
      <Footer />
    </Box>
  );
}
