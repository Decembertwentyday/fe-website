/**
 * ==============================================================
 * 文件：src/containers/Erc20sDeploy.tsx
 * 作用：部署新的 ERC-20 铭文代币（Creator 工具）
 *
 * 业务流程：
 *   1. 表单填写：name、symbol、total_supply、limit_per_mint、start_time 等
 *   2. 选择协议版本（protocol）
 *   3. react-hook-form 校验 → evmService.erc20sDeploy 发链上交易
 *   4. toastResult 展示成功/失败
 *
 * 为什么用 react-hook-form + Controller？
 *   MUI 组件不是原生 input，需要 Controller 桥接表单状态
 *   DateTimePicker 同理（@mui/x-date-pickers）
 *
 * parseUnits：
 *   用户输入的小数数量 → 链上 uint256（× 10^decimals）
 *
 * 依赖：useEthersSigner（wagmi → ethers Signer 转换，见 hooks 注释）
 * ==============================================================
 */

'use client';

import { Fragment, useEffect, useMemo, useState } from 'react';
import {
  Box,
  Button,
  FormControl,
  FormControlLabel,
  FormHelperText,
  Radio,
  RadioGroup,
  Typography,
} from '@mui/material';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import { useForm, SubmitHandler, Controller } from 'react-hook-form';
import EtchDialog from '@/components/EtchDialog';
import services, { evmService } from '@/services';
import { useEthersSigner } from '@/hooks/useEthersSigner';
import { useAccount, useChainId } from 'wagmi';
import dayjs from 'dayjs';
import { LoadingButton } from '@mui/lab';
import { toastResult } from './LaunchpadDialog.tsx/ResultViewHoc';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { parseUnits } from 'ethers/lib/utils';
import { GetErc20FactoryAddressData } from '@/services/ethscriptions/types';
import StyledOutlinedInput from '@/components/StyledOutlinedInput';
import { ZERO_ADDRESS } from '@/constants';
import { StyledTooltip } from '@/components/StyledComponents';

interface IFormInput {
  protocol: string;
  name: string;
  symbol: string;
  // decimals: number;
  total_supply: number;
  limit_per_mint: number;
  start_time: dayjs.Dayjs;
  wallet_limit: number;
  royalties: number;
  royalties_receiver: string;
  mint_interval: number;
}

const DECIMALS = 18;

