// ============================================================================
// 【购物车商品列表】抽屉中间区域的表格组件
// ----------------------------------------------------------------------------
// 职责：以三列表格展示购物车中的所有铭文商品
//   列 1：商品信息（图片 + 名称 + 编号 + 移除按钮）
//   列 2：数量
//   列 3：价格（或 "Unavailable" 状态标签）
//
// 三种状态的渲染：
//   1. 加载中（cartOrderLoading） → 转圈
//   2. 空列表（orders.length===0） → "No Data"
//   3. 有数据 → 逐行渲染每个订单
//
// 关键设计点：
//   1. 商品可能是 3 种类型：token / domain / nft，每种显示方式不同（ethscriptionImg 对象查表）
//   2. 如果订单 signature 为空 → 代表已成交/已撤销 → 整行变灰、价格位显示 Unavailable
//   3. 使用 CSS Grid 布局（gridTemplateColumns: repeat(3, 1fr)）实现三列均分
//   4. 使用 BigNumber 从 wei 转换为 ETH（除以 10^18），避免 JS Number 精度丢失
// ============================================================================

import BigNumber from 'bignumber.js';
import { Box, Typography, Avatar, CircularProgress } from '@mui/material';
import { useSnapshot } from 'valtio';

import * as CartStore from '@/stores/CartStore';
import EthIcon from '@/assets/icons/eth16.svg';
import RemoveItem from '@/assets/icons/remove_cart_item.svg';

import { Fragment } from 'react';
import NftImage from '@/components/NftImage';

interface ICartListTable {}

