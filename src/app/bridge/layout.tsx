/**
 * ==============================================================
 * 文件：src/app/bridge/layout.tsx
 * 作用：跨链桥模块（/bridge）的共享布局
 *
 * paddingTop: 188px：
 *   Bridge 页 Header 下方有额外 Banner/说明区域的设计留白，
 *   比 market（64px）更大，避免内容被固定 Header 遮挡
 *
 * 与 asset/layout 的区别：
 *   bridge 带 Footer；asset layout 较简（仅 padding + Footer）
 * ==============================================================
 */

'use client';

import Footer from '@/containers/Footer';
import { Box } from '@mui/material';

export default function BridgeLayout({ children }: { children: React.ReactNode }) {
  return (
    <Box sx={{ paddingTop: '188px', boxSizing: 'border-box' }}>
      <Box sx={{ minHeight: 'calc(100vh - 203.5px)', p: { xs: '0 10px 110px', sm: '0' } }}>{children}</Box>
      <Footer />
    </Box>
  );
}
