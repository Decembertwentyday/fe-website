// ============================================================================
// 【LatestTransactionList/index.tsx】首页最新交易列表容器
// ----------------------------------------------------------------------------
// 展示全平台最新铭文交易（不限集合）
// 支持搜索过滤（inputRef）和 onlySale 开关（只看成交）
// 默认每页 7 条（PAGE_START_INIT=7），适合首页展示
// ============================================================================
import { Fragment, useEffect, useRef, useState } from 'react';
import { Box, Divider, IconButton, InputBase, Paper, Typography, useMediaQuery } from '@mui/material';
import { GridPaginationModel } from '@mui/x-data-grid';
import { useImmer } from 'use-immer';
import TableData from './TableData';

import { GetRecentTransactionListData, GetRecentTransactionsRequest } from '@/services/ethscriptions/types';
import services from '@/services';

const PAGE_START_INIT = 7;

const LatestTransactionList = () => {
  const inputRef = useRef<HTMLInputElement>();
  const isMobile = useMediaQuery('(max-width:750px)');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [filterRequest, setFilterRequest] = useImmer<GetRecentTransactionsRequest>({
    onlySale: false,
    'page.size': PAGE_START_INIT,
    'page.index': 1,
  });
  const [transactionList, setTransactionList] = useState<GetRecentTransactionListData>({
    transactions: [],
    page: {
      size: PAGE_START_INIT,
      index: 1,
      total: '0',
    },
  });

  async function getTransactionList() {
    if (isLoading) return;
    setTransactionList({ ...transactionList, transactions: [] });
    setIsLoading(true);
    const response = await services.ethscriptions.getLatestTransactions(filterRequest);

    if (response?.code === 200) {
      setTransactionList(response.data);
    }
    setIsLoading(false);
  }

  useEffect(() => {
    getTransactionList();
  }, [filterRequest]);

  return (
    <Box
      sx={{
        width: '100%',
        borderRadius: '12px',
        border: '1px solid #2F343E',
        background: '#202229',
        p: isMobile ? '24px 5px' : '24px',
        margin: 'auto',
      }}
    >
      <Typography sx={{ fontSize: '18px', color: 'white', fontWeight: '700' }}>Latest Transactions</Typography>
      <TableData isLoading={isLoading} data={transactionList.transactions} pageSize={PAGE_START_INIT} />
    </Box>
  );
};

export default LatestTransactionList;
