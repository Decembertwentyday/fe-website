// ============================================================================
// 【CartButton.tsx】购物车添加/移除切换按钮
// ----------------------------------------------------------------------------
// 作用：渲染在挂单卡片的右下角，用户点击以将该铭文加入购物车。
// 逻辑：
// 1. 如果该铭文的 owner 是自己，则无法购买，显示占位（且不可用状态）。
// 2. 否则，判断该铭文如果 isInCart 已经存在，则显示"移出"图标及逻辑。
// 3. 不存在于购物车中则显示"加入"图标，点击调用 CartStore 将订单信息存入全局购物车。
// ============================================================================

'use client';

import { Box } from '@mui/material';
import { useAccount } from 'wagmi';
import { ethers } from 'ethers';
import { useEthscriptionBoxContext } from '@/containers/EthscriptionBox/EthscriptionBoxContext';

import CartSVG from '@/assets/icons/cart_normal.svg';
import CartRemoveSVG from '@/assets/icons/cart_remove.svg';
import * as CartStore from '@/stores/CartStore';
import { Fragment } from 'react';

const CartButton = () => {
  const { ethscription, isInCart } = useEthscriptionBoxContext();
  const { address } = useAccount();

  if (ethscription === null) return null;

  const isYou = address && ethers.utils.getAddress(address) == ethers.utils.getAddress(ethscription.order.owner);

  if (isYou) {
    return (
      <Box
        sx={{
          width: '36px',
          height: '36px',
          backgroundColor: 'transparent',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: '50%',
        }}
      >
        <CartSVG
          style={{
            color: '#171A1F',
          }}
        />
      </Box>
    );
  }

  return (
    <Fragment>
      <Box
        sx={{
          cursor: 'pointer',
          position: 'relative',
          width: '36px',
          height: '36px',
          ':hover': {
            '.add-cart-button': {
              opacity: isInCart ? 0 : 1,
            },
          },
        }}
        onClick={(e) => {
          e.stopPropagation();
          if (isYou) return;
          CartStore.toggleEthscriptionToCart(ethscription.order.orderId);
        }}
      >
        {isInCart && (
          <Box
            sx={{
              width: '36px',
              height: '36px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'absolute',
              backgroundColor: '#D8346F',
              borderRadius: '50%',
              top: 0,
              left: 0,
            }}
          >
            <CartRemoveSVG />
          </Box>
        )}

        <Box
          className="add-cart-button"
          sx={{
            width: '36px',
            height: '36px',
            backgroundColor: isInCart ? '#E5FF65' : 'transparent',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: '50%',
            position: 'absolute',
            top: 0,
            left: 0,
          }}
        >
          <CartSVG
            style={{
              color: isInCart ? '#171A1F' : '#E5FF65',
            }}
          />
        </Box>
      </Box>
    </Fragment>
  );
};

export default CartButton;
