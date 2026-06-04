/**
 * ==============================================================
 * 文件：src/app/asset/layout.tsx
 * 作用：个人资产页（/asset）的路由布局
 *
 * padding 144px（桌面顶部）：
 *   asset/page 自带返回栏和内容区，layout 只负责顶距 + Footer
 * 移动端的 0 10px：左右留边，Footer 贴底
 * ==============================================================
 */

'use client';

import Footer from '@/containers/Footer';
import { Box } from '@mui/material';

export default function AssetLayout({ children }: { children: React.ReactNode }) {
  return (
    <Box sx={{ p: { xs: '0 10px 0', sm: '144px 0 0' } }}>
      {children}
      <Footer />
    </Box>
  );
}
