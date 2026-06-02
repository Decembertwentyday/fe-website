// ============================================================================
// 【Swap 容器】代币兑换页核心容器
// ----------------------------------------------------------------------------
// 职责：
//   将 Swap 页面的三个子组件组合在一起：
//   1. SwapChart    - 代币价格走势图（仅大屏显示）
//   2. SwapContainer - 核心兑换交互区（输入数量、选代币、执行兑换）
//   3. HirstoryList  - 兑换历史记录列表（注意：拼写错误 Hirstory，保持原样）
//
// Props：
//   category（categoryType）：集合类型（影响某些服务接口的调用参数）
//
// 数据来源：
//   - URL query param `collectionName`：当前集合名称
//   - EthscriptionsStore.collectionDetail：集合详情（包含合约地址、Facet Stat 等）
//
// 响应式布局（1400px 断点）：
//   宽屏（≥1400px）：左侧显示价格走势图 + 竖向分隔线，右侧显示兑换区
//   窄屏（<1400px）：隐藏走势图，只显示兑换区（移动端体验）
//
// tokenAddress：
//   从 collectionDetail.collections.facetStat.contractAddress 获取，
//   即该集合对应的 Facet L2 上的 ERC-20 合约地址，用于 SwapChart 和 HirstoryList 查询数据。
// ============================================================================

'use client';

import { Box, useMediaQuery } from '@mui/material';
import { useSearchParams } from 'next/navigation';
import { useSnapshot } from 'valtio/react';

import SwapChart from './SwapChart';
import SwapContainer from './SwapContainer';
import HirstoryList from './HirstoryList'; // 注意：Hirstory 是原文件的拼写错误（应为 History）

import { categoryType } from '@/services/marketpalce/types';
import * as EthscriptionsStore from '@/stores/EthscriptionsStore';
import { IEthscriptionsStore } from '@/stores/EthscriptionsStore';
import { Fragment } from 'react';

// 组件 Props：接收集合类型
interface ISwap {
  category: categoryType;
}

const Swap: React.FC<ISwap> = ({ category }) => {
  // 从 URL 查询参数读取集合名称（如 ?collectionName=ETHS）
  const searchParams = useSearchParams();
  const collectionName = searchParams?.get('collectionName')?.toString().trim() ?? '';

  // 1400px 断点：宽屏才显示价格走势图（SwapChart）
  const matches = useMediaQuery('(min-width:1400px)');

  // 从 EthscriptionsStore 读取集合详情（valtio useSnapshot 订阅响应式）
  const ethscriptionsStore = useSnapshot(EthscriptionsStore.store) as IEthscriptionsStore;
  const collectionDetail = ethscriptionsStore.collectionDetail;

  // 提取该集合在 Facet L2 上的合约地址，用于 SwapChart 查询价格数据和 HirstoryList 查询历史
  const tokenAddress = collectionDetail?.collections.facetStat.contractAddress;

  return (
    // 整体卡片容器：深色背景 + 圆角边框
    <Box
      sx={{
        borderRadius: '8px',
        border: '1px solid #2F343E',
        background: '#202229',
        p: '60px 24px 0',
        boxSizing: 'border-box',
      }}
    >
      {/* 上半部分：走势图（大屏）+ 兑换区（始终显示） */}
      <Box
        sx={{
          mb: '75px',
          gap: matches ? '80px' : '12px',
          display: 'flex',
          p: '0 11px 0 36px',
          boxSizing: 'border-box',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: matches ? 'nowrap' : 'wrap', // 窄屏时换行
        }}
      >
        {/* 大屏才渲染走势图和分隔线（Fragment 避免多余 DOM 节点） */}
        {matches && (
          <Fragment>
            <SwapChart
              sx={{ flex: 1 }}
              category={category}
              tokenAddress={tokenAddress}
              collectionName={collectionName}
            />
            {/* 走势图和兑换区之间的竖向分隔线 */}
            <Box sx={{ width: '1px', height: '439px', background: 'rgba(255, 255, 255, 0.10)' }} />
          </Fragment>
        )}

        {/* 核心兑换交互区：大屏时宽度自适应内容，小屏时撑满容器 */}
        <SwapContainer sx={{ width: matches ? 'max-content' : '100%' }} collectionDetail={collectionDetail} />
      </Box>

      {/* 下半部分：兑换历史记录列表 */}
      <HirstoryList tokenAddress={tokenAddress} collectionDetail={collectionDetail} />
    </Box>
  );
};

export default Swap;
