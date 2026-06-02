// ============================================================================
// 【购物车顶部操作区】标题 + 清空 + 关闭按钮
// ----------------------------------------------------------------------------
// 位置：CartDrawer 抽屉的顶部
// 职责：
//   - 显示购物车标题（含商品数量）
//   - 提供“全部清空”按钮（仅当购物车非空时显示）
//   - 提供关闭抽屉按钮（X 图标）
//
// onClose 是从父组件 CartDrawer 传下来的，点击后调用 toggleDrawer(false) 关闭抽屉。
// ============================================================================

'use client';

import { Box, Drawer, IconButton, List, ListItem, Typography } from '@mui/material';

import CloseSVG from '@/assets/icons/close.svg';
import * as CartStore from '@/stores/CartStore';

interface ICartOperation {
  // 关闭抽屉的回调（同时支持键盘事件和鼠标事件）
  onClose: (event: React.KeyboardEvent | React.MouseEvent) => void;
}

const CartOperation: React.FC<ICartOperation> = ({ onClose }) => {
  return (
    <Box
      sx={{
        padding: '0 20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between', // 左右分布：左边标题，右边关闭按钮
        marginBottom: '18px',
      }}
    >
      {/* 【左侧】标题 + 清空按钮 */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <Typography sx={{ color: 'rgba(255, 255, 255, 1)', fontSize: '18px', fontWeight: '500' }}>
          {/*
            注意：这里直接读 CartStore.store.orderIds.length，而不是用 useSnapshot。
            这依赖于 React 重渲染时会重新读取该值。常规写法是用 useSnapshot 获得响应式订阅，
            但本组件依赖父组件 CartDrawer 的重渲染连带刷新，所以一般不会出错。
          */}
          {`Cart(${Number(CartStore.store.orderIds.length)})`}
        </Typography>

        {/* 只有购物车中有商品时，才显示“全部清空” */}
        {CartStore.store.orderIds.length > 0 && (
          <Typography
            sx={{ color: 'rgba(229, 255, 101, 1)', fontSize: '14px', fontWeight: '500', cursor: 'pointer' }}
            onClick={() => {
              // 调用 store 的 action 清空所有购物车商品
              CartStore.clearAllEthsciption();
            }}
          >
            Clear All
          </Typography>
        )}
      </Box>

      {/* 【右侧】关闭按钮 */}
      <IconButton onClick={onClose}>
        <CloseSVG />
      </IconButton>
    </Box>
  );
};

export default CartOperation;
