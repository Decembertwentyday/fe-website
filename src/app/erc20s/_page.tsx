// 【页面层 - ERC20 代币概览中心】
// 作用：展示在平台上以 Fair Mint (无预挖公平铸造) 方式出现的 ER-C20 资产。
// 工作原理：通过标题渲染页面门面，并挂载 `TokenList` 展现目前存在的各类 Token 情况（如价格、持有人等）。
'use client';

import { Box, Typography } from '@mui/material';

import TokenList from '@/containers/Erc20TokenList';

const TokenPage = () => {
  return (
    <Box sx={{ minHeight: 'calc(100vh - 203.5px)' }}>
      <Typography
        sx={{
          textAlign: 'center',
          fontSize: '24px',
          letterSpacing: '1px',
          color: '#E6FF65',
          mt: '80px',
          fontWeight: 700,
          '& .white ': {
            color: 'white',
            fontWeight: 400,
          },
        }}
      >
        <span className="white">fair</span> ER-C20s
      </Typography>
      <Typography
        sx={{
          color: 'white',
          textAlign: 'center',
          fontSize: '28px',
          fontWeight: '600',
          letterSpacing: '1px',
          mb: '60px',
        }}
        gutterBottom
      >
        The First Decentralized Fair Launchpad
      </Typography>
      <TokenList />
    </Box>
  );
};

export default TokenPage;
