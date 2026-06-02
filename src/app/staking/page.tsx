// ============================================================================
// 【Staking Page】质押页入口（/staking）
// ----------------------------------------------------------------------------
// 职责：
//   质押功能的主页面，展示选中集合的质押统计概览和排行榜。
//
// URL 参数：
//   ?collectionName=xxx  — 指定查看哪个集合的质押数据
//   空字符串时组件内部会判断 collection.trim() != '' 来跳过请求
//
// 页面结构：
//   ┌─────────────────────────────────┐
//   │  CollectionListSimple（集合选择器）│
//   ├─────────────────────────────────┤
//   │  StakingOverview（质押概览统计）  │
//   │  - Stakers / TotalLocked / TVL  │
//   │  - CumulativeRewards / PendingRewards │
//   │  - Era 进度圆形进度条             │
//   ├─────────────────────────────────┤
//   │  StakingRankList（质押排行榜）    │
//   │  - 各地址的质押份额和奖励         │
//   └─────────────────────────────────┘
//
// 注意：本页面是「薄页面」模式，只负责读取 URL 参数并传给容器组件。
// ============================================================================

'use client';

import CollectionListSimple from '@/containers/CollectionListSimple';
import StakingRankList from '@/containers/StakingRankList';
import StakingOverview from '@/containers/StakingOverview';
import { Box } from '@mui/material';
import { useSearchParams } from 'next/navigation';

const Staking = () => {
  // 从 URL 读取集合名称（如 ?collectionName=FacetPunks）
  // 默认空字符串，子组件内部会判断空值跳过请求
  const searchParams = useSearchParams();
  const collectionName = searchParams.get('collectionName') || '';

  return (
    <Box>
      {/* 顶部工具栏：集合选择下拉框 */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          p: '40px 0',
          gap: '20px',
          boxSizing: 'border-box',
          flexDirection: { xs: 'column', sm: 'row' }, // 小屏纵向排列，大屏横向
        }}
      >
        <Box
          sx={{
            p: '2px 4px',
            display: 'flex',
            alignItems: 'center',
            width: 260,
            height: 52,
            borderRadius: '6px',
            border: '1px solid #2F343E',
            background: '#202229',
          }}
        >
          {/* CollectionListSimple：选择集合后会更新 URL 的 collectionName 参数 */}
          <CollectionListSimple />
        </Box>
      </Box>

      {/* 质押概览（统计数字 + Era 进度） */}
      <StakingOverview collection={collectionName} />

      {/* 质押排行榜（各地址质押份额） */}
      <StakingRankList collection={collectionName} />
    </Box>
  );
};

export default Staking;
