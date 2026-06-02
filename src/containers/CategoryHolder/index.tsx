import { useEffect, useState } from 'react';
import { Box } from '@mui/material';
import { GridPaginationModel } from '@mui/x-data-grid';
import { useImmer } from 'use-immer';
import TableData from './TableData';

import { GetCategoryHoldersRequest, GetHoldersInfoData } from '@/services/ethscriptions/types';
import services from '@/services';
import { categoryType } from '@/services/marketpalce/types';
import { useSearchParams } from 'next/navigation';

const PAGE_START_INIT = 20;

interface ICategoryHolder {
  category: categoryType;
}

const CategoryHolder: React.FC<ICategoryHolder> = ({ category }) => {
  const searchParams = useSearchParams();
  const collectionName = searchParams?.get('collectionName')?.toString().trim() ?? '';
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [filterRequest, setFilterRequest] = useImmer<GetCategoryHoldersRequest>({
    category,
    collectionName,
    'page.size': PAGE_START_INIT,
    'page.index': 1,
  });

  const [holderList, setHolderList] = useState<GetHoldersInfoData>({
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
    const response = await services.ethscriptions.getCategoryHoldersInfo(filterRequest);

    if (response?.code === 200) {
      setHolderList(response.data);
    }
    setIsLoading(false);
  }

  return (
    <Box
      sx={{
        margin: '0 auto',
        borderRadius: '12px',
        border: '1px solid #2F343E',
        padding: '40px',
        boxSizing: 'border-box',
        background: '#202229',
      }}
    >
      <TableData
        isLoading={isLoading}
        data={holderList}
        collectionName={collectionName}
        pageSize={PAGE_START_INIT}
        onPageChange={async (model: GridPaginationModel) => {
          setFilterRequest((state) => {
            state['page.index'] = model.page;
            state['page.size'] = model.pageSize;
          });
        }}
      />
    </Box>
  );
};

export default CategoryHolder;
