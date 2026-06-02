// ============================================================================
// 【购物车抽屉】整个购物车的入口组件（右侧贴边抽屉）
// ----------------------------------------------------------------------------
// 做什么：
//   1) 在顶部导航栏显示一个购物车图标 + 未读数字角标（显示购物车里多少项）
//   2) 点击后从右侧弹出 Drawer（抽屉）面板
//   3) 抽屉内部由几个子组件拼装：
//      │┌─ CartOperation（顶部标题 + 清空按钮 + 关闭按钮）
//      │├─ CartList     （中间商品列表）  ← 仅当购物车非空时显示
//      │├─ CartSettlement（底部总计 + 结算按钮） ← 仅当购物车非空时显示
//      │└─ CartEmpty    （空状态提示）         ← 仅当购物车为空时显示
//
// 状态来源：
//   全局 valtio store: src/stores/CartStore.ts
//   - cartStore.orderIds          → 购物车中的订单 ID 列表（长度即数字角标）
//   - cartStore.open              → 抽屉是否打开
//   - cartStore.openResult        → 结果弹窗是否打开
//   - cartStore.isSuccess         → 上次交易是否成功
//
// 为什么用 Drawer 而不是 Modal：
//   Drawer（抽屉）不遮挡主页面的左侧，用户可以一边看商品列表一边查看购物车。
//   Modal（弹窗）会遮挡整个页面，交互体验不如 Drawer。
//
// 响应式设计：
//   useMediaQuery('(min-width:750px)') → 桌面端抽屉宽 460px；移动端宽 100%（全屏）
// ============================================================================

'use client';

import { Box, Drawer, useMediaQuery } from '@mui/material';
import { Fragment } from 'react';
import { useSnapshot } from 'valtio';

import CartSVG from '@/assets/icons/cart_normal.svg';
import CartOperation from './CartOperation';
import CartSettlement from './CartSettlement';
import CartList from './CartList';
import CartEmpty from './CartEmpty';
import * as CartStore from '@/stores/CartStore';
import ResultView from '../ResultView';

const CartDrawer = () => {
  // 订阅购物车全局状态：状态变化时本组件自动重渲染
  const cartStore = useSnapshot(CartStore.store);
  // 响应式：是否是桌面端（>=750px）
  const matches = useMediaQuery('(min-width:750px)');

  // “开关切换”函数，返回一个事件处理器
  // 这种 “key 事件与 click 事件都能调用” 的写法是 MUI Drawer 的推荐模式
  const toggleDrawer = (open: boolean) => (event: React.KeyboardEvent | React.MouseEvent) => {
    CartStore.setOpen(open);
  };

  return (
    <Fragment>
      {/* 【顶部购物车图标 + 数字角标】嵌入 Header 中显示 */}
      <Box
        onClick={toggleDrawer(!cartStore.open)} // 点击切换抽屉开关
        sx={{
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative', // 作为角标的定位参考
        }}
      >
        <CartSVG color="#E5FF65" />

        {/* 只有购物车里有商品才显示角标 */}
        {cartStore.orderIds.length > 0 && (
          <Box
            sx={{
              position: 'absolute', // 绝对定位在购物车右上角
              width: '14px',
              height: '14px',
              background: '#E5FF65', // 品牌荧光黄绿
              borderRadius: '50%',
              color: '#171A1F',
              fontSize: '10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              right: '-3px',
              top: '-2px',
            }}
          >
            {cartStore.orderIds.length}
          </Box>
        )}
      </Box>

      {/* 【抽屉本体】从右侧弹出 */}
      <Drawer
        anchor={'right'} // 从右侧弹出
        open={cartStore.open}
        onClose={toggleDrawer(false)} // 点击遮罩或按 Esc 关闭
        sx={{
          // .MuiDrawer-paper 是 Drawer 内部面板的 className
          '.MuiDrawer-paper': {
            padding: '20px 0 0 0',
            width: matches ? '460px' : '100%', // 桌面 460px / 移动全屏
            height: 'calc(100% - 64px)', // 64px 是顶部导航高度，避免抽屉遵住导航
            background: '#171A1F',
            boxShadow: '-4px 0px 12px 0px rgba(0, 0, 0, 0.25)',
            bottom: '0',
            top: 'unset', // 重要：取消 MUI 默认的 top:0，让抽屉贴底
            borderTop: '1px solid rgba(255, 255, 255, 0.05)',
            borderLeft: '1px solid rgba(255, 255,255, 0.05)',
          },
        }}
      >
        {/* 抽屉顶部操作区：标题、清空、关闭 */}
        <CartOperation onClose={toggleDrawer(false)} />

        {/* 有商品 → 显示列表 + 结算区；无商品 → 空状态 */}
        {cartStore.orderIds.length ? (
          <Fragment>
            <CartList />
            <CartSettlement />
          </Fragment>
        ) : (
          <CartEmpty onClose={toggleDrawer(false)} />
        )}
      </Drawer>

      {/* 【交易结果弹窗】点“结算”后的成功/失败提示 */}
      <ResultView
        title="Checkout"
        open={cartStore.openResult}
        onClose={async () => {
          if (cartStore.isSuccess) {
            // 占位体：未来可能加入成功后的刷新逻辑
          }
          CartStore.setOpenResult(false);
        }}
        isSuccess={cartStore.isSuccess}
      />
    </Fragment>
  );
};

export default CartDrawer;
