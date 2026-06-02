// ============================================================================
// 【购物车空状态】没有商品时显示的占位页
// ----------------------------------------------------------------------------
// 职责：
//   - 显示一个“无数据”插画
//   - 提供一个 CTA（Call To Action）按钮“Explore Collections”引导用户去市场选商品
//
// 为什么这里要独立拆一个组件：
//   - 保持父组件 CartDrawer 简洁（只负责组装，不负责具体状态 UI）
//   - 空状态未来可能要加入推荐商品、最近浏览等复杂逻辑，占一个独立文件更利于维护
// ============================================================================

'use client';

import { Avatar, Box, Button, Drawer, IconButton, List, ListItem, Typography } from '@mui/material';
import { useRouter, useSearchParams } from 'next/navigation';
import { useSnapshot } from 'valtio';

import NoResult from '@/assets/images/no_result.svg';
import * as CartStore from '@/stores/CartStore';

interface ICartEmpty {
  // 关闭抽屉的回调（这里可选，现代码未使用，但预留接口以防后续需要）
  onClose?: (event: React.KeyboardEvent | React.MouseEvent) => void;
}

const CartEmpty: React.FC<ICartEmpty> = ({ onClose }) => {
  // useRouter 是 Next.js 的路由钩子，用于编程式跳转
  const router = useRouter();

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mt: '120px' }}>
      {/* 空状态插画 */}
      <NoResult />
      <Typography>No items added to cart</Typography>

      {/* CTA 按钮：引导用户去市场页 */}
      <Button
        sx={{
          margin: '0 auto',
          width: '185px',
          height: '36px',
          mt: '13px',
          borderRadius: '46px', // 圆角胶囊形状
          border: '1px solid #D5E970',
          textTransform: 'none', // 保持原始大小写，不要被 MUI 默认转大写
          '&:hover': {
            color: '#000',
            bgcolor: 'rgba(229, 255, 101, 1)', // 悬停时填充品牌主色
          },
        }}
        onClick={() => {
          // 跳转到市场页
          router.push(`/market`);
          // 同时关闭抽屉（不然抽屉会一直遵住页面）
          CartStore.setOpen(false);
        }}
      >
        Explore Collections
      </Button>
    </Box>
  );
};

export default CartEmpty;
