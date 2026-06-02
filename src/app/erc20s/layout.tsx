// 【布局层 - ERC20 公平发射板块专属布局】
// 作用：限定该路由板块的顶部留白和页面宽容度，内嵌公用 Footer。为主页面留出高度（minHeight）。
'use client';

import Footer from '@/containers/Footer';
import { Box } from '@mui/material';

export default function Erc20Layout({ children }: { children: React.ReactNode }) {
  return (
    <Box sx={{ paddingTop: '64px', boxSizing: 'border-box' }}>
      <Box sx={{ minHeight: 'calc(100vh - 203.5px)', p: { xs: '0 10px 110px', sm: '0 140px 110px' } }}>
        {children}
        <Footer />
      </Box>
    </Box>
  );
}
