/**
 * ==============================================================
 * 文件：src/app/transactions/page.tsx
 * 作用：全站最新交易页（/transactions）
 *
 * 页面组成：
 *   TransactionOverview — 顶部 4 张统计卡片（24h/总量）
 *   TransactionList     — 可分页、可筛选的交易明细表格
 *
 * 与 ethscriptions 详情的 TokenActivity 区别：
 *   本页是「全平台」宏观视图；详情页是「单个铭文」的 activity
 *
 * 响应式：移动端 px:12px，避免表格贴边
 * ==============================================================
 */

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
