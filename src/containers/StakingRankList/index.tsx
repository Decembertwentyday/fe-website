// ============================================================================
// 【StakingRankList】质押排行榜容器
// ----------------------------------------------------------------------------
// 职责：
//   展示当前集合内所有质押者的排行（按质押量排序），支持分页。
//   点击某行地址可跳转到 /staking/detail?owner=xxx&collectionName=xxx 查看详情。
//   （跳转逻辑在 TableData 组件内处理）
//
// 防抖机制：
//   与 StakingDetailList 相同，filterRequest 经 useDebounce(300ms) 防抖，
//   避免 collection prop 变化时或快速翻页时发出过多请求。
//
// 两个 useEffect 的分工：
//   Effect #1：监听防抖后的 filterRequest → 仅在 collection 非空时发起请求
//   Effect #2：监听 collection prop 变化 → 更新 filterRequest.collection + 重置页码
// ============================================================================

import { useEffect, useState } from 'react';
import { Box, Typography } from '@mui/material';
import { useImmer } from 'use-immer';
import { useDebounce } from 'usehooks-ts';

import services from '@/services';
import TableData from './TableData';
import { GridPaginationModel } from '@mui/x-data-grid';
import { GetStakingRankData, GetStakingRankRequest } from '@/services/vault/types';

// 每页显示条数（50 条，比普通列表多，方便一屏查看更多排名）
const PAGE_START_INIT = 50;

interface IStakingRankList {
  collection: string; // 集合名称（从 URL 参数传入）
}

const StakingRankList: React.FC<IStakingRankList> = ({ collection }) => {
  // isLoading：防并发标志
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // filterRequest：请求参数（collection + 分页）
  const [filterRequest, setFilterRequest] = useImmer<GetStakingRankRequest>({
    collection,
    'page.size': PAGE_START_INIT,
    'page.index': 1,
  });

  // 防抖：300ms 后才真正触发请求
  const filterRequestDebounce = useDebounce(filterRequest, 300);

  // stakingRankList：排行榜数据（stakes 数组 + 分页信息）
  const [stakingRankList, setStakingRankList] = useState<GetStakingRankData>({
    stakes: [],
    page: {
      size: PAGE_START_INIT,
      index: 1,
      total: '0',
    },
  });

  // 数据请求函数
  async function getCollectionList() {
    if (isLoading) return; // 防并发
    setIsLoading(true);
    setStakingRankList({ ...stakingRankList, stakes: [] }); // 清空旧数据

    const response = await services.vault.getStakingRank(filterRequestDebounce);

    if (response?.code === 200) {
      setStakingRankList(response.data);
    }
    setIsLoading(false);
  }

  // Effect #1：防抖后的 filterRequest 变化 → 发起请求
  // 注意：判断 collection 非空才请求（页面初始化时 collection 可能为空字符串）
  useEffect(() => {
    if (filterRequest.collection.trim() != '') {
      getCollectionList();
    }
  }, [filterRequestDebounce]);

  // Effect #2：collection prop 变化 → 更新 filterRequest（同时重置到第 1 页）
  useEffect(() => {
    if (collection) {
      setFilterRequest((state) => {
        state.collection = collection;
        state['page.index'] = 1;
      });
    }
  }, [collection]);

  return (
    <Box
      sx={{
        borderRadius: '12px',
        border: '1px solid #2F343E',
        padding: '24px',
        boxSizing: 'border-box',
        background: '#202229',
      }}
    >
      {/* 标题：荧光黄色"Stake Ranking" */}
      <Box sx={{ marginBottom: '16px' }}>
        <Typography
          sx={{
            color: '#E6FF65',
            fontSize: '18px',
            fontWeight: 500,
            letterSpacing: '1px',
            textTransform: 'capitalize',
          }}
        >
          Stake Ranking
        </Typography>
      </Box>

      {/* 表格数据（纯展示组件，负责渲染 DataGrid + 处理行点击跳转） */}
      <TableData
        collection={collection}
        isLoading={isLoading}
        data={stakingRankList}
        pageSize={PAGE_START_INIT}
        onPageChange={async (model: GridPaginationModel) => {
          // 分页变化 → 更新 filterRequest → 防抖后触发 Effect #1
          setFilterRequest((state) => {
            state['page.index'] = model.page;
            state['page.size'] = model.pageSize;
          });
        }}
      />
    </Box>
  );
};

export default StakingRankList;

import services from '@/services';
import TableData from './TableData';
import { GridPaginationModel } from '@mui/x-data-grid';
import { GetStakingRankData, GetStakingRankRequest } from '@/services/vault/types';

const PAGE_START_INIT = 50;

interface IStakingRankList {
  collection: string;
}

const StakingRankList: React.FC<IStakingRankList> = ({ collection }) => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [filterRequest, setFilterRequest] = useImmer<GetStakingRankRequest>({
    collection,
    'page.size': PAGE_START_INIT,
    'page.index': 1,
  });
  const filterRequestDebounce = useDebounce(filterRequest, 300);

  const [stakingRankList, setStakingRankList] = useState<GetStakingRankData>({
    stakes: [],
    page: {
      size: PAGE_START_INIT,
      index: 1,
      total: '0',
    },
  });

  async function getCollectionList() {
    if (isLoading) return;
    setIsLoading(true);
    setStakingRankList({ ...stakingRankList, stakes: [] });

    const response = await services.vault.getStakingRank(filterRequestDebounce);

    if (response?.code === 200) {
      setStakingRankList(response.data);
    }
    setIsLoading(false);
  }

  useEffect(() => {
    if (filterRequest.collection.trim() != '') {
      getCollectionList();
    }
  }, [filterRequestDebounce]);

  useEffect(() => {
    if (collection) {
      setFilterRequest((state) => {
        state.collection = collection;
        state['page.index'] = 1;
      });
    }
  }, [collection]);

  return (
    <Box
      sx={{
        borderRadius: '12px',
        border: '1px solid #2F343E',
        padding: '24px',
        boxSizing: 'border-box',
        background: '#202229',
      }}
    >
      <Box
        sx={{
          marginBottom: '16px',
        }}
      >
        <Typography
          sx={{
            color: '#E6FF65',
            fontSize: '18px',
            fontWeight: 500,
            letterSpacing: '1px',
            textTransform: 'capitalize',
          }}
        >
          Stake Ranking
        </Typography>
      </Box>
      <TableData
        collection={collection}
        isLoading={isLoading}
        data={stakingRankList}
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

export default StakingRankList;
