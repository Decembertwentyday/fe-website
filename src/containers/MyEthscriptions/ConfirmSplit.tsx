// ============================================================================
// 【ConfirmSplit.tsx】拆分（Split）铭文弹窗组件（适用于 ERC20 类大额铭文）
// ----------------------------------------------------------------------------
// 作用：将账户中存入 Vault 且未被拆分为一张张铭文的大额以太铭文代币余额，按数量拆分成多张铭文，便于挂单或转移。
// 逻辑流程：
// 1. 输入想要拆分的数量。
// 2. 调用合约方法（如 withdraw 或相关 Facet 接口机制）生成对应数量的新铭文卡片。
// ============================================================================

'use client';

import { Fragment, useEffect, useState } from 'react';
import Image from 'next/image';
import { Box, Button, InputAdornment, OutlinedInput, Typography } from '@mui/material';
import { useSnapshot } from 'valtio';

import EtchDialog from '@/components/EtchDialog';
import services, { evmService } from '@/services';
import { useEthersSigner } from '@/hooks/useEthersSigner';
import { useAccount } from 'wagmi';
import { LoadingButton } from '@mui/lab';
import WalletConnectButton from '@/components/WalletConnectButton';
import { NumericFormat } from 'react-number-format';
import BigNumber from 'bignumber.js';
import { GetVaultBalanceData } from '@/services/vault/types';
import SPLIT_PNG from '@/assets/images/split.png';
import EthscriptionLabel from '@/components/EthscriptionLabel';
import { GetOrderNonceData } from '@/services/marketpalce/types';
import getTruncate from '@/utils/getTruncate';
import * as GlobalStore from '@/stores/GlobalStore';

interface IConfirmSplit {
  collection: string;
  onChange: () => void;
  disabled: boolean;
}

const ConfirmSplit: React.FC<IConfirmSplit> = ({ collection, onChange, disabled }) => {
  const [open, setOpen] = useState<boolean>(false);
  const globalStore = useSnapshot(GlobalStore.store);
  const [valueError, setValueError] = useState('');
  const [value, setValue] = useState('');
  const [vaultBalanceData, setVaultBalanceData] = useState<GetVaultBalanceData>();
  const [orderNonceData, setOrderNonceData] = useState<GetOrderNonceData>();

  const [isSumbit, setIsSubmit] = useState<boolean>(false);
  const singer = useEthersSigner();
  const { address } = useAccount();

  async function handleOpen() {
    setOpen(true);
  }

  async function handleClose() {
    setOpen(false);
  }

  async function handleSplit() {
    try {
      setIsSubmit(true);
      const nonce = await singer?.getTransactionCount();

      if (!nonce || !address) {
        return;
      }

      const response = await services.vault.getVaultEthscription({
        address: address as string,
        collection,
        amount: value,
        nonce: nonce,
      });

      if (response?.code == 200) {
        await evmService.etchMarket.inscribeEthscription({ singer: singer!, data: response.data.data });
        await onChange();
      }
    } catch (error) {
    } finally {
      setOpen(false);
      setIsSubmit(false);
    }
  }

  async function getOrderNonce() {
    if (address && collection && open) {
      const response = await services.marketplace.getOrderNonce({
        address,
        category: 'token',
        collection,
      });

      if (response?.code !== 200) return false;

      setOrderNonceData(response.data);
    }
  }

  async function getVaultBalance() {
    if (address && collection && open) {
      const response = await services.vault.getVaultBalance({
        address,
        collection,
      });

      if (response?.code !== 200) return false;
      setVaultBalanceData(response.data);
    }
  }

  useEffect(() => {
    if (collection) {
      getVaultBalance();
      getOrderNonce();
    }
  }, [address, collection, open]);

  const valueCoin = BigNumber(value).multipliedBy(orderNonceData?.unitPrice || 0);

  useEffect(() => {
    if (BigNumber(value).gt(vaultBalanceData?.balances?.available || 0)) {
      setValueError('insufficient available balance');
    } else if (valueCoin.gt(3) || valueCoin.lt(0.001)) {
      setValueError(`${getTruncate(valueCoin.toString(), 6)} between 0.001 ETH and 3 ETH`);
    } else {
      setValueError('');
    }
  }, [value, orderNonceData]);

  return (
    <Fragment>
      <Button
        variant="outlined"
        disabled={true || disabled}
        sx={{
          width: '90px',
          height: '36px',
          borderRadius: '30px',
          fontFamily: 'HarmonyOS Sans',
          background: '#E5FF65',
          fontWeight: 500,
          fontSize: '16px',
          boxSizing: 'border-box',
          color: '#171A1F',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          transition: 'background 0.2s ease-in-out',
          textTransform: 'capitalize',
          '&.Mui-disabled': {
            color: '#171A1F',
            bgcolor: 'rgba(229, 255, 101, 0.6)',
          },
          '&:hover': {
            color: '#000',
            bgcolor: 'rgba(229, 255, 101, 0.8)',
          },
        }}
        onClick={handleOpen}
      >
        + Split
      </Button>

      <EtchDialog
        open={open}
        onClose={handleClose}
        title={
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Typography sx={{ mr: '5px' }}>Split</Typography>
            <EthscriptionLabel collectionName={collection} category="token" icon="" />
          </Box>
        }
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
                disableElevation
                loading={isSumbit}
                disabled={(address && !Boolean(value)) || !(valueError == '')}
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
                onClick={handleSplit}
              >
                Split
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
            }}
          >
            <Image
              src={SPLIT_PNG}
              alt="split flag"
              style={{
                width: '100%',
                height: '100%',
              }}
            />
          </Box>
          <Box
            sx={{
              pt: '40px',
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
              allowNegative={false}
              thousandSeparator
              valueIsNumericString
              decimalScale={0}
              min={1}
              max={vaultBalanceData?.balances?.available ?? 0}
              onValueChange={(values) => {
                setValue(values.value);
              }}
              endAdornment={<InputAdornment position="end">{collection.split(' ')[1]}</InputAdornment>}
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
                },
              }}
            />

            <Typography sx={{ width: '355px', textAlign: 'right', fontSize: '14px' }}>{`≈ ${
              value ? getTruncate(valueCoin.toString(), 6) : '--'
            } ETH`}</Typography>

            <Typography color="red" fontSize="13px">
              {valueError}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: '8px', p: '12px 0' }}>
              <Typography sx={{ fontWeight: 500 }}>Available balance</Typography>
              <Typography sx={{ color: '#E5FF65', fontWeight: 500 }}>
                {vaultBalanceData?.balances?.available ?? '--'}
              </Typography>
            </Box>
            <Typography sx={{ fontSize: '12px', fontWeight: 500 }}>
              Note: the total value should be between 0.001 ETH and 3 ETH
            </Typography>
          </Box>
        </Box>
      </EtchDialog>
    </Fragment>
  );
};

export default ConfirmSplit;
