// ============================================================================
// 【ConfirmEditListing.tsx】确认编辑挂单弹窗
// ----------------------------------------------------------------------------
// 作用：对已经挂单出售的铭文进行价格修改。
// 逻辑流程：
// 1. 获取输入的新价格
// 2. 检查价格是否低于等于原来价格？若是降价，且有 OG Pass 等条件判定
// 3. 使用 signer 对订单进行签名
// 4. 将新签名的订单推送到后端保存（更新订单价格，无需上链，纯链下撮合机制）
// ============================================================================

'use client';

import { Fragment, useEffect, useState } from 'react';
import { Box, Button, Divider, InputAdornment, OutlinedInput, Typography } from '@mui/material';
import { NumericFormat } from 'react-number-format';
import BigNumber from 'bignumber.js';

import EtchDialog from '@/components/EtchDialog';
import FilterSelect from '@/components/FilterSelect';
import { useEthscriptionBoxContext } from '@/containers/EthscriptionBox/EthscriptionBoxContext';
import services, { evmService } from '@/services';
import { useEthersSigner } from '@/hooks/useEthersSigner';
import { useAccount, useChainId } from 'wagmi';
import { ethers } from 'ethers';
import dayjs from 'dayjs';
import { LoadingButton } from '@mui/lab';
import NoOGDialog from '@/components/NoOGDialog';
import { GetEthPriceData, GetOrderNonceData } from '@/services/marketpalce/types';
import getTruncate from '@/utils/getTruncate';
import EthscriptionView from '../EthscriptionBox/EthscriptionView';
import { useImmer } from 'use-immer';
import EthscriptionLabel from '@/components/EthscriptionLabel';

