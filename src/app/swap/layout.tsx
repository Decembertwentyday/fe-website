/**
 * ==============================================================
 * 文件：src/app/swap/layout.tsx
 * 作用：Swap（代币兑换）模块（/swap）的共享布局
 *
 * paddingTop: 188px — 与 bridge 相同，Swap 页顶部有 Banner/说明区域
 * Footer — 全站统一
 *
 * 子页面 /swap/page.tsx 渲染 SwapContainer（Facet DEX 交互）
 * ==============================================================
 */

'use client';

import Footer from '@/containers/Footer';
import { Box } from '@mui/material';

export default function SwapLayout({ children }: { children: React.ReactNode }) {
  return (
    <Box sx={{ paddingTop: '188px', boxSizing: 'border-box' }}>
      <Box sx={{ minHeight: 'calc(100vh - 203.5px)', p: { xs: '0 10px 110px', sm: '0' } }}>{children}</Box>
      <Footer />
    </Box>
  );
}
