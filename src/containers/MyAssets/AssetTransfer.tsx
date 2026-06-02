// ============================================================================
// 【AssetTransfer.tsx】同质化代币（ERC20类铭文/Facet）转移弹窗
// ----------------------------------------------------------------------------
// 作用：对用户的某种大额 ERC20 资产进行指定数量和收款地址的转让动作。
// 逻辑流程：
// 1. 利用 React Hook Form 和 Yup 对发送地址进行标准正则格式鉴权。
// 2. 检测用户的输入余额不能超过其拥有的数量。
// 3. 构建发送的 Payload，通过 evmService 送出 calldata。
// ============================================================================

'use client';

import { Fragment, useRef, useState } from 'react';
import { Box, Button, InputAdornment, OutlinedInput, Typography } from '@mui/material';
import LoadingButton from '@mui/lab/LoadingButton';
import { Controller, useForm } from 'react-hook-form';
import { NumericFormat } from 'react-number-format';
import { ErrorMessage } from '@hookform/error-message';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import toast from 'react-hot-toast';

import EtchDialog from '@/components/EtchDialog';
import { evmService } from '@/services';
import { useEthersSigner } from '@/hooks/useEthersSigner';
import { AssetItem } from '@/services/ethscriptions/types';
import BigNumber from 'bignumber.js';
import { ethers } from 'ethers';
import getTruncate from '@/utils/getTruncate';
import { FACET_CONFIG } from '@/constants/config';
import WarnSVG from '@/assets/icons/warn32.svg';
import { transferFacet_payload } from '@/services/evm/facet_payload';

interface IAssetTransfer {
  asset: AssetItem;
}

interface IFormValues {
  to: string;
  amount: string;
}

const AssetTransfer: React.FC<IAssetTransfer> = ({ asset }) => {
  const [open, setOpen] = useState(false);
  const singer = useEthersSigner();

  const _amount = ethers.utils.formatUnits(asset.amount, asset.decimals);

  const schema = yup
    .object()
    .shape({
      to: yup.string().required(),
      amount: yup
        .string()
        .required()
        .test('max', `Amount must be less than ${_amount}`, function (value) {
          return new BigNumber(value).lte(_amount);
        }),
    })
    .required();

  const { handleSubmit, control, formState, register, reset, watch, setError, clearErrors, trigger } =
    useForm<IFormValues>({
      defaultValues: {
        amount: '',
        to: '',
      },
      resolver: yupResolver(schema),
    });

  const onClose = () => {
    setOpen(false);
  };

  const handleTransfer = async (data: IFormValues) => {
    // const ax = {
    //   op: 'call',
    //   data: {
    //     to: '0x55ab0390a89fed8992e3affbf61d102490735e24',
    //     function: 'transfer',
    //     args: { to: '0xd1c4102B52F31563e9Ec1663cd4Bb32AF2dF429D', amount: '1000000000000000000' },
    //   },
    // };
    try {
      if (singer) {
        await evmService.etchMarket.transferEthscriptionFacet({
          singer,
          facetAddress: FACET_CONFIG.RECEIVE_ADDRESS,
          payload: transferFacet_payload({
            to: asset.contractAddress,
            args: {
              to: data.to,
              amount: ethers.utils.parseUnits(data.amount, asset.decimals).toString(),
            },
          }),
        });

        onClose();
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
    } finally {
      reset();
    }
  };

  return (
    <Fragment>
      <Button
        variant="contained"
        sx={{
          borderRadius: '46px',
          background: '#E5FF65',
          textTransform: 'capitalize',
        }}
        onClick={() => {
          setOpen(true);
        }}
      >
        Transfer
      </Button>

      <EtchDialog
        open={open}
        onClose={() => {
          onClose();
        }}
        title={
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <Typography>Transfer</Typography>
            <Typography sx={{ color: '#fff', fontSize: '14px', fontWeight: 500 }}>{asset.name}</Typography>
          </Box>
        }
        footer={
          <Box sx={{ display: 'flex', alignItems: 'center', gap: '26px' }}>
            <Button
              onClick={() => {
                onClose();
              }}
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
              fullWidth
              disableElevation
              color="primary"
              loading={formState.isSubmitting}
              disabled={formState.isSubmitting || !formState.isValid}
              onClick={handleSubmit(handleTransfer)}
              variant="contained"
              sx={{
                height: '40px',
                fontSize: '14px',
                fontWeight: 500,
                textTransform: 'capitalize',
                '&.Mui-disabled': {
                  background: '#e5ff6566',
                },
              }}
            >
              Transfer
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
              pt: '20px',
              display: 'flex',
              alignItems: 'center',
              flexDirection: 'column',
              position: 'relative',
            }}
          >
            <OutlinedInput
              {...register('to')}
              autoComplete="off"
              startAdornment={<InputAdornment position="start">To</InputAdornment>}
              sx={{
                width: '100%',
                maxWidth: '380px',
                height: '48px',
                bgcolor: 'rgba(32, 34, 41, 1)',
                mb: '16px',
                '& input': {
                  textAlign: 'right',
                  fontSize: '12px',
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
            <Controller
              name="amount"
              control={control}
              render={({ field }) => {
                const { onChange, ...fieldProps } = field;
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
                      onChange(data.value);
                      trigger('amount');
                    }}
                    startAdornment={<InputAdornment position="start">Amount</InputAdornment>}
                    endAdornment={<InputAdornment position="end">{asset.symbol}</InputAdornment>}
                    sx={{
                      width: '100%',
                      maxWidth: '380px',
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
              Balance
              <Box sx={{ fontSize: '16px', m: '0 10px', color: '#fff' }}>{getTruncate(_amount, 2)}</Box>
              <Box sx={{ fontSize: '16px', color: '#fff' }}>{asset.symbol}</Box>
            </Box>
          </Box>
        </Box>
      </EtchDialog>
    </Fragment>
  );
};

export default AssetTransfer;
