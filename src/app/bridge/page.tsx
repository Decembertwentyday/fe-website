// 【页面层 - 跨链桥首页】
// 作用：提供 Facet 网络与以太坊主网之间的资产跨链功能。
// 页面结构：利用左右分栏，左侧显示桥接图表或历史说明 (`LineChat`)，右侧为实际进行存款/发送等操作的交互区 (`Deposit`)。
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
