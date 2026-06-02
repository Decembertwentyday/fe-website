// ============================================================================
// 【app/bulk/BulkList.tsx】批量挂单明细清单列表 & 统一价格设置
// ----------------------------------------------------------------------------
// 作用：展示已经选中的即将被挂单的铭文，并提供一键设置所有项同一价格的输入框功能。
// 逻辑流程：
// 1. 读取 BulkListingStore.bulkListEths。
// 2. 支持单项清除或一键设定全集挂单基准价。
// 3. 包含了侧边栏/底部栏的打包结算区 `BulkSettlement` 组件。
// ============================================================================

'use client';

import { Box, Button, InputAdornment, Typography, InputBase, IconButton, useMediaQuery } from '@mui/material';
import { useEffect, useState } from 'react';
import { useSnapshot } from 'valtio';

import EthLogo from '@/assets/icons/eth16.svg';
import RemoveSVG from '@/assets/icons/remove16.svg';
import BulkSettlement from './BulkSettlement';
import * as BulkListingStore from '@/stores/BulkListingStore';
import getTruncate from '@/utils/getTruncate';
import BigNumber from 'bignumber.js';
import { LoadingButton } from '@mui/lab';
// import EthscriptionLabel from '@/components/EthscriptionLabel';
import EthsLabelCard from '@/components/EthsLabelCard';

interface IBulkOperation {}

