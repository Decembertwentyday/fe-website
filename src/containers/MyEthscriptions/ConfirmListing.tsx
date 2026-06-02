// ============================================================================
// 【ConfirmListing.tsx】确认挂单（List for Sale）弹窗组件
// ----------------------------------------------------------------------------
// 作用：将指定的铭文挂到市场上出售。
// 逻辑流程：
// 1. 输入出售价格（ETH）。
// 2. 对于特殊集合或是否持有 OG Pass 有相关限制。
// 3. 构建订单数据（包含 tokenId, collectionName, 卖家签名的价格等信息）。
// 4. 调用服务端市场接口提交签名订单，订单匹配为链下撮合机制。
// ============================================================================

'use client';

import { Fragment, useEffect, useState } from 'react';
import { Box, Button, Divider, InputAdornment, OutlinedInput, Typography } from '@mui/material';
import { NumericFormat } from 'react-number-format';
import BigNumber from 'bignumber.js';
import { Controller, useForm } from 'react-hook-form';

import toast from 'react-hot-toast';
import { ErrorMessage } from '@hookform/error-message';

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
import EthscriptionLabel from '@/components/EthscriptionLabel';

import WarnSVG from '@/assets/icons/warn32.svg';

interface IComfirmListing {
  disabled: boolean;
}

interface IFormValues {
  amount: string;
}

