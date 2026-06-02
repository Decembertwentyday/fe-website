// ============================================================================
// 【app/launchpad/page.tsx】发射项目聚合首页 (Launchpad大厅)
// ----------------------------------------------------------------------------
// 主要负责展示 Launchpad 横幅（Banner宣传）与当前正在进行或过往发射项目的陈列列表。
// 列表部分交由 ListArea 渲染。
// ============================================================================

'use client';

import { Box, Typography } from '@mui/material';
import ListArea from './ListArea';

const Launchpad = () => {
  return (
    <Box>
      <Box
        sx={{
          background: "url('/images/launchpad_top.png') no-repeat center center",
          backgroundSize: 'cover',
          height: '227px',
          p: { xs: '0px 10px', sm: '0px 140px' },
          display: 'flex',
          alignItems: 'center',
        }}
      >
        <Box sx={{ width: '563px' }}>
          <Typography fontSize={28} color={'#E5FF65'} fontWeight="600">
            Launchpad
          </Typography>
          <Typography fontSize={'16px'}>
            Launchpad helps projects to launch project and helps quality projects to develop better and faster.
          </Typography>
        </Box>
      </Box>
      <ListArea />
    </Box>
  );
};

export default Launchpad;
