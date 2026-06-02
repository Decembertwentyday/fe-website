// ============================================================================
// 【SearchEthsResults】搜索结果页核心容器
// ----------------------------------------------------------------------------
// 职责：
//   接收 URL 查询参数（searchType + searchBy），调用后端接口拉取铭文列表，
//   并以无限滚动（InfiniteScroll）方式展示结果。
//
// 数据来源：
//   URL query params → filterRequest 状态 → 调用 services.ethscriptions.getSearchedEths
//
// 关键设计点：
//   1. PAGE_START_INIT = 20：每次请求加载 20 条数据
//   2. InfiniteScroll：用户滚动到底部时自动加载下一页（page.index + 1）
//   3. useImmer：管理 filterRequest（请求参数）和 list（已加载的铭文列表）
//   4. 两个 useEffect 职责分离：
//      - 监听 searchBy 变化 → 同步到 filterRequest.searchBy
//      - 监听 filterRequest 整体变化 → 发请求
//   5. searchType === 'all' 传 '' 给后端：后端不限类型时要传空字符串而非 'all'
//   6. Symbol 作为 key：避免不同批次加载的铭文出现重复 key 问题
// ============================================================================

'use client';

import { useState, useEffect, useMemo } from 'react';
import { Box, IconButton, Typography, useMediaQuery } from '@mui/material';
import { useImmer } from 'use-immer';
import InfiniteScroll from 'react-infinite-scroll-component';

import services from '@/services';
import RefreshSVG from '@/assets/icons/refresh.svg';
import FilterSelect from '@/components/FilterSelect';
import {
  GetRecentEthsListData,
  GetRecentEthsRequest,
  GetSearchedEthsRequest,
  SearchType,
} from '@/services/ethscriptions/types';
import EthsCard from '../EthsCard';
import { useSearchParams } from 'next/navigation';
import { useChainId } from 'wagmi';

// 每次请求加载的初始数量，同时作为 page.size
const PAGE_START_INIT = 20;

// 加载中提示组件（简单文本，复用在列表顶部和底部）
const Loading = () => <Box sx={{ textAlign: 'center', padding: '40px 0', fontWeight: 500 }}>Loading...</Box>;

