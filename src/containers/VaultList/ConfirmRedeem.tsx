'use client';

import { useEffect, useState } from 'react';
import { Box, Button, InputAdornment, OutlinedInput, Typography } from '@mui/material';
import { useSnapshot } from 'valtio';

import EtchDialog from '@/components/EtchDialog';
import { useEthscriptionBoxContext } from '@/containers/EthscriptionBox/EthscriptionBoxContext';
import services, { evmService } from '@/services';
import { useEthersSigner } from '@/hooks/useEthersSigner';
import { useAccount, useChainId } from 'wagmi';
import { ethers } from 'ethers';
import { LoadingButton } from '@mui/lab';
import WalletConnectButton from '@/components/WalletConnectButton';
import ResultView from '../ResultView';
import EthscriptionView from '../EthscriptionBox/EthscriptionView';
import { NumericFormat } from 'react-number-format';
import BigNumber from 'bignumber.js';
import { GetVaultBalanceData } from '@/services/vault/types';
import * as GlobalStore from '@/stores/GlobalStore';

const ConfirmRedeem = () => {
  const { ethscription, onChange } = useEthscriptionBoxContext();
  const [ethscriptionClone, setEthscriptionClone] = useState(ethscription);
  const [open, setOpen] = useState<boolean>(false);
  const globalStore = useSnapshot(GlobalStore.store);
  const [openResult, setOpenResult] = useState<boolean>(false);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  const [valueError, setValueError] = useState('');
  const [vaultBalanceData, setVaultBalanceData] = useState<GetVaultBalanceData>();

  const [redeemTitle, setRedeemTitle] = useState<string>('Redeem');
  const [isSumbit, setIsSubmit] = useState<boolean>(false);
  const singer = useEthersSigner();
  const { address } = useAccount();
  const chainId = useChainId();

  if (ethscriptionClone === null) return null;

  // ethscriptionClone.order.stakingLockRatio
  const redeemAmount = new BigNumber(ethscriptionClone.order.quantity).multipliedBy(
    new BigNumber(vaultBalanceData?.balances.stakingLockRatio || 0).div(10000),
  );

  async function handleOpen() {
    setOpen(true);
  }

  async function handleClose() {
    setEthscriptionClone(ethscription);
    setOpen(false);
  }

  async function handleRedeem() {
    if (!ethscriptionClone || !address || !singer) {
      return;
    }
    try {
      setIsSubmit(true);

      let orderHash = ethscriptionClone.order.orderId;

      if (orderHash.trim() == '') {
        setRedeemTitle('Signing');
        const orderSign = await evmService.etchMarketVault.signatureWithOrder(
          chainId,
          ethscriptionClone?.order.vaultAddress,
          address,
          ethscriptionClone?.order.ethscriptionId,
        );

        orderHash = orderSign.digestHex;

        await services.vault.postVaultRedeem({
          collection: ethscriptionClone.order.collectionName,
          ethscriptionId: ethscriptionClone.order.ethscriptionId,
          orderId: orderSign.orderId,
          vaultAddress: ethscriptionClone.order.vaultAddress,
          orderHash: orderSign.digestHex,
          signer: address,
          signature: orderSign.signature,
        });
      }
      setRedeemTitle('Withdraw');

      const orderInfo = await services.vault.getVaultWithdraw(orderHash);

      if (!orderInfo) {
        throw 'Get orderInfo failed';
      }

      const result = await evmService.etchMarketVault.withdrawEthscriptionSign({ singer, orderInfo });
      if (result.status == 1) {
        setIsSuccess(true);
      }
    } catch (error) {
      console.log(error);
      setIsSuccess(false);
    } finally {
      setOpen(false);
      setIsSubmit(false);
      setOpenResult(true);
    }
  }

  async function getVaultBalance() {
    if (address && ethscriptionClone?.order && open) {
      const response = await services.vault.getVaultBalance({
        address,
        collection: ethscriptionClone.order.collectionName,
      });

      if (response?.code !== 200) return false;

      setVaultBalanceData(response.data);
    }
  }

  useEffect(() => {
    getVaultBalance();
  }, [address, open]);

  useEffect(() => {
    if (ethscriptionClone.order.orderId.trim() == '') {
      if (BigNumber(redeemAmount).gt(vaultBalanceData?.balances.available || 0)) {
        setValueError('insufficient available balance');
      } else {
        setValueError('');
      }
    }
  }, [redeemAmount, vaultBalanceData]);

  return (
    <Box sx={{ pb: '16px' }}>
      <Button
        variant="outlined"
        sx={{
          margin: '0 auto',
          width: '100%',
          height: '36px',
          mt: '13px',
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
        Redeem
      </Button>

      <EtchDialog
        open={open}
        onClose={handleClose}
        title="Confirmation"
        footer={
          <Box sx={{ display: 'flex', alignItems: 'center', gap: '26px' }}>
            <Button
              onClick={() => {
                setOpen(false);
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
            <WalletConnectButton>
              <LoadingButton
                variant="contained"
                fullWidth
                loadingPosition="start"
                disableElevation
                loading={isSumbit}
                disabled={valueError != '' || !Boolean(vaultBalanceData?.balances.available)}
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
                onClick={handleRedeem}
              >
                {redeemTitle}
              </LoadingButton>
            </WalletConnectButton>
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
              value={redeemAmount.toString()}
              allowNegative={false}
              thousandSeparator
              disabled
              valueIsNumericString
              decimalScale={0}
              endAdornment={
                <InputAdornment position="end">{ethscriptionClone.order.collectionName.split(' ')[1]}</InputAdornment>
              }
              startAdornment={<InputAdornment position="start">Amount</InputAdornment>}
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
                  '&.Mui-disabled': {
                    fieldset: {
                      border: 'none',
                    },
                    '&:hover fieldset': {
                      border: 'none',
                    },
                  },
                },
              }}
            />
            <Typography color="red" fontSize="13px">
              {valueError}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: '8px', pt: '12px' }}>
              <Typography sx={{ fontWeight: 500 }}>Available balance</Typography>
              <Typography sx={{ color: '#E5FF65', fontWeight: 500 }}>
                {vaultBalanceData?.balances?.available ?? '--'}
              </Typography>
            </Box>
          </Box>
        </Box>
      </EtchDialog>

      <ResultView
        title="Confirmation"
        open={openResult}
        onClose={async () => {
          if (isSuccess) {
            await onChange('remove', 'redeem', ethscriptionClone);
          }
          setOpenResult(false);
        }}
        isSuccess={isSuccess}
      />
    </Box>
  );
};

export default ConfirmRedeem;
