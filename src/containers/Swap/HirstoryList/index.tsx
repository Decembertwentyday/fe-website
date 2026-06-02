// ============================================================================
// 【HirstoryList】Swap 兑换历史记录列表（注意：Hirstory 是原代码的拼写错误，应为 History）
// ----------------------------------------------------------------------------
// 职责：
//   展示当前 Token 在 Facet L2 上的兑换历史记录，支持分页。
//   监听 FacetSwapStore.historyAddress 变化，动态切换查询的 Token 地址。
//
// 数据来源：
//   services.marketplace.getSwapActivity(filterRequest)
//
// 三个 useEffect 的职责分离：
//   1. 监听 facetSwapStore.historyAddress → 更新 filterRequest.tokenAddress + 重置到第1页
//   2. 监听 tokenAddress（外部 prop）→ 同上（初始化时 prop 传入）
//   3. 监听 filterRequest → 触发数据请求
//
// 为什么有两个地址来源（prop + store）？
//   - prop tokenAddress：页面首次加载时由父组件传入
//   - store historyAddress：用户在 SwapContainer 切换代币时更新
//   两者都需要响应，所以有两个 effect 都监听。
// ============================================================================

import { GridPaginationModel } from '@mui/x-data-grid';
import { useImmer } from 'use-immer';
import { useEffect, useState } from 'react';

import TableData from './TableData';
import services from '@/services';
import { GetCollectionDetailData, GetSwapActivityData, GetSwapActivityRequest } from '@/services/marketpalce/types';
import * as FacetSwapStore from '@/stores/FacetSwapStore';
import { useSnapshot } from 'valtio/react';

// 每页显示条数
const PAGE_START_INIT = 20;

interface IHistoryList {
  tokenAddress?: string; // 初始 Token 合约地址（外部 prop）
  collectionDetail?: GetCollectionDetailData; // 集合详情（传给 TableData 显示代币名等）
}

const HirstoryList: React.FC<IHistoryList> = ({ tokenAddress, collectionDetail }) => {
  // 订阅 FacetSwapStore 的 historyAddress（用户切换代币时更新）
  const facetSwapStore = useSnapshot(FacetSwapStore.store);

  // filterRequest：分页 + 地址 请求参数
  const [filterRequest, setFilterRequest] = useImmer<GetSwapActivityRequest>({
    tokenAddress: tokenAddress as string,
    'page.size': PAGE_START_INIT,
    'page.index': 1,
  });

  // 加载状态：防止并发请求
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // swapActivity：兑换历史数据（事件列表 + 分页信息）
  const [swapActivity, setSwapActivity] = useState<GetSwapActivityData>({
    events: [],
    page: {
      size: PAGE_START_INIT,
      index: 1,
      total: '0',
    },
  });

  // Effect #1：监听 store 中用户切换的代币地址
  // 用户在 SwapContainer 里选择新代币时，FacetSwapStore.historyAddress 会更新
  // 这里同步到 filterRequest，同时重置页码到第 1 页
  useEffect(() => {
    if (facetSwapStore.historyAddress) {
      setFilterRequest((state) => {
        state.tokenAddress = facetSwapStore.historyAddress;
        state['page.index'] = 1; // 切换代币时重置到第 1 页
      });
    }
  }, [facetSwapStore.historyAddress]);

  // 数据请求函数
  async function getTransactionList() {
    if (isLoading) return; // 防并发
    setSwapActivity({ ...swapActivity, events: [] }); // 清空旧数据（避免闪烁旧内容）
    setIsLoading(true);
    const response = await services.marketplace.getSwapActivity(filterRequest);

    if (response?.code === 200) {
      setSwapActivity(response.data);
    }
    setIsLoading(false);
  }

  // Effect #2：监听外部 prop tokenAddress 变化（页面初始化或父组件更新地址时）
  useEffect(() => {
    if (tokenAddress) {
      setFilterRequest((state) => {
        state.tokenAddress = tokenAddress;
        state['page.index'] = 1;
      });
    }
  }, [tokenAddress]);

  // Effect #3：filterRequest 变化（包括翻页、切换代币）→ 触发请求
  useEffect(() => {
    getTransactionList();
  }, [filterRequest]);

  return (
    // 把数据和回调传给纯展示组件 TableData
    <TableData
      isLoading={isLoading}
      data={swapActivity}
      collectionDetail={collectionDetail}
      pageSize={PAGE_START_INIT}
      onPageChange={async (model: GridPaginationModel) => {
        // 用户点击分页控件时，更新 filterRequest 的页码
        // 触发 Effect #3 重新请求
        setFilterRequest((state) => {
          state['page.index'] = model.page;
          state['page.size'] = model.pageSize;
        });
      }}
    />
  );
};

export default HirstoryList;
