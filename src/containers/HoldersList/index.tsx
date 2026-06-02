// ============================================================================
// 【HoldersList/index.tsx】Token 持有者列表容器
// ----------------------------------------------------------------------------
// 职责：请求某个 Token 的持有者数据，通过 TableData（DataGrid）展示。
// 分页模式：服务端分页（paginationMode="server"）
//   filterRequest 变化 → useEffect 触发 → getHoldersInfo 请求 → setHolderList
// Props： p（协议名）、tick（代币符号）、ca（合约地址可选）
// ============================================================================

import { useEffect, useState } from 'react';
import { GridPaginationModel } from '@mui/x-data-grid';
import { useImmer } from 'use-immer';
import TableData from './TableData';

import { GetHoldersInfoData, GetHoldersRequest } from '@/services/ethscriptions/types';
import services from '@/services';

const PAGE_START_INIT = 20;

interface IHoledersList {
  p: string;
  tick: string;
  ca?: string;
}

const HoledersList: React.FC<IHoledersList> = ({ p, tick, ca }) => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [filterRequest, setFilterRequest] = useImmer<GetHoldersRequest>({
    p,
    tick,
    ca: ca || '',
    'page.size': PAGE_START_INIT,
    'page.index': 1,
  });

  const [holderList, setHolderList] = useState<GetHoldersInfoData>({
    p,
    tick,
    holders: [],
    totalSupply: '0',
    page: {
      size: PAGE_START_INIT,
      index: 1,
      total: '0',
    },
  });

  useEffect(() => {
    getHoldersInfo();
  }, [filterRequest]);

  async function getHoldersInfo() {
    if (isLoading) return;
    setHolderList({ ...holderList, holders: [] });
    setIsLoading(true);
    const response = await services.ethscriptions.getHoldersInfo(filterRequest);

    if (response?.code === 200) {
      setHolderList(response.data);
    }
    setIsLoading(false);
  }

  return (
    <TableData
      isLoading={isLoading}
      data={holderList}
      p={p}
      tick={tick}
      pageSize={PAGE_START_INIT}
      onPageChange={async (model: GridPaginationModel) => {
        setFilterRequest((state) => {
          state['page.index'] = model.page;
          state['page.size'] = model.pageSize;
        });
      }}
    />
  );
};

export default HoledersList;
