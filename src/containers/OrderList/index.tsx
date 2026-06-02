// ============================================================================
// 【OrderList/index.tsx】订单历史列表容器
// ----------------------------------------------------------------------------
// 展示买卖历史订单（支持 listing/sold/cancelled 等事件类型）
// isOwner=true 时过滤当前钱包地址的订单（个人资产页用）
// 支持多维过滤： category（类型）、events（事件）、collectionName（集合）
// 内部用 useImmer 维护分页参数，发生变化时重新加载
// ============================================================================
import { useEffect, useState } from 'react';
import { Box, FormControlLabel, Switch } from '@mui/material';
import { GridPaginationModel } from '@mui/x-data-grid';
import { useImmer } from 'use-immer';
import TableData from './TableData';

import services from '@/services';
import { GetHistoryOrderData, GetHistoryOrderRequest, categoryType } from '@/services/marketpalce/types';
import { useAccount } from 'wagmi';
import NotWalletConnect from '@/components/NotWalletConnect';
import FilterCheckBox from '@/components/FilterCheckBox';
import { useSearchParams } from 'next/navigation';
import { CATEGORY_KEY_ENUM } from '@/constants';

const PAGE_START_INIT = 20;

interface IOrderList {
  isOwner?: boolean;
  category: categoryType;
}

const OrderList: React.FC<IOrderList> = ({ isOwner = false, category }) => {
  const searchParams = useSearchParams();
  const collectionName = searchParams?.get('collectionName')?.toString().trim() ?? '';
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { address } = useAccount();
  const [filterRequest, setFilterRequest] = useImmer<GetHistoryOrderRequest>({
    address: isOwner ? address : '',
    category,
    events: ['sold', 'listing', 'cancelled'],
    collection: collectionName,
    'page.size': PAGE_START_INIT,
    'page.index': 1,
  });
  const [erc20List, setErc20List] = useState<GetHistoryOrderData>({
    events: [],
    page: {
      size: PAGE_START_INIT,
      index: 1,
      total: '0',
    },
  });

  async function getErc20List() {
    if (isLoading) return;
    setErc20List({ ...erc20List, events: [] });
    setIsLoading(true);
    const response = await services.marketplace.getHistoryOrder(filterRequest);

    if (response?.code === 200) {
      setErc20List(response.data);
    }
    setIsLoading(false);
  }

  useEffect(() => {
    getErc20List();
  }, [filterRequest]);

  useEffect(() => {
    if (isOwner && address) {
      setFilterRequest((state) => {
        state.address = address;
        state['page.index'] = 1;
      });
    }
  }, [address, isOwner]);

  useEffect(() => {
    setFilterRequest((state) => {
      state.collection = collectionName;
    });
  }, [collectionName]);

  return address || !isOwner ? (
    <Box>
      <Box sx={{ mb: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <FormControlLabel
          defaultChecked={false}
          labelPlacement="start"
          control={<Switch />}
          label={`All ${CATEGORY_KEY_ENUM[category]}`}
          onChange={(event, checked) => {
            console.log('checked', checked);
            setFilterRequest((state) => {
              state.collection = checked ? '' : collectionName;
              state['page.index'] = 1;
            });
          }}
        />
        <FilterCheckBox
          label="Event"
          selectList={[
            { label: 'Listing', value: 'listing' },
            { label: 'Sold', value: 'sold' },
            { label: 'Cancelled', value: 'cancelled' },
            { label: 'Transfer', value: 'transfer' },
            { label: 'ContractTransfer', value: 'contract-transfer' },
          ]}
          defaultValue={{
            Listing: { isChecked: true, data: { label: 'Listing', value: 'listing' } },
            Sold: { isChecked: true, data: { label: 'Sold', value: 'sold' } },
            Cancelled: { isChecked: true, data: { label: 'Cancelled', value: 'cancelled' } },
            // Transfer: { isChecked: true, data: { label: 'Transfer', value: 'transfer' } },
          }}
          onSelect={(value) => {
            const queryEvent = value.map((item) => item.value);
            console.log(queryEvent);

            setFilterRequest((state) => {
              state.events = queryEvent;
              state['page.index'] = 1;
            });
          }}
        />
      </Box>
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
        <TableData
          category={category}
          isLoading={isLoading}
          data={erc20List}
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
  ) : (
    <Box sx={{ display: 'flex', justifyContent: 'center', pt: '180px' }}>
      <NotWalletConnect />
    </Box>
  );
};

export default OrderList;
