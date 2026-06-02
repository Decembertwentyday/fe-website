// ============================================================================
// 【TransfersList/index.tsx】Token 转账记录列表容器
// ----------------------------------------------------------------------------
// 与 HoldersList 结构相同，区别：
//   - 请求接口： getTransfersInfo（转账记录）vs getHoldersInfo（持有者）
//   - 数据类型： GetTransfersInfoData（transfer 数组）
// 展示：铭文编号、方法（mint/transfer）、数量、from/to 地址、时间
// ============================================================================

import { useEffect, useState } from 'react';
import { GridPaginationModel } from '@mui/x-data-grid';
import { useImmer } from 'use-immer';
import TableData from './TableData';

import { GetTransfersInfoData, GetHoldersRequest } from '@/services/ethscriptions/types';
import services from '@/services';

const PAGE_START_INIT = 20;

interface ITransferList {
  p: string;
  tick: string;
  ca?: string;
}

const TransferList: React.FC<ITransferList> = ({ p, tick, ca }) => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [filterRequest, setFilterRequest] = useImmer<GetHoldersRequest>({
    p,
    tick,
    ca: ca || '',
    'page.size': PAGE_START_INIT,
    'page.index': 1,
  });

  const [transferList, setTransferList] = useState<GetTransfersInfoData>({
    transfer: [],
    page: {
      size: PAGE_START_INIT,
      index: 1,
      total: '0',
    },
  });

  useEffect(() => {
    getTransfersInfo();
  }, [filterRequest]);

  async function getTransfersInfo() {
    if (isLoading) return;
    setTransferList({ ...transferList, transfer: [] });
    setIsLoading(true);
    const response = await services.ethscriptions.getTransfersInfo(filterRequest);

    if (response?.code === 200) {
      setTransferList(response.data);
    }
    setIsLoading(false);
  }

  return (
    <TableData
      isLoading={isLoading}
      data={transferList}
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

export default TransferList;
