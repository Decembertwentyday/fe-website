'use client';

import { Fragment, useState } from 'react';
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
import { useForm, SubmitHandler, Controller } from 'react-hook-form';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import EtchDialog from '@/components/EtchDialog';
import { evmService } from '@/services';
import { useEthersSigner } from '@/hooks/useEthersSigner';
import { useChainId } from 'wagmi';
import { LoadingButton } from '@mui/lab';
import { toastResult } from './LaunchpadDialog.tsx/ResultViewHoc';
import StyledOutlinedInput from '@/components/StyledOutlinedInput';
import { StyledTooltip } from '@/components/StyledComponents';

interface IFormInput {
  protocol: string;
  tick: string;
  total_supply: number;
  limit_per_mint: number;
}

const DeployERC20 = () => {
  const singer = useEthersSigner();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const chainId = useChainId();

  const [open, setOpen] = useState<boolean>(false);
  const {
    register,
    formState: { errors },
    handleSubmit,
    control,
  } = useForm<IFormInput>();
  const onSubmit: SubmitHandler<IFormInput> = async (data) => {
    let str =
      'data:,' +
      JSON.stringify({
        p: 'erc-20',
        op: 'deploy',
        tick: data.tick,
        max: data.total_supply,
        lim: data.limit_per_mint,
      });
    str = '0x' + Buffer.from(str).toString('hex');
    if (!singer) return;
    try {
      setIsLoading(true);
      const receipt = await evmService.etchMarket.deployErc20({ singer: singer!, data: str });
      toastResult({ type: 'success', receipt, chainId });
      handleClose();
    } catch (e) {
      toastResult({ type: 'fail', chainId });
    } finally {
      setIsLoading(false);
    }
  };

  async function handleOpen() {
    setOpen(true);
  }

  async function handleClose() {
    setOpen(false);
  }

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
        title={<Typography sx={{ fontSize: '18px', fontWeight: 500 }}>ERC-20 Deploy</Typography>}
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
            <Box
              sx={{
                pt: '20px',
                display: 'flex',
                alignItems: 'center',
                position: 'relative',
                width: '100%',
              }}
            >
              <Box className="label">Protocol</Box>
              <Controller
                name="protocol"
                control={control}
                render={({ field }) => {
                  return (
                    <FormControl>
                      <RadioGroup
                        {...field}
                        defaultValue={'erc-20'}
                        sx={{ display: 'flex', alignItems: 'center', flexDirection: 'row' }}
                      >
                        <FormControlLabel
                          value="erc-20"
                          sx={{ ml: 0 }}
                          control={<Radio sx={{ display: 'none' }} disabled={true} />}
                          label="erc-20"
                        />
                      </RadioGroup>
                    </FormControl>
                  );
                }}
              />
            </Box>
            <Box
              sx={{
                pt: '20px',
                display: 'flex',
                alignItems: 'center',
                position: 'relative',
                width: '100%',
              }}
            >
              <Box className="label" sx={{ display: 'flex', alignItems: 'center' }}>
                Tick
                <StyledTooltip title="case-insensitive" sx={{ fontSize: '14px', color: 'rgba(255,255,255,0.65)' }}>
                  <HelpOutlineIcon sx={{ fontSize: '20px', color: '#999', ml: '4px', cursor: 'pointer' }} />
                </StyledTooltip>
              </Box>
              <Box sx={{ position: 'relative', flex: 1 }}>
                <StyledOutlinedInput
                  fullWidth
                  placeholder="Identifier of the erc-20, like “eths”"
                  {...register('tick', { maxLength: 18, required: true })}
                />
                {errors.tick && (
                  <FormHelperText className="helper">Please enter a maximum of 18 characters</FormHelperText>
                )}
              </Box>
            </Box>
            <Box
              sx={{
                pt: '20px',
                display: 'flex',
                alignItems: 'center',
                position: 'relative',
                width: '100%',
              }}
            >
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
            <Box
              sx={{
                pt: '20px',
                display: 'flex',
                alignItems: 'center',
                position: 'relative',
                width: '100%',
              }}
            >
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
          </Box>
        </form>
      </EtchDialog>
    </Fragment>
  );
};

export default DeployERC20;