const DeployERC20s = () => {
  const singer = useEthersSigner();
  const { address } = useAccount();
  const receiverPlaceholder = useMemo(() => address || ZERO_ADDRESS, [address]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const chainId = useChainId();
  const [addr, setAddr] = useState<GetErc20FactoryAddressData>({
    factoryAddress: '',
    registryAddress: '',
  });

  const [open, setOpen] = useState<boolean>(false);
  const {
    register,
    formState: { errors },
    handleSubmit,
    control,
  } = useForm<IFormInput>({
    defaultValues: { protocol: 'erc-20s', start_time: dayjs(new Date()), royalties_receiver: address || '' },
  });
  const onSubmit: SubmitHandler<IFormInput> = async (data) => {
    const {
      total_supply,
      name,
      symbol,
      limit_per_mint,
      wallet_limit,
      start_time,
      mint_interval,
      royalties,
      royalties_receiver,
    } = data;
    const p = {
      name,
      symbol,
      total_supply: parseUnits(total_supply.toString(), DECIMALS),
      limit_per_mint: parseUnits(limit_per_mint.toString(), DECIMALS),
      wallet_limit: parseUnits((wallet_limit || 0).toString(), DECIMALS),
      start_time: (start_time.valueOf() / 1000).toFixed(0),
      mint_interval,
      royalties_receiver,
      royalties: royalties * 100,
      controller: addr.registryAddress,
    };
    try {
      if (singer && addr.factoryAddress) {
        setIsLoading(true);
        const receipt = await evmService.erc20sDeploy.deploy({ singer, address: addr.factoryAddress, params: p });
        toastResult({ type: 'success', receipt, chainId });
        handleClose();
      }
    } catch (e) {
      console.log(e, 'error');
      toastResult({ type: 'fail', chainId });
    } finally {
      setIsLoading(false);
    }
  };
  async function getContractAddress() {
    const response = await services.ethscriptions.getErc20FactoryAddress();
    response.data && setAddr(response.data);
  }

  async function handleOpen() {
    setOpen(true);
  }

  async function handleClose() {
    setOpen(false);
  }
  useEffect(() => {
    getContractAddress();
  }, []);

  return (
    <Fragment>
      <LoadingButton
        variant="contained"
        disableElevation
        color="primary"
        sx={{
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
        Deploy
      </LoadingButton>
      <EtchDialog
        open={open}
        onClose={handleClose}
        title={<Typography sx={{ fontSize: '18px', fontWeight: 500 }}>ERC-20S Deploy</Typography>}
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
              disableElevation
              loading={isLoading}
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
              onClick={handleSubmit(onSubmit)}
            >
              Deploy
            </LoadingButton>
          </Box>
        }
      >
        <form onSubmit={handleSubmit(onSubmit)}>
          <Box
            sx={{
              pt: '24px',
              pb: '40px',
              '& .item': {
                pt: '20px',
                display: 'flex',
                alignItems: 'center',
                position: 'relative',
                width: '100%',
              },
              '& .label': {
                width: '135px',
                fontWeight: 500,
              },
              '& .helper': {
                position: 'absolute',
                bottom: '-22px',
                left: 0,
                color: '#D8346F',
                fontSize: '14px',
              },
            }}
          >
            <Box className="item">
              <Box className="label">Protocol</Box>
              <Controller
                name="protocol"
                control={control}
                render={({ field }) => {
                  return (
                    <FormControl>
                      <RadioGroup
                        {...field}
                        defaultValue={'erc-20s'}
                        sx={{ display: 'flex', alignItems: 'center', flexDirection: 'row' }}
                      >
                        {/* <FormControlLabel
                          sx={{ '& . MuiFormControlLabel-label': { fontSize: '14px' } }}
                          value="erc-20"
                          control={<Radio disabled={true} />}
                          label="Erc-20"
                        /> */}
                        <FormControlLabel
                          sx={{ ml: 0 }}
                          value="erc-20s"
                          control={<Radio sx={{ display: 'none' }} disabled={true} />}
                          label="erc-20s"
                        />
                      </RadioGroup>
                    </FormControl>
                  );
                }}
              />
            </Box>
            <Box className="item">
              <Box className="label" sx={{ display: 'flex', alignItems: 'center' }}>
                Name
              </Box>
              <Box sx={{ position: 'relative', flex: 1 }}>
                <StyledOutlinedInput
                  fullWidth
                  placeholder='Token name, like "Ethscriptions"'
                  {...register('name', { maxLength: 18, required: true })}
                />
                {errors.name && (
                  <FormHelperText className="helper">Please enter a maximum of 18 characters</FormHelperText>
                )}
              </Box>
            </Box>
            <Box className="item">
              <Box className="label" sx={{ display: 'flex', alignItems: 'center' }}>
                Symbol
              </Box>
              <Box sx={{ position: 'relative', flex: 1 }}>
                <StyledOutlinedInput
                  fullWidth
                  placeholder='Token symbol, like "eths"'
                  {...register('symbol', { maxLength: 18, required: true })}
                />
                {errors.name && (
                  <FormHelperText className="helper">Please enter a maximum of 18 characters</FormHelperText>
                )}
              </Box>
            </Box>
            <Box className="item">
              <Box className="label">Total Supply</Box>
              <Box sx={{ position: 'relative', flex: 1 }}>
                <StyledOutlinedInput
                  fullWidth
                  placeholder="21000000"
                  {...register('total_supply', { pattern: /^[1-9]\d*$/, required: true })}
                  type="number"
                />
                {errors.total_supply && (
                  <FormHelperText className="helper">Please enter a positive integer</FormHelperText>
                )}
              </Box>
            </Box>
            <Box className="item">
              <Box className="label">Limit Per Mint</Box>
              <Box sx={{ position: 'relative', flex: 1 }}>
                <StyledOutlinedInput
                  fullWidth
                  placeholder="1000"
                  {...register('limit_per_mint', { pattern: /^[1-9]\d*$/, required: true })}
                  type="number"
                />
                {errors.limit_per_mint && (
                  <FormHelperText className="helper">Please enter a positive integer</FormHelperText>
                )}
              </Box>
            </Box>
            <Box className="item">
              <Box className="label">Wallet Limit</Box>
              <Box sx={{ position: 'relative', flex: 1 }}>
                <StyledOutlinedInput
                  fullWidth
                  placeholder="1000"
                  {...register('wallet_limit', { pattern: /^[1-9]\d*$/ })}
                  type="number"
                />
                {errors.wallet_limit && (
                  <FormHelperText className="helper">Please enter a positive integer</FormHelperText>
                )}
              </Box>
            </Box>
            <Box className="item">
              <Box className="label">Royalty</Box>
              <Box sx={{ position: 'relative', flex: 1 }}>
                <StyledOutlinedInput
                  fullWidth
                  placeholder="0-5"
                  endAdornment={<>%</>}
                  {...register('royalties', { pattern: /^[0-5]$/, required: true })}
                  type="number"
                />
                {errors.royalties && (
                  <FormHelperText className="helper">Please enter a positive integer between 0 and 5</FormHelperText>
                )}
              </Box>
            </Box>
            <Box className="item">
              <Box className="label">Royalty Receiver</Box>
              <Box sx={{ position: 'relative', flex: 1 }}>
                <StyledOutlinedInput
                  fullWidth
                  placeholder={receiverPlaceholder}
                  {...register('royalties_receiver', { required: true })}
                />
                {errors.royalties_receiver && (
                  <FormHelperText className="helper">Please enter a valid address</FormHelperText>
                )}
              </Box>
            </Box>
            <Box className="item">
              <Box className="label" sx={{ display: 'flex', alignItems: 'center' }}>
                Mint Interval
                <StyledTooltip
                  title="Block interval between mints"
                  sx={{ fontSize: '14px', color: 'rgba(255,255,255,0.65)' }}
                >
                  <HelpOutlineIcon sx={{ fontSize: '20px', color: '#999', ml: '4px', cursor: 'pointer' }} />
                </StyledTooltip>
              </Box>
              <Box sx={{ position: 'relative', flex: 1 }}>
                <StyledOutlinedInput
                  fullWidth
                  placeholder="0"
                  {...register('mint_interval', { pattern: /^[0-9]\d*$/, required: true })}
                />
                {errors.mint_interval && (
                  <FormHelperText className="helper">Please enter a positive integer or 0 </FormHelperText>
                )}
              </Box>
            </Box>
            <Box className="item">
              <Box className="label">Start Time</Box>
              <Box sx={{ position: 'relative', flex: 1 }}>
                {/* .css-v3u78j-MuiInputBase-root-MuiOutlinedInput-root.MuiOutlinedInput-root:hover fieldset */}
                {/* .css-eedjmh-MuiInputBase-root-MuiOutlinedInput-root:hover .MuiOutlinedInput-notchedOutline */}
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                  <Controller
                    name="start_time"
                    control={control}
                    rules={{ required: true }}
                    render={({ field }) => (
                      <DateTimePicker
                        {...field}
                        sx={{
                          '&.MuiOutlinedInput-root': {
                            fieldset: {
                              borderColor: 'rgba(255,255,255,0.2)',
                            },
                            '&:hover fieldset': {
                              borderColor: '#E5FF65',
                              borderWidth: '1px',
                            },
                            '&:hover .MuiOutlinedInput-notchedOutline': {
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
                    )}
                  />
                </LocalizationProvider>
                {errors.start_time && <FormHelperText className="helper">Start time is required</FormHelperText>}
              </Box>
            </Box>
          </Box>
        </form>
      </EtchDialog>
    </Fragment>
  );
};

export default DeployERC20s;
