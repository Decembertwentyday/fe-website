/**
 * ==============================================================
 * 文件：src/app/asset/page.tsx
 * 作用：个人资产详情页（/asset）
 *
 * 页面结构：
 *   ┌─ 返回按钮 + "My Assets" 标题
 *   └─ MyAssets 容器（代币余额、转账、资产列表）
 *
 * router.back()：
 *   从 Header 账户菜单点进来时，返回上一页（通常是 market 或 owner）
 *   比写死 router.push('/') 更符合用户预期
 *
 * 布局宽度：
 *   桌面 1160px 居中，移动 100% — 与 owner 等个人页保持一致
 * minHeight calc(100vh - 203.5px)：Header + Footer 高度扣减，避免内容区过短
 * ==============================================================
 */

'use client';

import { Box, IconButton } from '@mui/material';
import { useRouter } from 'next/navigation';

import BackSVG from '@/assets/icons/back.svg';
import MyAssets from '@/containers/MyAssets';

const Asset = () => {
  const router = useRouter();

  return (
    <Box sx={{ minHeight: 'calc(100vh - 203.5px)', width: { xs: '100%', sm: '1160px' }, margin: '0 auto' }}>
      <Box
        sx={{ display: 'flex', alignItems: 'center', mb: '28px', cursor: 'pointer' }}
        onClick={() => {
          router.back();
        }}
      >
        <IconButton sx={{ marginRight: '16px' }}>
          <BackSVG />
        </IconButton>
        My Assets
      </Box>
      <MyAssets />
    </Box>
  );
};

export default Asset;
