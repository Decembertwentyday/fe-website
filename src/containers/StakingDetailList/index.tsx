// ============================================================================
// 【StakingDetailList】某地址的质押记录列表
// ----------------------------------------------------------------------------
// 职责：
//   展示指定 owner 地址在指定集合中的所有质押记录（铭文 token id、质押时间、金额等）。
//   通过 /staking/detail?owner=0x...&collectionName=xxx 进入此页面。
//
// 防抖机制：
//   filterRequest 经 useDebounce(300ms) 得到 filterRequestDebounce，
//   useEffect 监听防抖后的值，避免 collection/owner prop 频繁切换时发出过多请求。
//
// 分页：
//   MUI DataGrid 的 GridPaginationModel 回调 → 更新 filterRequest → 防抖后触发请求
//   PAGE_START_INIT = 50，每页 50 条
// ============================================================================

import { useEffect, useState } from 'react';
import { Box, Typography } from '@mui/material';
import { useImmer } from 'use-immer';
import { useSearchParams } from 'next/navigation';
import { useDebounce } from 'usehooks-ts';

import services from '@/services';
import TableData from './TableData';
import { GridPaginationModel } from '@mui/x-data-grid';
import { GetStakingRecordData, GetStakingRecordRequest } from '@/services/vault/types';

// 每页显示条数
const PAGE_START_INIT = 50;

interface IStakingDetailList {
  collection: string; // 集合名称
  owner: string; // 要查询的钱包地址
}

const StakingDetailList: React.FC<IStakingDetailList> = ({ owner, collection }) => {
  // isLoading：防并发（上一次请求未完成时不再发新请求）
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // filterRequest：请求参数，useImmer 管理（可直接 state.x = y 赋值）
  const [filterRequest, setFilterRequest] = useImmer<GetStakingRecordRequest>({
    owner,
    collection,
    'page.size': PAGE_START_INIT,
    'page.index': 1,
  });

  // 防抖：filterRequest 变化后 300ms 才触发请求，避免快速翻页导致的请求风暴
  const filterRequestDebounce = useDebounce(filterRequest, 300);

  // stakingRecordList：质押记录数据（records 数组 + 分页信息）
  const [stakingRecordList, setStakingRecordList] = useState<GetStakingRecordData>({
    records: [],
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
    setStakingRecordList({ ...stakingRecordList, records: [] }); // 清空旧数据（避免闪烁）
    const response = await services.vault.getStakingRecord(filterRequestDebounce);

    if (response?.code === 200) {
      setStakingRecordList(response.data);
    }
    setIsLoading(false);
  }

  // Effect #1：监听防抖后的 filterRequest → 发起请求（分页、切换地址等）
  // 注意：与 StakingRankList 不同，这里没有判断 collection 是否为空，
  // 因为 detail 页面只有在有 owner 时才会渲染此组件（父组件保证）
  useEffect(() => {
    getCollectionList();
  }, [filterRequestDebounce]);

  // Effect #2：监听 collection 和 owner prop 变化 → 重置到第 1 页并更新参数
  // 用于父组件更新 props 时同步到请求参数
  useEffect(() => {
    if (collection && owner) {
      setFilterRequest((state) => {
        state.collection = collection;
        state.owner = owner;
        state['page.index'] = 1; // 切换地址/集合时重置到第 1 页
      });
    }
  }, [collection, owner]);

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
      {/* 注释掉的集合名称标题（曾经有，现已隐藏，可能后续会重新启用）
      <Box sx={{ marginBottom: '16px' }}>
        <Typography sx={{ color: '#E6FF65', fontSize: '18px', fontWeight: 500, ... }}>
          {collection}
        </Typography>
      </Box> */}

      {/* 把分页回调和数据传给纯展示组件 TableData */}
      <TableData
        isLoading={isLoading}
        data={stakingRecordList}
        pageSize={PAGE_START_INIT}
        onPageChange={async (model: GridPaginationModel) => {
          // 用户点击分页控件 → 更新页码 → 防抖后触发 Effect #1 重新请求
          setFilterRequest((state) => {
            state['page.index'] = model.page;
            state['page.size'] = model.pageSize;
          });
        }}
      />
    </Box>
  );
};

export default StakingDetailList;
