// ============================================================================
// 【RecentEthsciptionList/index.tsx】首页最新铭刻列表容器
// ----------------------------------------------------------------------------
// 展示全平台最新写入铸造的铭文（Ethscription）
// 支持 category 类型过滤（token/nft/domain/空=全部）
// 默认每页 7 条，首页类坐落展示
// ============================================================================
import { Fragment, useEffect, useRef, useState } from 'react';
import { Box, Divider, IconButton, Paper, Typography, useMediaQuery } from '@mui/material';
import { GridPaginationModel } from '@mui/x-data-grid';
import { useImmer } from 'use-immer';
import TableData from './TableData';
import { GetRecentEthsListData, GetRecentEthsRequest } from '@/services/ethscriptions/types';
import services from '@/services';

const PAGE_START_INIT = 7;

const RecentEthsciptionList = () => {
  const inputRef = useRef<HTMLInputElement>();
  const isMobile = useMediaQuery('(max-width:750px)');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [filterRequest, setFilterRequest] = useImmer<GetRecentEthsRequest>({
    category: '',
    'page.size': PAGE_START_INIT,
    'page.index': 1,
  });

  const [list, setList] = useImmer<GetRecentEthsListData>({
    ethscriptions: [],
    page: {
      size: PAGE_START_INIT,
      index: 1,
      total: '0',
    },
  });

  async function getRecentEths() {
    if (isLoading) return;

    if (filterRequest['page.index'] == 1) {
      setList((state) => {
        state.ethscriptions = [];
      });
    }
    setIsLoading(true);

    const response = await services.ethscriptions.getLatestEths(filterRequest);

    if (response?.code === 200) {
      if (filterRequest['page.index'] === 1) {
        setList(() => response.data);
      } else {
        setList((state) => {
          state.ethscriptions = state.ethscriptions.concat(response.data.ethscriptions);
          state.page = response.data.page;
        });
      }
    }

    setIsLoading(false);
  }

  useEffect(() => {
    getRecentEths();
  }, [filterRequest]);

  const isHasMore = Number(list.page.total) > list.ethscriptions.length;

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
      <Typography sx={{ fontSize: '18px', color: 'white', fontWeight: '700' }}>Latest Ethscriptions</Typography>
      <TableData isLoading={isLoading} data={list.ethscriptions} />
    </Box>
  );
};

export default RecentEthsciptionList;