const ComfirmListing = ({ disabled }: IComfirmListing) => {
  const { ethscription, onChange } = useEthscriptionBoxContext();
  const [ethscriptionClone, setEthscriptionClone] = useState(ethscription);
  const singer = useEthersSigner();
  const { address } = useAccount();
  const chainId = useChainId();
  const [open, setOpen] = useState<boolean>(false);
  const [isOgPass, setIsOgPass] = useState<boolean>(false);
  const [orderNonceData, setOrderNonceData] = useState<GetOrderNonceData>();
  const [ethPriceData, setEthPriceData] = useState<GetEthPriceData>();

  const [value, setValue] = useState('');
  const [expiration, setExpiration] = useState(dayjs.duration({ months: 1 }).valueOf().toString());
  const [listTitle, setListTitle] = useState<string>('Listing');

  const { handleSubmit, control, formState, reset, watch, setError, clearErrors, trigger } = useForm<IFormValues>({
    defaultValues: {
      amount: '',
    },
  });

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

  if (ethscriptionClone === null) return null;

  const formAmount = watch('amount');

  let floorPrice = orderNonceData?.unitPrice ? getTruncate(orderNonceData?.unitPrice, 6) : '--';

  if (ethscriptionClone.order.category == 'token') {
    floorPrice = orderNonceData?.unitPrice
      ? getTruncate(
          BigNumber(orderNonceData?.unitPrice || 0)
            .multipliedBy(ethscriptionClone?.order.quantity)
            .toString(),
          6,
        )
      : '--';
  }

  const minAmount = BigNumber(floorPrice).multipliedBy(0.5).toString();

  useEffect(() => {
    trigger('amount');
  }, [formAmount]);

  const serviceFee = BigNumber(orderNonceData?.protocolData.protocolFeeBps || 0).div(100);
  const creatorRoyalty = BigNumber(orderNonceData?.creatorData.creatorFeeBps || 0).div(100);

  // const creatorRoyalty = BigNumber(orderNonceData?.creatorData.creatorFeeBps || 0).div(100);

  let totalRevenue = BigNumber(formAmount || 0)
    .minus(BigNumber(formAmount || 0).multipliedBy(serviceFee.div(100)))
    .toString();
  // .minus(BigNumber(formAmount || 0).multipliedBy(creatorRoyalty.div(100)))

  let totalRevenuePrice = BigNumber(ethPriceData?.price || 0)
    .multipliedBy(totalRevenue)
    .toString();
  let totalRevenueUnitPrice = BigNumber(totalRevenuePrice).div(ethscriptionClone?.order.quantity).toString();

  const _collectionName =
    ethscriptionClone?.order.category == 'domain'
      ? ethscriptionClone?.order.content.replace('data:,', '')
      : ethscriptionClone?.order.collectionName;

  const handleListing = async (data: IFormValues) => {
    try {
      if (singer && ethscriptionClone?.order && orderNonceData) {
        if (ethscriptionClone?.order.isDeposit) {
          setListTitle('Signing');
        } else {
          setListTitle('Depositing');

          await evmService.etchMarket.transferEthscription({
            singer,
            to: orderNonceData.protocolData.protocolAddress,
            ethscription: ethscriptionClone,
          });

          ethscriptionClone.order.isDeposit = true;
          ethscriptionClone.order.owner = orderNonceData.protocolData.protocolAddress;
          ethscriptionClone.order.unitPriceUsd = totalRevenueUnitPrice;

          setListTitle('Signing');
        }

        const result = await evmService.etchMarket.signEthscriptionOrder({
          singer,
          ethscription: ethscriptionClone,
          sellPrice: ethers.utils.parseUnits(data.amount, ethscriptionClone.payment.decimal).toString(),
          quantity: ethscriptionClone.order.quantity,
          chainId,
          expiration,
          orderNonceData,
        });

        if (result) {
          ethscriptionClone.order.isListing = true;
          ethscriptionClone.order.nonce = orderNonceData.nonce;
          ethscriptionClone.order.price = value;
          await onChange('update', 'listing', ethscriptionClone);
          setOpen(false);
        }
      }
    } catch (error) {
      const err = error as unknown as Error & { data: { code: number; message: string } };
      toast.custom(
        <Box
          sx={{
            width: '380px',
            padding: '16px',
            border: '1px solid #2F343E',
            borderRadius: '8px',
            background: '#202229',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', mb: '8px' }}>
            <WarnSVG style={{ marginRight: '12px' }} />
            <Typography sx={{ color: '#FFF' }}>Transaction Failed</Typography>
          </Box>
          {err?.data?.message && <Typography sx={{ wordBreak: 'break-all' }}>{err.data.message}</Typography>}
          {err?.message && <Typography sx={{ wordBreak: 'break-all' }}>{err.message}</Typography>}
        </Box>,
      );
    }
  };

  async function handleOpen() {
    setOpen(true);
  }

  async function handleClose() {
    setEthscriptionClone(ethscription);
    setOpen(false);
  }

  useEffect(() => {
    setEthscriptionClone({
      ...ethscriptionClone,
      order: {
        ...ethscriptionClone.order,
        unitPriceUsd: totalRevenueUnitPrice,
      },
    });
  }, [totalRevenueUnitPrice]);

  useEffect(() => {
    reset();
  }, [open]);

  // useEffect(() => {
  //   if (open) {
  //     let totalRevenue = '';
  //     let totalRevenuePrice = '';
  //     let totalRevenueUnitPrice = '';

  //     if (BigNumber(value || 0).gt(0) && ethscriptionClone?.order) {
  //       totalRevenue = BigNumber(value)
  //         .minus(BigNumber(value).multipliedBy(serviceFee.div(100)))
  //         .minus(BigNumber(value).multipliedBy(creatorRoyalty.div(100)))
  //         .toString();
  //       totalRevenuePrice = BigNumber(ethPriceData?.price || 0)
  //         .multipliedBy(totalRevenue)
  //         .toString();

  //       totalRevenueUnitPrice = BigNumber(totalRevenuePrice).div(ethscriptionClone?.order.quantity).toString();
  //     }

  //     setTotalRevenue({
  //       coin: totalRevenue,
  //       price: totalRevenuePrice,
  //       unitPrice: totalRevenueUnitPrice,
  //     });

  //     // console.log(totalRevenueUnitPrice, ethscriptionClone.order);

  //     // ethscriptionClone.order.unitPriceUsd = totalRevenueUnitPrice;

  //     setEthscriptionClone({
  //       ...ethscriptionClone,
  //       order: {
  //         ...ethscriptionClone.order,
  //         unitPriceUsd: totalRevenueUnitPrice,
  //       },
  //     });
  //   }
  // }, [value, open]);

  return (
    <Fragment>
      <LoadingButton
        variant="outlined"
        fullWidth
        disableElevation
        color="primary"
        disabled={disabled}
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
        List
      </LoadingButton>

      <EtchDialog
        open={open}
        onClose={handleClose}
        title={
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Typography sx={{ mr: '5px' }}>List</Typography>
            <EthscriptionLabel
              domainDot={false}
              collectionName={_collectionName}
              category={ethscriptionClone.order.category}
              icon={ethscriptionClone.order.content}
            />
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
              color="primary"
              loading={formState.isSubmitting}
              disabled={formState.isSubmitting || !formState.isValid}
              sx={{
                height: '40px',
                fontSize: '14px',
                fontWeight: 500,
                textTransform: 'capitalize',
                '&.Mui-disabled': {
                  background: '#e5ff6566',
                },
              }}
              onClick={handleSubmit(handleListing)}
            >
              {listTitle}
            </LoadingButton>
          </Box>
        }
      >
        <form>
          <Box
            sx={{
              p: '40px 0',
            }}
          >
            <Box
              sx={{
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
              <Controller
                name="amount"
                control={control}
                rules={{
                  required: true,
                  min: {
                    value: minAmount,
                    message: 'Attention: Your set price is 50% below the actual value',
                  },
                }}
                render={({ field }) => {
                  const { onChange: onChangeField, ...fieldProps } = field;
                  return (
                    <NumericFormat
                      {...fieldProps}
                      autoComplete="off"
                      customInput={OutlinedInput}
                      allowNegative={false}
                      thousandSeparator
                      valueIsNumericString
                      decimalScale={6}
                      onValueChange={(data) => {
                        console.log(data);
                        onChangeField(data.value);
                      }}
                      endAdornment={<InputAdornment position="end">ETH</InputAdornment>}
                      startAdornment={<InputAdornment position="start">Price</InputAdornment>}
                      sx={{
                        maxWidth: '355px',
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
                  );
                }}
              />
              <ErrorMessage
                errors={formState.errors}
                name="amount"
                render={({ message }) => {
                  return <Typography sx={{ fontSize: '12px', color: 'red' }}>{message}</Typography>;
                }}
              />

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
                  {totalRevenue}
                  <Typography sx={{ ml: '3px' }}>{ethscriptionClone.payment.name}</Typography>
                </Box>
                {!BigNumber(totalRevenuePrice).isNaN() && (
                  <Typography
                    sx={{
                      position: 'absolute',
                      right: '0',
                      bottom: '-15px',
                      fontSize: '12px',
                      color: 'rgba(255, 255, 255, 0.45)',
                    }}
                  >
                    {`≈$${getTruncate(totalRevenuePrice, 2)}`}
                  </Typography>
                )}
              </Box>
            </Box>
          </Box>
        </form>
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

export default ComfirmListing;
