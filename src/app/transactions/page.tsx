// 【页面层 - 最新交易宏观看板】
// 作用：展示整个平台或网络的近期动态（犹如区块链浏览器上的 Latest Transactions）。
// 页面结构：
// - TransactionOverview：交易数据大盘预览。
// - TransactionList：长列表查询，展示具体的交易详情记录（哈希、时间、发送方、接收方）。
'use client';
import TransactionList from '@/containers/TransactionList';
import TransactionOverview from '@/containers/TransactionOverview';
import { Box, Typography, useMediaQuery } from '@mui/material';

const LatestTransaction = () => {
  const matches = useMediaQuery('(min-width:750px)');

  return (
    <Box
      sx={{
        px: matches ? 0 : '12px',
      }}
    >
      <Typography
        sx={{
          mt: '32px',
          fontSize: '20px',
          fontWeight: 700,
          mb: '28px',
        }}
      >
        Latest Transactions
      </Typography>
      <TransactionOverview />
      <Box mt="28px">
        <TransactionList />
      </Box>
    </Box>
  );
};

export default LatestTransaction;
