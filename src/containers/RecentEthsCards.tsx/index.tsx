/**
 * ==============================================================
 * 文件：src/containers/RecentEthsCards.tsx/index.tsx
 * 作用：最新铭文卡片瀑布流（首页 / ethscriptions 页共用）
 *
 * 核心能力：
 *   1. InfiniteScroll — 滚到底自动加载下一页（page.index++）
 *   2. FilterSelect — 按 category 筛选（NFT / Token / Domain）
 *   3. EthsCard — 单张铭文卡片，点击跳转详情
 *
 * useImmer：
 *   list 和 filterRequest 用 immer 管理，append 新页数据时：
 *   setList(draft => { draft.ethscriptions.push(...newItems) })
 *
 * URL_CONFIG[chainId]：
 *   卡片上的外链（ethscriptions.com 浏览器）随当前钱包链切换
 *
 * 刷新按钮：重置 page.index=1 重新拉第一页
 * ==============================================================
 */

'use client';

import { useState, useEffect } from 'react';
import { Box, IconButton, Typography, useMediaQuery } from '@mui/material';
import { useImmer } from 'use-immer';
import InfiniteScroll from 'react-infinite-scroll-component';

import services from '@/services';
import RefreshSVG from '@/assets/icons/refresh.svg';
import FilterSelect from '@/components/FilterSelect';
import { GetRecentEthsListData, GetRecentEthsRequest } from '@/services/ethscriptions/types';
import EthsCard from '../EthsCard';
import { URL_CONFIG } from '@/constants';
import { useChainId } from 'wagmi';

const PAGE_START_INIT = 20;

const RecentEthsCards: React.FC = () => {
  const matches = useMediaQuery('(min-width:750px)');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [filterRequest, setFilterRequest] = useImmer<GetRecentEthsRequest>({
    category: '',
    'page.size': PAGE_START_INIT,
    'page.index': 1,
  });
  const chainId = useChainId();
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
    <Box>
      <Typography fontSize="20px" fontWeight="700" my="32px">
        Latest Ethscriptions
      </Typography>
      <Box
        sx={{
          mb: '16px',
          gap: matches ? '24px' : '12px',
          display: 'flex',
          justifyContent: 'space-between',
          flexWrap: matches ? 'nowrap' : 'wrap',
        }}
      >
        <Box sx={{ gap: '8px', display: 'flex', alignItems: 'center' }}>
          <Typography sx={{ fontSize: '14px' }}>{`Result: ${list.page.total}`}</Typography>
          <IconButton
            onClick={() => {
              if (filterRequest['page.index'] == 1) {
                getRecentEths();
              } else {
                setFilterRequest((state) => {
                  state['page.index'] = 1;
                });
              }
            }}
          >
            <RefreshSVG />
          </IconButton>
        </Box>

        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: matches ? '40px' : '15px',
            flexWrap: matches ? 'nowrap' : 'wrap',
          }}
        >
          <FilterSelect
            selectList={[
              {
                label: 'All',
                value: '',
              },
              {
                label: 'Token',
                value: 'token',
              },
              {
                label: 'Domain',
                value: 'domain',
              },
              {
                label: 'Image',
                value: 'image',
              },
              {
                label: 'Text',
                value: 'text',
              },
              {
                label: 'Video',
                value: 'video',
              },
              {
                label: 'Audio',
                value: 'audio',
              },
            ]}
            onSelect={(item) => {
              setFilterRequest((state) => {
                state.category = item.value;
                state['page.index'] = 1;
              });
            }}
          />
        </Box>
      </Box>
      <InfiniteScroll
        style={{ marginBottom: '80px' }}
        dataLength={list.ethscriptions.length}
        next={() => {
          setFilterRequest((state) => {
            state['page.index'] = state['page.index'] + 1;
          });
        }}
        hasMore={isHasMore}
        loader={<Box sx={{ textAlign: 'center', padding: '40px 0', fontWeight: 500 }}>Loading...</Box>}
        endMessage={
          <Box sx={{ textAlign: 'center', padding: '40px 0', fontWeight: 500 }}> Yay! You have seen it all</Box>
        }
      >
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(209px, 1fr))',
            justifyContent: 'space-between',
            gridGap: '28px',
          }}
        >
          {list.ethscriptions.map((item, index) => {
            return (
              <Box key={Symbol(`${item.ethscriptionId}${index}`).toString()}>
                <EthsCard chainId={chainId} ethscription={item}></EthsCard>
              </Box>
            );
          })}
        </Box>
      </InfiniteScroll>
    </Box>
  );
};

export default RecentEthsCards;
