// ============================================================================
// 【app/tokens/layout.tsx】Token 铭文页面的布局容器
// ----------------------------------------------------------------------------
// 职责：
//   为 /tokens 及其所有子路由（/tokens/search、/tokens/info 等）提供统一的布局框架。
//   包含：顶部内边距（给 Header 留空间）+ 底部 Footer。
//
// 样式说明：
//   p: { xs: '0 10px 0', sm: '144px 0 0' }
//     - 移动端（xs）：只有左右 10px 的内边距，没有顶部留空
//     - 桌面端（sm 及以上）：顶部 144px，给 fixed 定位的 Header 留出空间
//
// 关于 metadata 被注释掉：
//   Next.js 的 export const metadata 是服务端专属功能，用于设置 <title> 和 <meta>。
//   但本文件顶部有 'use client' 指令（客户端组件），
//   客户端组件中不能导出 metadata，否则 Next.js 会报错。
//   因此这里把 metadata 注释掉了。
// ============================================================================

'use client';

import Footer from '@/containers/Footer';
import { Box } from '@mui/material';
import { Metadata } from 'next';

// export const metadata: Metadata = {
//   title: 'EtchMarket - Home',
//   description: 'EtchMarket, The First Community-driven Ethsciptions Indexer、Marketplace、Dex',
//   keywords: 'ethereum ethscriptions nft marketplace web3 etch defi dex nft did',
// };

export default function Erc20Layout({ children }: { children: React.ReactNode }) {
  return (
    <Box sx={{ p: { xs: '0 10px 0', sm: '144px 0 0' } }}>
      {children}
      <Footer />
    </Box>
  );
}
