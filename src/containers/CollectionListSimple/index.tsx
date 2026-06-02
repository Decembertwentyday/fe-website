// 【容器组件 - 简易集合列表】
// 作用：提供一个轻量化的铭文/合集搜索和列表展示组件。
// 工作原理：包含一个搜索框和分类筛选器，允许通过防抖 (useDebounce) 查询对应的 Token 或 NFT 集合合约；
// 主要用于首页或其他界面的小范围集合导航。
import { Fragment, useEffect, useRef, useState } from 'react';
import { Box, Divider, InputBase } from '@mui/material';
import { useImmer } from 'use-immer';
import { useRouter, useSearchParams } from 'next/navigation';
import { useDebounce } from 'usehooks-ts';

import services from '@/services';
import { GetCollectionListData, GetCollectionListRequest } from '@/services/marketpalce/types';
import FilterSelect from '@/components/FilterSelect';

const PAGE_START_INIT = 10;

const CollectionListSimple = () => {
  const searchParams = useSearchParams();
  const collectionName = searchParams.get('collectionName') || '';
  const router = useRouter();

  const inputRef = useRef<HTMLInputElement>();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isFirst, setIsFirst] = useState<boolean>(true);
  const [filterRequest, setFilterRequest] = useImmer<GetCollectionListRequest>({
    category: 'token',
    tokenQuery: '',
    'page.size': PAGE_START_INIT,
    'page.index': 1,
  });
  const filterRequestDebounce = useDebounce(filterRequest, 300);

  const [collectionList, setCollectionList] = useState<GetCollectionListData>({
    collections: [],
    page: {
      size: PAGE_START_INIT,
      index: 1,
      total: '0',
    },
  });
  const [collectionListDown, setCollectionListDown] = useState<GetCollectionListData['collections']>([]);

  async function getCollectionList() {
    if (isLoading) return;
    setIsLoading(true);
    setCollectionList({ ...collectionList, collections: [] });
    const response = await services.marketplace.getCollectionList(filterRequestDebounce);

    if (response?.code === 200) {
      setCollectionList(response.data);
      if (isFirst) {
        setCollectionListDown(response.data.collections);
        router.push(`/staking?collectionName=${response.data.collections[0].collectionName}`);
        setIsFirst(false);
      }
    }
    setIsLoading(false);
  }

  useEffect(() => {
    getCollectionList();
  }, [filterRequestDebounce]);

  return (
    <InputBase
      sx={{ ml: 1, flex: 1, fontSize: '14px' }}
      placeholder={collectionName || 'Enter Token'}
      inputRef={inputRef}
      onKeyUp={(event) => {
        const coin_name = inputRef.current?.value?.trim();
        if (event.key === 'Enter' && coin_name) {
          setFilterRequest((state) => {
            state.tokenQuery = coin_name;
            state['page.index'] = 1;
          });
        }
      }}
      onInput={() => {
        const coin_name = inputRef.current?.value.trim();
        if (coin_name === '') {
          setFilterRequest((state) => {
            state.tokenQuery = '';
            state['page.index'] = 1;
          });
        }
      }}
      endAdornment={
        <Fragment>
          <Divider sx={{ height: 36, m: 0.5 }} orientation="vertical" />
          <Box sx={{ p: '0 6px 0 8px' }}>
            <FilterSelect
              selectList={collectionListDown?.map((item) => {
                return {
                  label: item.collectionName,
                  value: item.collectionName,
                };
              })}
              defaultValue={{
                label: 'Tokens',
                value: '',
              }}
              onSelect={(item) => {
                console.log(item);
                router.push(`/staking?collectionName=${item.value}`);
              }}
            />
          </Box>
        </Fragment>
      }
    />
  );
};

export default CollectionListSimple;