const BulkList: React.FC<IBulkOperation> = () => {
  const [value, setValue] = useState('');
  const bulkListingStore = useSnapshot(BulkListingStore.store);
  const matches = useMediaQuery('(min-width:750px)');

  async function getEthsFloorPrice() {
    // 初始化 地板价
    let floorPrice = bulkListingStore.orderNonceData?.unitPrice
      ? getTruncate(bulkListingStore.orderNonceData?.unitPrice, 6)
      : '--';

    bulkListingStore.bulkListEths.forEach((item) => {
      if (item.order.category == 'token') {
        floorPrice = getTruncate(
          BigNumber(bulkListingStore.orderNonceData?.unitPrice || 0)
            .multipliedBy(item.order.quantity)
            .toString(),
          6,
        );
      }

      BulkListingStore.updateBulkListEths({ ...item, floorPrice, protocol: '0', royalty: '0' });
    });
  }

  useEffect(() => {
    getEthsFloorPrice();
  }, []);

  return (
    <Box>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: '18px',
          flexWrap: matches ? 'nowrap' : 'wrap',
          justifyContent: matches ? 'normal' : 'space-between',
        }}
      >
        <Typography
          sx={{
            fontSize: '14px',
            color: 'rgba(255, 255, 255, 1)',
          }}
        >
          Set Price for All to
        </Typography>
        <LoadingButton
          disabled={
            bulkListingStore.bulkListEths.length <= 0 && bulkListingStore.orderNonceData?.unitPrice?.trim() != ''
          }
          variant="contained"
          disableElevation
          color="primary"
          sx={{
            height: '48px',
            fontSize: '14px',
            fontWeight: 500,
            textTransform: 'capitalize',
            borderRadius: '34px',
            '&.Mui-disabled': {
              background: '#e5ff6566',
            },
          }}
          onClick={() => {
            bulkListingStore.bulkListEths.forEach((item) => {
              const order = { ...item.order, price: item.floorPrice };

              const protocol = new BigNumber(bulkListingStore.orderNonceData?.protocolData.protocolFeeBps || 0)
                .div(10000)
                .multipliedBy(item.floorPrice)
                .toString();

              const royalty = new BigNumber(bulkListingStore.orderNonceData?.creatorData.creatorFeeBps || 0)
                .div(10000)
                .multipliedBy(item.floorPrice)
                .toString();

              BulkListingStore.updateBulkListEths({ ...item, order, protocol, royalty });
            });
          }}
        >
          Floor Price
        </LoadingButton>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <InputBase
            value={value}
            onChange={(e) => {
              setValue(e.target.value);
            }}
            endAdornment={
              <InputAdornment position="end" sx={{ color: 'rgba(255, 255, 255, 1)', pr: '4px' }}>
                ETH
                <Button
                  sx={{
                    width: '80px',
                    height: '40px',
                    borderRadius: '46px',
                    background: '#E5FF65',
                    color: '#171A1F',
                    fontSize: '14px',
                    textTransform: 'none',
                    ml: '16px',
                    '&:hover': {
                      background: 'rgba(229,255,101,0.7)',
                    },
                  }}
                  onClick={() => {
                    bulkListingStore.bulkListEths.forEach((item) => {
                      const protocol = new BigNumber(bulkListingStore.orderNonceData?.protocolData.protocolFeeBps || 0)
                        .div(10000)
                        .multipliedBy(value || 0)
                        .toString();

                      const royalty = new BigNumber(bulkListingStore.orderNonceData?.creatorData.creatorFeeBps || 0)
                        .div(10000)
                        .multipliedBy(value || 0)
                        .toString();

                      const order = { ...item.order, price: value };
                      BulkListingStore.updateBulkListEths({ ...item, order, protocol, royalty });
                    });
                  }}
                >
                  Apply
                </Button>
              </InputAdornment>
            }
            startAdornment={
              <InputAdornment position="start" sx={{ color: 'rgba(255, 255, 255, 1)', paddingLeft: '20px' }}>
                Custom All Price
              </InputAdornment>
            }
            sx={{
              width: matches ? '450px' : '100%',
              height: '48px',
              fontSize: '16px',
              bgcolor: 'rgba(32, 34, 41, 1)',
              border: '1px solid rgba(255, 255, 255, 0.20)',
              borderRadius: '34px',
              '& input': {
                textAlign: 'right',
              },
            }}
          />
        </Box>
      </Box>
      <Box
        sx={{
          mt: '20px',
          display: 'flex',
          justifyContent: 'space-between',
          gap: '30px',
          flexDirection: matches ? 'row' : 'column',
        }}
      >
        <Box
          sx={{
            width: '100%',
            minHeight: matches ? '630px' : '400px',
            borderRadius: '8px',
            border: '1px solid rgba(49, 52, 57, 1)',
            p: '0 24px',
            boxSizing: 'border-box',
            background: '#202229',
          }}
        >
          {bulkListingStore.bulkListEths.map((item) => {
            return (
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  width: '100%',
                  borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
                  p: '24px 0',
                  gap: matches ? '0' : '10px',
                  boxSizing: 'border-box',
                  '&:last-child': {
                    borderBottom: 'none',
                  },
                }}
              >
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    color: 'white',
                    cursor: 'pointer',
                    textDecorationLine: 'none',
                  }}
                >
                  <EthsLabelCard category={item.order.category} ethscription={item} />
                </Box>
                <Box sx={{ display: matches ? 'block' : 'none' }}>
                  <Typography
                    sx={{
                      color: 'rgba(255, 255, 255, 0.6)',
                      fontSize: '14px',
                    }}
                  >
                    {`Protocol ${new BigNumber(bulkListingStore.orderNonceData?.protocolData.protocolFeeBps || 0)
                      .div(100)
                      .toString()}%`}
                  </Typography>
                  <Typography
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                    }}
                  >
                    {item.protocol} <EthLogo />
                  </Typography>
                </Box>
                <Box sx={{ display: matches ? 'block' : 'none' }}>
                  <Typography
                    sx={{
                      color: 'rgba(255, 255, 255, 0.6)',
                      fontSize: '14px',
                    }}
                  >
                    {`Royalty ${new BigNumber(bulkListingStore.orderNonceData?.creatorData.creatorFeeBps || 0)
                      .div(100)
                      .toString()}%`}
                  </Typography>
                  <Typography
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                    }}
                  >
                    {item.royalty} <EthLogo />
                  </Typography>
                </Box>
                {/* <Box>
                  <Typography
                    sx={{
                      color: 'rgba(255, 255, 255, 0.6)',
                      fontSize: '14px',
                    }}
                  >
                    Floor
                  </Typography>
                  <Typography
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                    }}
                  >
                    {item.floorPrice} <EthLogo />
                  </Typography>
                </Box> */}
                <InputBase
                  value={
                    bulkListingStore.bulkListEths.find(
                      (ethItem) => ethItem.order.ethscriptionId === item.order.ethscriptionId,
                    )?.order?.price || ''
                  }
                  onChange={(e) => {
                    const order = { ...item.order, price: e.target.value };
                    const protocol = new BigNumber(bulkListingStore.orderNonceData?.protocolData.protocolFeeBps || 0)
                      .div(10000)
                      .multipliedBy(e.target.value || 0)
                      .toString();

                    const royalty = new BigNumber(bulkListingStore.orderNonceData?.creatorData.creatorFeeBps || 0)
                      .div(10000)
                      .multipliedBy(e.target.value || 0)
                      .toString();

                    BulkListingStore.updateBulkListEths({ ...item, order, protocol, royalty });
                  }}
                  startAdornment={
                    <InputAdornment position="start" sx={{ color: 'rgba(255, 255, 255, 0.1)', paddingLeft: '16px' }}>
                      Price
                    </InputAdornment>
                  }
                  endAdornment={
                    <InputAdornment position="end" sx={{ color: 'rgba(255, 255, 255, 0.1)', paddingRight: '16px' }}>
                      ETH
                    </InputAdornment>
                  }
                  sx={{
                    width: '220px',
                    height: '48px',
                    fontSize: '16px',
                    borderRadius: '54px',
                    color: '#fff',
                    border: '1px solid rgba(255, 255, 255, 0.10)',
                    bgcolor: 'rgba(255, 255, 255, 0.1)',
                    '& input': {
                      textAlign: 'right',
                    },
                  }}
                />
                <IconButton
                  sx={{
                    width: '32px',
                    height: '32px',
                    borderRadius: ' 4px',
                    background: 'rgba(255, 255, 255, 0.1)',
                  }}
                  onClick={() => {
                    BulkListingStore.removeEthscription(item);
                  }}
                >
                  <RemoveSVG />
                </IconButton>
              </Box>
            );
          })}
        </Box>
        <BulkSettlement />
      </Box>
    </Box>
  );
};

export default BulkList;
