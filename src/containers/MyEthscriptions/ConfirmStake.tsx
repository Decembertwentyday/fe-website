// ============================================================================
// 【ConfirmStake.tsx】确认质押（Stake）挂单操作弹窗
// ----------------------------------------------------------------------------
// 作用：将符合质押条件的铭文（如特定的 ERC20 或 NFT），质押入特定合约以获取收益/积分。
// 逻辑流程：
// 1. 根据当前集合（collection）信息，判断可质押的合约池及收益。
// 2. 调用合约质押方法将该铭文的所有权转移给质押池合约。
// ============================================================================

'use client';

import { useState } from 'react';
import { Box, Button, Divider, Typography } from '@mui/material';
import { useSnapshot } from 'valtio';

import EtchDialog from '@/components/EtchDialog';
import { useEthscriptionBoxContext } from '@/containers/EthscriptionBox/EthscriptionBoxContext';
import { evmService } from '@/services';
import { useEthersSigner } from '@/hooks/useEthersSigner';
import { LoadingButton } from '@mui/lab';
import WalletConnectButton from '@/components/WalletConnectButton';
import EthscriptionView from '../EthscriptionBox/EthscriptionView';
import BigNumber from 'bignumber.js';
import { MenuItem } from './MoreMenuButton';
import * as GlobalStore from '@/stores/GlobalStore';

interface IConfirmStake {
  open: boolean;
  onClose: (flag: MenuItem['value']) => void;
}

const ConfirmStake: React.FC<IConfirmStake> = ({ open, onClose }) => {
  const { ethscription, onChange } = useEthscriptionBoxContext();
  const [ethscriptionClone, setEthscriptionClone] = useState(ethscription);
  const globalStore = useSnapshot(GlobalStore.store);

  const [isSumbit, setIsSubmit] = useState<boolean>(false);
  const singer = useEthersSigner();

  if (ethscriptionClone === null) return null;

  const stakingAmount = new BigNumber(ethscriptionClone.order.quantity).multipliedBy(
    new BigNumber(ethscriptionClone.payment.stakingLockRatio || 0).div(10000),
  );

  const availableBalance = new BigNumber(ethscriptionClone.order.quantity).minus(stakingAmount);

  async function handleClose() {
    setEthscriptionClone(ethscription);
    onClose('stake');
  }

  async function handleStake() {
    try {
      setIsSubmit(true);
      await evmService.etchMarketVault.stakeEthscription({
        singer: singer!,
        to: ethscription?.order.vaultAddress!,
        ethscription: ethscription!,
      });
      await onChange('update', 'stake', ethscription!);
    } catch (error) {
    } finally {
      onClose('stake');
      setIsSubmit(false);
    }
  }

  return (
    <EtchDialog
      open={open}
      onClose={handleClose}
      title="Confirmation"
      footer={
        <Box sx={{ display: 'flex', alignItems: 'center', gap: '26px' }}>
          <Button
            onClick={() => {
              onClose('stake');
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
              disabled={new BigNumber(ethscriptionClone.order.quantity).lte(1)}
              loading={isSumbit}
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
              onClick={handleStake}
            >
              Stake
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
        <Box sx={{ mt: '42px' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', height: '36px' }}>
            <Typography sx={{ fontSize: '14px' }}>Total balance</Typography>
            <Typography sx={{ fontSize: '14px' }}>{ethscriptionClone.order.quantity ?? '--'}</Typography>
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', height: '36px' }}>
            <Typography sx={{ fontSize: '14px' }}>Locked Ratio</Typography>
            <Typography sx={{ fontSize: '14px' }}>{`${new BigNumber(ethscriptionClone.payment.stakingLockRatio)
              .div(10000)
              .multipliedBy(100)
              .toString()}%`}</Typography>
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', height: '36px' }}>
            <Typography sx={{ fontSize: '14px' }}>Locked in staking</Typography>
            <Typography sx={{ fontSize: '14px' }}>{stakingAmount.toString() ?? '--'}</Typography>
          </Box>
          <Divider sx={{ m: '15px 0' }} />
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', height: '36px' }}>
            <Typography sx={{ fontSize: '14px' }}>Available balance</Typography>
            <Typography sx={{ fontSize: '14px', color: '#E5FF65' }}>{availableBalance.toString()}</Typography>
          </Box>
        </Box>
      </Box>
    </EtchDialog>
  );
};

export default ConfirmStake;
