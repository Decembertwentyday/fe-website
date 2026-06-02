// ============================================================================
// 【containers/EthscriptionBox/index.tsx】铭文卡片通用容器
// ----------------------------------------------------------------------------
// 职责：
//   市场上所有铭文（NFT / Token / Domain / Image）卡片的外层包装容器。
//   负责：地址格式化展示、购物车/批量挂单高亮、数据下传、批量选择 Checkbox 插槽。
//
// Props 说明：
//   ethscription   = 铭文数据（来自市场列表接口）
//   onChange       = 操作回调（listing/buy/transfer... 完成后通知父组件刷新）
//   footer         = 插槽（父组件可放：赎回/购买/挂单等操作按钮）
//   isMyEtchScription = 是否是"我的铭文"页（true 时显示批量选择 Checkbox）
//
// addressDisplay 三层逻辑：
//   1. 默认：截断地址（"0x1234...5678"）
//   2. 是自己的地址 → 显示 'you'
//   3. 是协议挂单地址（owner === protocolAddress）→ 显示 'market'
//   注意：用 ethers.utils.getAddress 做校验和（checksum）防止大小写不一致导致比较失败
//
// 高亮边框：
//   isInCart（已加购物车）或 isInEthlist（已加批量挂单）→ 边框变 #D5E970（荧光黄绿）
//
// EthscriptionBoxContext.Provider：
//   将 ethscription、onChange、isInCart 三个值下传给子组件 footer
//   这样 footer 里的操作按钮（如 BuyButton）可以直接读取数据，无需层层传 props
//
// isMyEtchScription=true 时的 Checkbox：
//   - 平时隐藏（display: 'none'）
//   - 鼠标悬停时出现（'&:hover': { '& .checkbox': { display: 'flex' } }）
//   - 如果 bulkListingStore.ethsList 有数据，则一直显示（便于批量操作）
//   - 点击时：preventDefault + stopPropagation（防止冒泡到卡片点击）
//             再调用 BulkListingStore.toggleEthscriptionToCart 切换选中状态
// ============================================================================

'use client';

import { Avatar, Box, Checkbox, FormGroup, Link, Typography } from '@mui/material';
import { useAccount, useChainId } from 'wagmi';
import { ethers } from 'ethers';
import { useSnapshot } from 'valtio';
import { useRouter, useSearchParams } from 'next/navigation';

import { GetEthscriptionsItem } from '@/services/marketpalce/types';
import { EthscriptionBoxContext, IEthscriptionBoxContext } from './EthscriptionBoxContext';
import { URL_CONFIG } from '@/constants';
import EthscriptionView from './EthscriptionView';
import * as CartStore from '@/stores/CartStore';
import * as BulkListingStore from '@/stores/BulkListingStore';

interface IEthscriptionBox {
  onChange: IEthscriptionBoxContext['onChange']; // 操作完成回调（update/remove + 具体 action）
  ethscription: GetEthscriptionsItem; // 铭文数据
  footer?: JSX.Element; // 插槽：操作按钮区（买/卖/质押等）
  isMyEtchScription?: boolean; // 是否展示批量选择 Checkbox
}

