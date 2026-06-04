/**
 * ==============================================================
 * 文件：src/app/bridge/page.tsx
 * 作用：跨链桥首页（/bridge）—— Facet L2 ↔ 以太坊主网资产跨链
 *
 * 业务背景：
 *   Swap 在 Facet 链上运行，用户需要先把 ETH/铭文资产「桥接」到 Facet 才能交易。
 *   跨链桥让用户在两条链之间存取资产。
 *
 * 页面布局（左右分栏）：
 *   左：LineChat  — 桥接说明 / 历史曲线（可视化）
 *   右：Deposit   — 实际操作区（选链、输入金额、发起存款/提款）
 *
 * 为什么 Stack gap=170px？
 *   设计稿固定宽度 1156px，左右区域需要足够间距避免拥挤
 *
 * 注意：组件名 Search 是历史命名，实际功能是 Bridge，不影响路由
 * ==============================================================
 */

'use client';

import { Box, Stack } from '@mui/material';

import Deposit from '@/containers/Bridge/Deposit';
import LineChat from '@/containers/Bridge/LineChat';

const Search = () => {
  return (
    <Box sx={{ width: '1156px', margin: '0 auto' }}>
      <Stack direction="row" alignItems="flex-start" gap="170px">
        <LineChat />
        <Deposit />
      </Stack>
    </Box>
  );
};

export default Search;