const ComfirmEditListing = () => {
  const { ethscription, onChange } = useEthscriptionBoxContext();
  const [ethscriptionClone, setEthscriptionClone] = useState(ethscription);
  const singer = useEthersSigner();
  const { address } = useAccount();
  const [isSumbit, setIsSubmit] = useState<boolean>(false);
  const chainId = useChainId();
  const [open, setOpen] = useState<boolean>(false);
  const [openSubmit, setOpenSubmit] = useState<boolean>(false);
  const [isOgPass, setIsOgPass] = useState<boolean>(false);
  const [orderNonceData, setOrderNonceData] = useState<GetOrderNonceData>();
  const [ethPriceData, setEthPriceData] = useState<GetEthPriceData>();
  const [valueError, setValueError] = useState('');

  const [totalRevenue, setTotalRevenue] = useImmer({
    coin: '--',
    price: '--',
    unitPrice: '--',
  });

  const [value, setValue] = useState('');
  const [expiration, setExpiration] = useState(dayjs.duration({ months: 1 }).valueOf().toString());

  if (!ethscriptionClone) {
    return;
  }

  async function getOrderNonce() {
    if (address && ethscriptionClone?.order && open) {
      const response = await services.marketplace.getOrderNonce({
        address,
        category: ethscriptionClone.order.category,
        collection: ethscriptionClone.order.collectionName,
      });

      if (response?.code !== 200) return false;

      setOrderNonceData(response.data);
    }

    if (open) {
      const response = await services.marketplace.getEthPrice();

      if (response?.code !== 200) return false;

      setEthPriceData(response.data);
    }
  }

  useEffect(() => {
    getOrderNonce();
  }, [address, open]);

  let floorPrice = orderNonceData?.unitPrice ?? '--';

  if (ethscriptionClone.order.category == 'token') {
    floorPrice = orderNonceData?.unitPrice
      ? BigNumber(orderNonceData?.unitPrice || 0)
          .multipliedBy(ethscriptionClone?.order.quantity)
          .toString()
      : '--';
  }

  const serviceFee = BigNumber(orderNonceData?.protocolData.protocolFeeBps || 0).div(100);
  const creatorRoyalty = BigNumber(orderNonceData?.creatorData.creatorFeeBps || 0).div(100);

  if (ethscriptionClone === null) return null;

  const _collectionName =
    ethscriptionClone?.order.category == 'domain'
      ? ethscriptionClone?.order.content.replace('data:,', '')
      : ethscriptionClone?.order.collectionName;

  async function handleListing() {
    try {
      setIsSubmit(true);

      if (singer && ethscriptionClone?.order && orderNonceData) {
        const result = await evmService.etchMarket.editSignEthscriptionOrder({
          singer,
          ethscription: ethscriptionClone,
          sellPrice: ethers.utils.parseUnits(value, ethscriptionClone.payment.decimal).toString(),
          quantity: ethscriptionClone.order.quantity,
          chainId,
          expiration,
          orderNonceData,
        });

        if (result) {
          ethscriptionClone.order.isListing = true;
          ethscriptionClone.order.price = value;
          await onChange('update', 'edit-listing', ethscriptionClone);
          setOpen(false);
        } else {
        }
      }
    } catch (error) {
    } finally {
      setIsSubmit(false);
    }
  }

  async function handleOpen() {
    setOpen(true);
  }

  async function handleClose() {
    setEthscriptionClone(ethscription);
    setOpen(false);
  }

  useEffect(() => {
    if (open) {
      let totalRevenue = '';
      let totalRevenuePrice = '';
      let totalRevenueUnitPrice = '';

      if (BigNumber(value || 0).gt(0) && ethscriptionClone?.order) {
        totalRevenue = BigNumber(value)
          .minus(BigNumber(value).multipliedBy(serviceFee.div(100)))
          .minus(BigNumber(value).multipliedBy(creatorRoyalty.div(100)))
          .toString();
        totalRevenuePrice = BigNumber(ethPriceData?.price || 0)
          .multipliedBy(totalRevenue)
          .toString();

        totalRevenueUnitPrice = BigNumber(totalRevenuePrice).div(ethscriptionClone?.order.quantity).toString();
      }

      setTotalRevenue({
        coin: totalRevenue,
        price: totalRevenuePrice,
        unitPrice: totalRevenueUnitPrice,
      });

      /* ethscriptionClone.order.unitPriceUsd = totalRevenueUnitPrice;

      setEthscriptionClone(ethscriptionClone); */

      setEthscriptionClone({
        ...ethscriptionClone,
        order: {
          ...ethscriptionClone.order,
          unitPriceUsd: totalRevenueUnitPrice,
        },
      });

      if (BigNumber(value).gt(ethscriptionClone.order.price)) {
        setValueError('New price must be lower than the current price.');
      } else {
        setValueError('');
      }
    }
  }, [value, open]);

  return (
    <Fragment>
      <LoadingButton
        variant="outlined"
        fullWidth
        disableElevation
        loading={openSubmit}
        color="primary"
        sx={{
          margin: '0 auto',
          height: '36px',
          borderRadius: '46px',
          border: '1px solid #D5E970',
          textTransform: 'none',
          '&:hover': {
            color: '#000',
            bgcolor: 'rgba(229, 255, 101, 1)',
          },
        }}
        onClick={handleOpen}
      >
        Edit
      </LoadingButton>

      <EtchDialog
        open={open}
        onClose={handleClose}
        title={
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Typography sx={{ mr: '5px' }}>Edit</Typography>
            {ethscriptionClone && (
              <EthscriptionLabel
                domainDot={false}
                collectionName={_collectionName}
                category={ethscriptionClone.order.category}
                icon={ethscriptionClone.order.content}
              />
            )}
            <Typography sx={{ ml: '5px' }}>for sale</Typography>
          </Box>
        }
        footer={
          <Box sx={{ display: 'flex', alignItems: 'center', gap: '26px' }}>
            <Button
              onClick={handleClose}
              variant="outlined"
              sx={{
                height: '40px',
                fontSize: '14px',
                fontWeight: 500,
                textTransform: 'capitalize',
                borderColor: '#fff',
                color: '#fff',
                '&:hover': {
                  bgcolor: 'rgb(80 81 83 / 50%)',
                  borderColor: '#fff',
                },
              }}
            >
              Cancel
            </Button>
            <LoadingButton
              variant="contained"
              fullWidth
              loadingPosition="start"
              disableElevation
              loading={isSumbit}
              disabled={!Boolean(value) || !(valueError == '')}
              color="primary"
              sx={{
                height: '40px',
                fontSize: '14px',
                fontWeight: 500,
                textTransform: 'capitalize',
                '&.Mui-disabled': {
                  background: '#e5ff6566',
                },
              }}
              onClick={handleListing}
            >
              Confirm
            </LoadingButton>
          </Box>
        }
      >
        <Box
          sx={{
            p: '40px 0',
          }}
        >
          <Box
            sx={{
              // width: 'max-content',
              minWidth: '160px',
              maxWidth: '200px',
              margin: '0 auto',
              background: 'rgba(32, 34, 41, 1)',
              borderRadius: '8px',
            }}
          >
            <EthscriptionView ethscription={ethscriptionClone} />

            <Box
              sx={{
                width: '100%',
                height: '54px',
                background: 'rgba(255, 255, 255, 0.05)',
                borderRadius: '0 0 8px 8px',
              }}
            >
              <Typography
                sx={{ lineHeight: '54px', textAlign: 'center', textDecoration: 'underline' }}
              >{`#${ethscriptionClone.order.ethscriptionNumber}`}</Typography>
            </Box>
          </Box>
          <Box
            sx={{
              pt: '20px',
              display: 'flex',
              alignItems: 'center',
              flexDirection: 'column',
              position: 'relative',
              width: 'fit-content',
              margin: '0 auto',
            }}
          >
            <NumericFormat
              customInput={OutlinedInput}
              // value={value}
              placeholder={ethscriptionClone.order.price ?? 0}
              defaultValue={ethscriptionClone.order.price ?? 0}
              allowNegative={false}
              thousandSeparator
              valueIsNumericString
              min={0}
              onValueChange={(values) => {
                setValue(values.value);
              }}
              decimalScale={6}
              endAdornment={<InputAdornment position="end">ETH</InputAdornment>}
              startAdornment={<InputAdornment position="start">Price</InputAdornment>}
              sx={{
                width: '355px',
                height: '48px',
                bgcolor: 'rgba(32, 34, 41, 1)',
                '& input': {
                  textAlign: 'right',
                },
                '&.MuiOutlinedInput-root': {
                  fieldset: {
                    borderColor: 'transparent',
                  },
                  '&:hover fieldset': {
                    borderColor: '#E5FF65',
                    borderWidth: '1px',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: '#E5FF65',
                    borderWidth: '1px',
                  },
                },
              }}
            />
            <Typography color="red" fontSize="13px">
              {valueError}
            </Typography>
            <Box
              sx={{
                fontSize: '14px',
                mt: '15px',
                display: 'flex',
                alignItems: 'center',
                color: 'rgba(255, 255, 255, 0.45)',
              }}
            >
              Floor price
              <Box sx={{ fontSize: '16px', m: '0 10px', color: '#fff' }}>{floorPrice}</Box>
              <Box sx={{ fontSize: '16px', color: '#fff' }}>ETH</Box>
            </Box>
          </Box>
          <Box sx={{ mt: '42px' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', height: '36px' }}>
              <Typography sx={{ fontSize: '14px' }}>Expiration</Typography>
              <FilterSelect
                selectList={[
                  {
                    label: '1 Month',
                    value: dayjs.duration({ months: 1 }).valueOf().toString(),
                  },
                  {
                    label: '3 Month',
                    value: dayjs.duration({ months: 3 }).valueOf().toString(),
                  },
                  {
                    label: '6 Month',
                    value: dayjs.duration({ months: 6 }).valueOf().toString(),
                  },
                  {
                    label: '12 Month',
                    value: dayjs.duration({ months: 12 }).valueOf().toString(),
                  },
                ]}
                onSelect={(item) => {
                  setExpiration(item.value);
                }}
              />
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', height: '36px' }}>
              <Typography sx={{ fontSize: '14px' }}>Service Fee</Typography>
              <Typography sx={{ fontSize: '14px' }}>{`${serviceFee}%`}</Typography>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', height: '36px' }}>
              <Typography sx={{ fontSize: '14px' }}>Creator Royalty</Typography>
              <Typography sx={{ fontSize: '14px' }}>{`${creatorRoyalty.toString()}%`}</Typography>
            </Box>
            <Divider sx={{ m: '15px 0' }} />
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                height: '36px',
                position: 'relative',
              }}
            >
              <Typography sx={{ fontSize: '14px' }}>Total Revenue</Typography>
              <Box sx={{ fontSize: '14px', color: '#E5FF65', display: 'flex', alignItems: 'center' }}>
                {totalRevenue.coin}
                <Typography sx={{ ml: '3px' }}>{ethscriptionClone.payment.name}</Typography>
              </Box>
              {value && (
                <Typography
                  sx={{
                    position: 'absolute',
                    right: '0',
                    bottom: '-15px',
                    fontSize: '12px',
                    color: 'rgba(255, 255, 255, 0.45)',
                  }}
                >
                  {`≈$${getTruncate(totalRevenue.price, 2)}`}
                </Typography>
              )}
            </Box>
          </Box>
        </Box>
      </EtchDialog>
      <NoOGDialog
        open={isOgPass}
        onClose={() => {
          setIsOgPass(false);
        }}
      />
    </Fragment>
  );
};

export default ComfirmEditListing;