const EthscriptionBox: React.FC<IEthscriptionBox> = ({
  onChange,
  ethscription,
  footer = null,
  isMyEtchScription = false,
}) => {
  const { address } = useAccount(); // 当前连接的钱包地址
  const chainId = useChainId();

  const router = useRouter();

  const cartStore = useSnapshot(CartStore.store);
  const bulkListingStore = useSnapshot(BulkListingStore.store);

  // addressDisplay：展示铭文 owner 的方式（你自己/市场挂单/截断地址）
  let addressDisplay = `${ethscription.order.owner.slice(0, 5)}...${ethscription.order.owner.slice(-4)}`;

  // 第二层判断：是否是自己的地址（getAddress 做校验和，避免大小写问题）
  if (address && ethers.utils.getAddress(address) === ethers.utils.getAddress(ethscription.order.owner)) {
    addressDisplay = 'you';
  }
  // 第三层判断：owner 是协议挂单地址 → 说明铭文已经挂在市场上（显示 'market'）
  if (
    ethscription.order.protocolAddress.trim() != '' &&
    ethers.utils.getAddress(ethscription.order.owner) === ethers.utils.getAddress(ethscription.order.protocolAddress)
  ) {
    addressDisplay = 'market';
  }

  // isInCart：检查此铭文 orderId 是否在购物车中（有则返回 orderId，否则 undefined）
  const isInCart = cartStore.orderIds?.find((orderId) => ethscription.order.orderId === orderId);

  // isInEthlist：检查此铭文是否在批量挂单列表中（通过 ethscriptionId 匹配）
  const isInEthlist =
    bulkListingStore.ethsList.findIndex((item) => item.order.ethscriptionId === ethscription.order.ethscriptionId) !==
    -1;

  // 高亮：购物车或批量挂单中有此铭文 → 边框显示荧光黄绿
  const isHighlight = Boolean(isInCart) || isInEthlist;

  return (
    // EthscriptionBoxContext.Provider：把数据下传给 footer 子组件（无需 props 层层传递）
    <EthscriptionBoxContext.Provider value={{ ethscription, onChange, isInCart: Boolean(isInCart) }}>
      <Box
        sx={{
          width: '100%',
          borderRadius: '8px',
          border: `1px solid ${isHighlight ? '#D5E970' : '#2F343E'}`, // 高亮时变荧光边框
          background: '#202229',
          overflow: 'hidden',
          transition: 'all 0.8s',
          display: 'flex',
          flexDirection: 'column',
          '&:hover': {
            borderColor: '#D5E970', // 悬停也高亮
          },
        }}
      >
        {isMyEtchScription ? (
          // 我的铭文：卡片图像区包裹一层 position:relative，用于批量选择 Checkbox 定位
          // <Link
          //   href={`/market/${ethscription.order.category}?category=${ethscription.order.category}&collectionName=${ethscription.order.collectionName}`}
          //   sx={{
          //     textDecoration: 'none',
          //   }}
          // >
          <Box
            sx={{
              position: 'relative',
              '&:hover': {
                '& .checkbox': {
                  display: 'flex', // 悬停时 Checkbox 显现
                },
              },
            }}
          >
            <EthscriptionView
              slotCheckBox={
                <Box
                  className="checkbox"
                  sx={{
                    // 默认隐藏；如果批量列表有数据则一直显示（方便批量操作）
                    display: bulkListingStore.ethsList.length > 0 ? 'flex' : 'none',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: 'rgba(255,255,255,0.1)',
                    width: '32px',
                    height: '32px',
                    borderRadius: '4px',
                  }}
                  onClick={(event) => {
                    event.preventDefault(); // 阻止默认行为（如链接跳转）
                    event.stopPropagation(); // 阻止冒泡（防止触发卡片 onClick）
                    BulkListingStore.toggleEthscriptionToCart({
                      ...ethscription,
                      floorPrice: '',
                      protocol: '0',
                      royalty: '0',
                    });
                  }}
                >
                  <Checkbox
                    size="small"
                    checked={isInEthlist} // 是否已选中（受控）
                    sx={{
                      '&.MuiCheckbox-root:hover': {
                        bgcolor: 'transparent',
                      },
                    }}
                  />
                </Box>
              }
              ethscription={ethscription}
            />
          </Box>
        ) : (
          // 非"我的铭文"：不展示 Checkbox
          <EthscriptionView ethscription={ethscription} />
        )}
        <Box
          sx={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            background: 'rgba(255, 255, 255, 0.05)',
            // token/domain 类别有顶部内边距（信息行在图像下方）；nft/image 则无（图像贴边）
            p: ['token', 'domain'].includes(ethscription.order.category) ? '16px 16px 0 16px' : '0 16px',
          }}
        >
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              color: '#fff',
              flex: 1,
              pb: '16px',
            }}
          >
            {/* 铭文序号（链接至详情页）*/}
            <Link
              href={`/ethscriptions/${ethscription.order.ethscriptionId}`}
              style={{
                textDecoration: 'none',
              }}
              sx={{ fontSize: '12px', textDecorationLine: 'none', color: '#fff' }}
            >
              {`#${ethscription.order.ethscriptionNumber}`}
            </Link>
            {/* owner 地址（链接至地址持有查询页）*/}
            <Link
              target="__blank"
              href={`/tokens/search?address=${ethscription.order.owner}`}
              sx={{ fontSize: '12px', textDecorationLine: 'none', color: '#fff' }}
            >
              {addressDisplay}
            </Link>
          </Box>

          {/* 价格区域：只有挂单中的铭文才显示（isListing=true）*/}
          {ethscription.order.isListing && (
            <Box
              sx={{
                pt: '13px',
                display: 'flex',
                justifyContent: 'space-between',
                color: '#fff',
                borderTop: '1px solid rgba(255, 255, 255, 0.10)',
                '& p': {
                  fontSize: '12px',
                },
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Avatar src={ethscription.payment.icon} sx={{ width: 24, height: 24 }} /> {/* 支付代币图标 */}
                <Typography>{ethscription.order.price}</Typography>
              </Box>
              <Typography sx={{ color: 'rgba(255, 255, 255, 0.45)' }}>{`$${Number(ethscription.order.priceUsd).toFixed(
                2,
              )}`}</Typography>
            </Box>
          )}

          {/* footer 插槽：由父组件传入，如买入按钮/质押按钮/转账按钮等 */}
          {footer}
        </Box>
      </Box>
    </EthscriptionBoxContext.Provider>
  );
};

export default EthscriptionBox;
