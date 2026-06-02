import { useEffect, useState } from 'react';
import { Box, FormControlLabel, Switch, Typography } from '@mui/material';
import { GridPaginationModel } from '@mui/x-data-grid';
import { useImmer } from 'use-immer';
import TableData from './TableData';

import services from '@/services';
import { useSearchParams } from 'next/navigation';
import { GetRecentTransactionListData, GetRecentTransactionsRequest } from '@/services/ethscriptions/types';
import getTruncate from '@/utils/getTruncate';
import FilterSelect from '@/components/FilterSelect';

const PAGE_START_INIT = 20;

const TransactionList: React.FC = () => {
  const searchParams = useSearchParams();
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
    <Box>
      <Box
        sx={{
          mb: '40px',
          borderRadius: '12px',
          border: '1px solid #2F343E',
          padding: '40px',
          boxSizing: 'border-box',
          background: '#202229',
        }}
      >
        <Box display={'flex'} justifyContent={'space-between'} alignItems={'center'}>
          <Typography fontSize={'14'} fontWeight={500} mb={'12px'}>
            More than {getTruncate(transactionList.page.total, 0)} transactions found
          </Typography>
          <FilterSelect
            selectList={[
              {
                label: 'Show All',
                value: 'ShowAll',
              },
              {
                label: 'Only Sale',
                value: 'onlySale',
              },
            ]}
            onSelect={(item) => {
              setFilterRequest((state) => {
                state.onlySale = item.value === 'onlySale';
                state['page.index'] = 1;
              });
            }}
          />
        </Box>
        <TableData
          isLoading={isLoading}
          data={transactionList}
          pageSize={PAGE_START_INIT}
          onPageChange={async (model: GridPaginationModel) => {
            setFilterRequest((state) => {
              state['page.index'] = model.page;
              state['page.size'] = model.pageSize;
            });
          }}
        />
      </Box>
    </Box>
  );
};

export default TransactionList;
