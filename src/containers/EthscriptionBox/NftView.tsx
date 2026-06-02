// ============================================================================
// 【EthscriptionBox/NftView.tsx】NFT / Image 类铭文卡片视图
// ----------------------------------------------------------------------------
// 展示 NFT 或图片类铭文。核心分为三层：
//   1. NftImage：自适应渲染（HTML/图片/其他 data URI 三种格式）
//   2. 底部信息栏：集合名 + tokenId + verified 勾，点击跳转市场页
//   3. slotCheckBox：Checkbox 插槽（绝对定位右上角，批量挂单时使用）
// ============================================================================

'use client';

import { Box, Typography } from '@mui/material';

import SwooshGreenSVG from '@/assets/images/swoosh-icon-green.svg';
import { GetEthscriptionsItem } from '@/services/marketpalce/types';
import NftImage from '@/components/NftImage';
import Link from 'next/link';

interface INftView {
  ethscription: GetEthscriptionsItem;
  slotCheckBox?: React.ReactNode; // 批量选择 Checkbox（由父组件 EthscriptionBox 传入）
}

const NftView: React.FC<INftView> = ({ ethscription, slotCheckBox = null }) => {
  const { content, collectionName } = ethscription.order;

  return (
    <Box sx={{ height: 'auto', position: 'relative' }}>
      <Box
        sx={{
          flex: '1 1',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <NftImage content={content} />
      </Box>
      <Link
        href={`/market/${ethscription.order.category}?category=${ethscription.order.category}&collectionName=${ethscription.order.collectionName}`}
        style={{
          textDecoration: 'none',
        }}
      >
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            width: '100%',
            padding: '16px',
            background: 'rgba(255, 255, 255, 0.05)',
          }}
        >
          <Box sx={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
            <Typography sx={{ color: 'rgb(255, 255, 255)', fontSize: '12px' }}>{collectionName}</Typography>
            <Typography
              sx={{ color: 'rgba(255, 255, 255, 0.45)', fontSize: '12px' }}
            >{`#${ethscription.order.tokenId}`}</Typography>
          </Box>
          {ethscription.order.isVerified && <SwooshGreenSVG />}
        </Box>
      </Link>
      {slotCheckBox && (
        <Box
          sx={{
            justifySelf: 'flex-end',
            position: 'absolute',
            top: '13px',
            right: '10px',
            bgcolor: '#2f3136',
            // background: '#383d4e',
            borderRadius: '4px',
          }}
        >
          {slotCheckBox}
        </Box>
      )}
    </Box>
  );
};

export default NftView;
