/**
 * ==============================================================
 * 文件：src/app/ethscriptions/page.tsx
 * 作用：铭文浏览页（/ethscriptions）—— 展示最新 Ethscription 卡片流
 *
 * 薄页面模式：只渲染 RecentEthsCards 容器
 * RecentEthsCards 负责：
 *   - 无限滚动加载（react-infinite-scroll-component）
 *   - 分类筛选（FilterSelect）
 *   - 卡片点击跳转 /ethscriptions/[ethscriptionId]
 *
 * 与首页的区别：
 *   首页（/）也有最新铭文，但布局不同（HomeLayout + 搜索为主）
 *   本页专注「浏览全部最新铭文」，适合深度探索
 * ==============================================================
 */

'use client';
import RecentEthsCards from '@/containers/RecentEthsCards.tsx';
import { Box } from '@mui/material';

const RecentEths = () => {
  return (
    <Box>
      <RecentEthsCards />
    </Box>
  );
};

export default RecentEths;