const CartList = ({}: ICartListTable) => {
  // 订阅购物车状态：订单变化时自动重渲染
  const cartStore = useSnapshot(CartStore.store);

  // 根据状态返回不同的中间区内容
  function getListComponent() {
    // 【状态 1】加载中 → 转圈
    if (cartStore.cartOrderLoading) {
      return (
        <Box
          display="flex"
          alignItems="center"
          justifyContent="center"
          sx={{
            gridColumn: '1 / 4', // 跨越全部 3 列（CSS Grid 占位技巧）
          }}
        >
          <CircularProgress sx={{ color: 'rgba(255,255,255,0.2)' }} />
        </Box>
      );
    }

    // 【状态 2】空列表 → “No Data”
    if (cartStore.cartOrder && cartStore.cartOrder?.orders?.length <= 0) {
      return (
        <Box
          display="flex"
          alignItems="center"
          justifyContent="center"
          sx={{
            gridColumn: '1 / 4',
          }}
        >
          No Data
        </Box>
      );
    }

    // 【状态 3】渲染每个订单项
    return cartStore.cartOrder?.orders.map((item, index) => {
      const { category, content } = item.item;

      // 根据商品类型选择不同的图像展示方式（查表对象模式，代替 if-else 链）
      const ethscriptionImg = {
        token: <NftImage content={item.item.icon} />, // 代币：显示图标
        domain: (
          // 域名：直接用文字渲染 ".xxx" 格式（节省图片请求）
          <Box
            sx={{
              fontFeatureSettings: "'clig' off, 'liga' off", // 禁用连字特性，保证文字独立显示
              fontFamily: 'Songti SC', // 宋体，中文域名需要
              fontSize: '12px',
              fontWeight: 900,
              color: '#000',
            }}
          >{`.${item.item.collectionName}`}</Box>
        ),
        nft: <NftImage content={item.item.content} />, // NFT：显示图片
        image: null,
        text: null,
      };

      return (
        <Fragment key={item.order.orderHash + index}>
          {/* 【列 1】商品信息 */}
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'flex-start',
              gap: '10px',
              alignItems: 'center',
              // 如果签名为空（订单失效） → 透明度 0.3（变灰效果）
              opacity: item.order.signature.trim() == '' ? 0.3 : 1,
            }}
          >
            {/* 商品图标区（父元素设 relative 用于定位右上角的移除按钮） */}
            <Box
              sx={{
                width: '32px',
                height: '32px',
                position: 'relative',
              }}
            >
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: '#C5FA40', // 亮黄背景（品牌辅助色）
                  borderRadius: '2px',
                  overflow: 'hidden',
                  height: '100%',
                  width: '100%',
                }}
              >
                {/* 根据类型查表取组件；未知类型则用空 Fragment 占位 */}
                {ethscriptionImg?.[category] || <Fragment />}
              </Box>

              {/* 右上角的移除按钮 */}
              <Box
                sx={{ position: 'absolute', top: '-8px', right: '-8px', cursor: 'pointer' }}
                onClick={() => {
                  // 根据 orderHash 从购物车中移除该项
                  CartStore.removeEthscription(item.order.orderHash);
                }}
              >
                <RemoveItem />
              </Box>
            </Box>

            {/* 商品文本信息 */}
            <Box>
              {/* 名称：域名类型去掉 "data:," 前缀；其他类型显示 collectionName */}
              <Typography
                sx={{ color: 'rgba(255, 255, 255, 1)', fontSize: '14px', fontWeight: '500', marginBottom: '6px' }}
              >
                {category == 'domain' ? item.item.content.replace('data:,', '') : item.item.collectionName}
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'flex-start', gap: '10px' }}>
                {/* 非域名才显示 tokenId（域名没有 tokenId） */}
                {category != 'domain' && (
                  <Typography
                    sx={{
                      minWidth: '44px',
                      color: 'rgb(255, 255, 255)',
                      fontSize: '12px',
                      fontWeight: '500',
                      padding: '2px 4px',
                      borderRadius: '3px',
                      border: '1px solid rgb(255, 255, 255)',
                      background: 'rgba(255, 255, 255, 0.05)',
                      boxSizing: 'border-box',
                    }}
                  >{`#${item.item.tokenId}`}</Typography>
                )}
                {/* 铭文全局序号 */}
                <Typography
                  sx={{
                    minWidth: '44px',
                    color: 'rgba(255, 255, 255, 0.45)',
                    fontSize: '12px',
                    fontWeight: '500',
                    padding: '2px 4px',
                    borderRadius: '3px',
                    border: '1px solid rgba(255, 255, 255, 0.20)',
                    background: 'rgba(255, 255, 255, 0.05)',
                    boxSizing: 'border-box',
                  }}
                >{`#${item.item.ethscriptionNumber}`}</Typography>
              </Box>
            </Box>
          </Box>

          {/* 【列 2】数量 */}
          <Typography
            sx={{
              justifySelf: 'center',
              fontSize: '14px',
              color: item.order.signature.trim() == '' ? 'rgba(255,255,255,0.3)' : '#fff',
            }}
          >
            {item.order.quantity}
          </Typography>

          {/* 【列 3】价格或失效标签 */}
          {item.order.signature.trim() == '' ? (
            // 订单已成交/已撤销 → 红色“Unavailable”
            <Typography sx={{ justifySelf: 'flex-end', color: '#D8346F' }}>Unavailable</Typography>
          ) : (
            <Typography sx={{ justifySelf: 'flex-end', fontSize: '14px', color: '#fff' }}>
              {/*
                价格转换：wei → ETH（除以 10^18）
                为什么用 BigNumber：JS 原生 Number 只能精确表达 2^53 以内的整数，
                而 wei 金额动辄上亿十九位，直接除法会丢失精度。
              */}
              {`${
                item.order.price ? new BigNumber(item.order.price || 0).div(new BigNumber(10).pow(18)).toString() : '--'
              } ETH`}
              <EthIcon />
            </Typography>
          )}
        </Fragment>
      );
    });
  }

  return (
    <Box
      sx={{
        padding: '0 20px 28px',
        width: '100%',
        minHeight: '0',
        maxHeight: 'calc(100% - 190px)', // 190px 是顶部操作区 + 底部结算区的高度
        overflowY: 'scroll', // 商品过多时出现滚动条
      }}
    >
      {/* CSS Grid 三列表格布局 */}
      <Box
        sx={{
          display: 'grid',
          justifyContent: 'center',
          alignItems: 'center',
          gridTemplateColumns: 'repeat(3, 1fr)', // 3 列均分
          gridTemplateRows: '24px repeat(auto-fill, 42px)', // 首行 24px、其余行 42px
          gap: '28px 0',
          fontSize: '14px',
          fontWeight: '400',
          color: 'rgba(255,255,255,0.45)',
        }}
      >
        {/* 表头 */}
        <Typography sx={{ height: '24px' }}>Items</Typography>
        <Typography sx={{ height: '24px', justifySelf: 'center' }}>Quantity</Typography>
        <Typography sx={{ height: '24px', justifySelf: 'flex-end' }}>Value</Typography>

        {/* 表体（在 Grid 的 flat 中连续填充，每 3 个 Cell 自动换行） */}
        {getListComponent()}
      </Box>
    </Box>
  );
};

