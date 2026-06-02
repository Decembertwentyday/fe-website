// ============================================================================
// 【/swap 路由页面】注意：文件名是 swap，但实际内容是 Bridge（跨链桥接）！
// ----------------------------------------------------------------------------
// 为什么文件名是 swap 但内容是 Bridge？
//   这是历史遗留问题。早期项目可能把 Bridge 和 Swap 的路由混用了。
//   从 NavigationAPP.tsx 可以看到，Swap 菜单项已被注释掉（暂时封印），
//   因此 /swap 路径目前承载的是 Bridge 功能。
//
// Bridge 是什么？
//   跨链桥接：将资产从一条区块链（如以太坊主网）转移到另一条（如 Facet L2）的工具。
//   Bridge 页面包含两个子容器：
//   - LineChat（注意拼写，不是 LineChart）：Token 价格走势图
//   - Deposit：存入/提出资产的表单
//
// 函数名 Search 也是历史遗留（应该叫 SwapPage 或 BridgePage），保持原样不修改。
// ============================================================================

'use client';

import { Box, Stack } from '@mui/material';

// Bridge 内的价格走势图组件（LineCh-a-t，注意：不是 LineChart，原文件名如此）
import Deposit from '@/containers/Bridge/Deposit';
// Bridge 内的存入/提出表单组件
import LineChat from '@/containers/Bridge/LineChat';

// 函数名 Search 是历史遗留，实际是 Bridge/Swap 页面
const Search = () => {
  return (
    // 固定宽度 1156px 居中布局（桌面端设计稿宽度）
    <Box sx={{ width: '1156px', margin: '0 auto' }}>
      {/* 水平排列：左侧价格图，右侧存入表单，间距 170px */}
      <Stack direction="row" alignItems="flex-start" gap="170px">
        <LineChat />
        <Deposit />
      </Stack>
    </Box>
  );
};

export default Search;
