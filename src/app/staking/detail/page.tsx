// ============================================================================
// 【StakingDetailPage】质押详情页（/staking/detail）
// ----------------------------------------------------------------------------
// 职责：
//   展示某个地址（owner）在指定集合（collection）中的所有质押记录。
//   从 URL 参数读取 owner + collectionName，传给 StakingDetailList 容器。
//
// URL 参数：
//   ?owner=0x123...     — 要查看的钱包地址
//   ?collectionName=xxx — 集合名称
//
// 导航逻辑：
//   DetailBack 组件显示「← Staking / {owner}」的返回按钮，点击调用 router.back() 返回列表页。
// ============================================================================

'use client';

import { Box, Tab } from '@mui/material';
import DetailBack from '../DetailBack';
import StakingDetailList from '@/containers/StakingDetailList';
import { useSearchParams } from 'next/navigation';

const StakingDetailPage = () => {
  // 从 URL 读取 owner（钱包地址）和集合名称
  const searchParams = useSearchParams();
  const owner = searchParams.get('owner') || '';
  const collection = searchParams.get('collectionName') || '';

  return (
    <Box sx={{ p: '40px 0' }}>
      {/* 返回按钮：显示 "← Staking / 0x123..."，点击返回上一页 */}
      <DetailBack label={`Staking / ${owner}`} />

      {/* 质押记录列表：展示该地址在该集合中的所有质押操作 */}
      <StakingDetailList owner={owner} collection={collection} />
    </Box>
  );
};

export default StakingDetailPage;