export default CartList;

  function getListComponent() {
    if (cartStore.cartOrderLoading) {
      return (
        <Box
          display="flex"
          alignItems="center"
          justifyContent="center"
          sx={{
            gridColumn: '1 / 4',
          }}
        >
          <CircularProgress sx={{ color: 'rgba(255,255,255,0.2)' }} />
        </Box>
      );
    }

    if (cartStore.cartOrder && cartStore.cartOrder?.orders?.length <= 0) {
      return (
        <Box
          display="flex"
          alignItems="center"
          justifyContent="center"
          sx={{
            gridColumn: '1 / 4',
          }}
        >
          No Data
        </Box>
      );
    }

    return cartStore.cartOrder?.orders.map((item, index) => {
      const { category, content } = item.item;
      const ethscriptionImg = {
        token: <NftImage content={item.item.icon} />,
        domain: (
          <Box
            sx={{
              fontFeatureSettings: "'clig' off, 'liga' off",
              fontFamily: 'Songti SC',
              fontSize: '12px',
              fontWeight: 900,
              color: '#000',
            }}
          >{`.${item.item.collectionName}`}</Box>
        ),
        nft: <NftImage content={item.item.content} />,
        image: null,
        text: null,
      };

      return (
        <Fragment key={item.order.orderHash + index}>
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'flex-start',
              gap: '10px',
              alignItems: 'center',
              opacity: item.order.signature.trim() == '' ? 0.3 : 1,
            }}
          >
            <Box
              sx={{
                width: '32px',
                height: '32px',
                position: 'relative',
              }}
            >
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: '#C5FA40',
                  borderRadius: '2px',
                  overflow: 'hidden',
                  height: '100%',
                  width: '100%',
                }}
              >
                {ethscriptionImg?.[category] || <Fragment />}
              </Box>
              <Box
                sx={{ position: 'absolute', top: '-8px', right: '-8px', cursor: 'pointer' }}
                onClick={() => {
                  CartStore.removeEthscription(item.order.orderHash);
                }}
              >
                <RemoveItem />
              </Box>
            </Box>

            <Box>
              <Typography
                sx={{ color: 'rgba(255, 255, 255, 1)', fontSize: '14px', fontWeight: '500', marginBottom: '6px' }}
              >
                {category == 'domain' ? item.item.content.replace('data:,', '') : item.item.collectionName}
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'flex-start', gap: '10px' }}>
                {category != 'domain' && (
                  <Typography
                    sx={{
                      minWidth: '44px',
                      color: 'rgb(255, 255, 255)',
                      fontSize: '12px',
                      fontWeight: '500',
                      padding: '2px 4px',
                      borderRadius: '3px',
                      border: '1px solid rgb(255, 255, 255)',
                      background: 'rgba(255, 255, 255, 0.05)',
                      boxSizing: 'border-box',
                    }}
                  >{`#${item.item.tokenId}`}</Typography>
                )}
                <Typography
                  sx={{
                    minWidth: '44px',
                    color: 'rgba(255, 255, 255, 0.45)',
                    fontSize: '12px',
                    fontWeight: '500',
                    padding: '2px 4px',
                    borderRadius: '3px',
                    border: '1px solid rgba(255, 255, 255, 0.20)',
                    background: 'rgba(255, 255, 255, 0.05)',
                    boxSizing: 'border-box',
                  }}
                >{`#${item.item.ethscriptionNumber}`}</Typography>
              </Box>
            </Box>
          </Box>

          <Typography
            sx={{
              justifySelf: 'center',
              fontSize: '14px',
              color: item.order.signature.trim() == '' ? 'rgba(255,255,255,0.3)' : '#fff',
            }}
          >
            {item.order.quantity}
          </Typography>

          {item.order.signature.trim() == '' ? (
            <Typography sx={{ justifySelf: 'flex-end', color: '#D8346F' }}>Unavailable</Typography>
          ) : (
            <Typography sx={{ justifySelf: 'flex-end', fontSize: '14px', color: '#fff' }}>
              {`${
                item.order.price ? new BigNumber(item.order.price || 0).div(new BigNumber(10).pow(18)).toString() : '--'
              } ETH`}
              <EthIcon />
            </Typography>
          )}
        </Fragment>
      );
    });
  }

  return (
    <Box
      sx={{
        padding: '0 20px 28px',
        width: '100%',
        minHeight: '0',
        maxHeight: 'calc(100% - 190px)',
        overflowY: 'scroll',
      }}
    >
      <Box
        sx={{
          display: 'grid',
          justifyContent: 'center',
          alignItems: 'center',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gridTemplateRows: '24px repeat(auto-fill, 42px)',
          gap: '28px 0',
          fontSize: '14px',
          fontWeight: '400',
          color: 'rgba(255,255,255,0.45)',
        }}
      >
        <Typography sx={{ height: '24px' }}>Items</Typography>
        <Typography sx={{ height: '24px', justifySelf: 'center' }}>Quantity</Typography>
        <Typography sx={{ height: '24px', justifySelf: 'flex-end' }}>Value</Typography>

        {getListComponent()}
      </Box>
    </Box>
  );
};

export default CartList;
