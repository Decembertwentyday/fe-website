// ============================================================================
// 【StakingLayout】质押页面布局
// ----------------------------------------------------------------------------
// 职责：
//   为 /staking 及其子路由（/staking/detail）提供共用的页面骨架。
//   与其他 layout 一致：顶部留 64px（Header 高度），内容区居中最大 1160px，底部 Footer。
// ============================================================================

'use client';

import Footer from '@/containers/Footer';

import { Box } from '@mui/material';

export default function StakingLayout({ children }: { children: React.ReactNode }) {
  return (
    // paddingTop 为固定导航栏留出空间，防止内容被遮挡
    <Box sx={{ paddingTop: '64px', boxSizing: 'border-box' }}>
      {/* 内容区：最小高度撑满视口（减去 Footer 高度），水平居中，最大宽度 1160px */}
      <Box sx={{ minHeight: 'calc(100vh - 203.5px)', width: { xs: '100%', sm: '1160px' }, margin: '0 auto' }}>
        {children}
      </Box>
      <Footer />
    </Box>
  );
}