const SearchEthsResults: React.FC = () => {
  // 响应式：750px 以上为宽屏模式（影响间距和布局方向）
  const matches = useMediaQuery('(min-width:750px)');
  // 从 URL 查询参数读取搜索条件（通过 next/navigation 的 useSearchParams）
  const searchParams = useSearchParams();
  // 当前连接的链 ID（用于区分以太坊主网/测试网）
  const chainId = useChainId();
  // 从 URL 读取搜索类型（如 ?searchType=text），若没有则默认 ''
  const searchType = (searchParams.get('searchType') as SearchType) ?? '';
  // 从 URL 读取搜索内容（如 ?searchBy=abc），useMemo 避免无意义重新计算
  const searchBy = useMemo(() => searchParams.get('searchBy') ?? '', [searchParams]);

  // 加载状态：防止并发请求（isLoading 为 true 时拒绝新请求）
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // filterRequest：发给后端的请求参数（useImmer 便于局部更新）
  const [filterRequest, setFilterRequest] = useImmer<GetSearchedEthsRequest>({
    searchType: searchType, // 搜索类型
    searchBy: searchBy, // 搜索内容
    'page.size': PAGE_START_INIT,
    'page.index': 1, // 从第 1 页开始
  });

  // list：已加载的铭文列表 + 分页信息
  const [list, setList] = useImmer<GetRecentEthsListData>({
    ethscriptions: [],
    page: {
      size: PAGE_START_INIT,
      index: 1,
      total: '0', // 后端返回的是字符串格式的总数
    },
  });

  // useEffect #1：监听 URL 中 searchBy 变化，同步到 filterRequest
  // 为什么需要这个 effect：URL 参数变化时（比如用户在搜索框输入新内容后回车），
  // 需要将新的搜索词同步到请求参数，以便 effect #2 感知并触发新请求
  useEffect(() => {
    setFilterRequest((state) => {
      state.searchBy = searchBy;
    });
  }, [searchBy]);

  // 核心请求函数：根据 filterRequest 拉取搜索结果
  async function getRecentEths() {
    // 防并发：如果正在加载则忽略本次调用
    if (isLoading) return;

    // 第 1 页时先清空列表（表示是全新搜索，不是追加加载）
    if (filterRequest['page.index'] == 1) {
      setList((state) => {
        state.ethscriptions = [];
      });
    }
    setIsLoading(true);

    // 关键处理：'all' 类型传 '' 给后端（后端约定：空字符串=不限类型）
    const params = {
      ...filterRequest,
      searchType: searchType === 'all' ? '' : searchType,
    };
    const response = await services.ethscriptions.getSearchedEths(params);

    if (response?.code === 200) {
      if (filterRequest['page.index'] === 1) {
        // 第 1 页：直接替换整个列表（全新搜索）
        setList(() => response.data);
      } else {
        // 翻页追加：把新数据拼接到现有列表末尾
        setList((state) => {
          state.ethscriptions = state.ethscriptions.concat(response.data.ethscriptions);
          state.page = response.data.page;
        });
      }
    }

    setIsLoading(false);
  }

  // useEffect #2：监听 filterRequest 整体变化 → 触发请求
  // 当 searchBy 变化（effect #1）或 page.index 变化（用户滚动翻页）都会触发这里
  useEffect(() => {
    getRecentEths();
  }, [filterRequest]);

  // 是否还有更多数据：total > 已加载数量 = 还有下一页
  const isHasMore = Number(list.page.total) > list.ethscriptions.length;

  return (
    <Box>
      {/* 页面标题 */}
      <Typography fontSize="20px" fontWeight="700" my="32px">
        Latest Ethscriptions
      </Typography>
      {/* 结果计数 + 刷新按钮区域 */}
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
          {/* 显示后端返回的总结果数 */}
          <Typography sx={{ fontSize: '14px' }}>{`Result: ${list.page.total}`}</Typography>
          {/* 刷新按钮：如果当前已在第1页，直接重新请求；否则重置到第1页（触发 effect #2） */}
          <IconButton
            onClick={() => {
              if (filterRequest['page.index'] == 1) {
                getRecentEths(); // 已在第1页，直接刷新
              } else {
                setFilterRequest((state) => {
                  state['page.index'] = 1; // 重置到第1页，会触发 effect #2 重新请求
                });
              }
            }}
          >
            <RefreshSVG />
          </IconButton>
        </Box>
      </Box>

      {/* 初始加载占位：列表为空且正在加载时显示 Loading */}
      {isLoading && list.ethscriptions.length === 0 && <Loading />}

      {/* InfiniteScroll：无限滚动容器
          - dataLength：当前已加载的数据量，InfiniteScroll 用它判断是否需要加载更多
          - next：滚动到底部时调用，把 page.index +1，触发 effect #2 请求下一页
          - hasMore：是否还有更多数据
          - loader：加载中显示的组件（只在已有数据时才显示，避免初始空状态重复显示）
          - endMessage：所有数据加载完时显示 */}
      <InfiniteScroll
        style={{ marginBottom: '80px' }}
        dataLength={list.ethscriptions.length}
        next={() => {
          setFilterRequest((state) => {
            state['page.index'] = state['page.index'] + 1; // 翻到下一页
          });
        }}
        hasMore={isHasMore}
        loader={list.ethscriptions.length > 0 ? <Loading /> : <></>}
        endMessage={
          <Box sx={{ textAlign: 'center', padding: '40px 0', fontWeight: 500 }}> Yay! You have seen it all</Box>
        }
      >
        {/* 卡片网格布局：自适应列数，每列最小 209px */}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(209px, 1fr))',
            justifyContent: 'space-between',
            gridGap: '28px',
          }}
        >
          {list.ethscriptions.map((item, index) => {
            // 使用 Symbol 作为 key：
            // Symbol() 每次调用都产生唯一值，即使铭文 ID 相同（比如分页数据重叠），
            // 也不会出现 React key 重复警告。代价是每次渲染都会重新创建 Symbol，
            // 对性能影响极小（DOM 结构稳定时 React 会复用节点）。
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

export default SearchEthsResults;
