// ============================================================================
// 【LaunchpadDialog.tsx/PublicMint.tsx】公售（Public Mint）参与面板
// ----------------------------------------------------------------------------
// 判断公售当前是否开启 (isPublicMintOpen)。
// 基于允许购买的数量设置 `Counter` （步进计票器）。
// 并结合智能合约调用 (evmService.buy) 进行打新抢购购买。
// ============================================================================

'use client';

import { Box, BoxProps, Typography } from '@mui/material';
import { LoadingButton } from '@mui/lab';

import Counter from '@/components/Counter';
import { GetLaunchpadInfoData } from '@/services/evm/etchLaunchpad';
import { ethers } from 'ethers';
import BigNumber from 'bignumber.js';
import { useState } from 'react';
import { evmService } from '@/services';
import { useEthersSigner } from '@/hooks/useEthersSigner';
import { GetLaunchpadItem } from '@/services/launchpad/types';
import { toastResult } from './ResultViewHoc';
import { useChainId } from 'wagmi';

interface IPublicMint {
  launchpadInfo?: GetLaunchpadInfoData;
  launchpadItem: GetLaunchpadItem;
  onClose: () => void;
}

const PublicMint: React.FC<IPublicMint & BoxProps> = ({ launchpadInfo, launchpadItem, onClose, ...props }) => {
  const singer = useEthersSigner();
  const chainId = useChainId();
  const [count, setCount] = useState<number>(1);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  function getPublicPrice(mintPrice?: string) {
    if (mintPrice) {
      if (BigNumber(mintPrice).eq(0)) {
        return 'FREE';
      } else {
        return `${ethers.utils.formatUnits(BigNumber(mintPrice).multipliedBy(count).toString(), 18)} ETH`;
      }
    } else {
      return '--';
    }
  }

  async function handleMint() {
    try {
      setIsLoading(true);
      const receipt = await evmService.etchLaunchpad.publicMint({
        singer: singer!,
        launchpadInfo: launchpadInfo!,
        amount: count,
        launchpadItem,
      });
      toastResult({ type: 'success', receipt, chainId });
      onClose();
    } catch (e) {
      toastResult({ type: 'fail', chainId });
    } finally {
      setIsLoading(false);
    }
  }

  console.log(launchpadInfo);

  return (
    <Box {...props}>
      <Box sx={{ mb: '10px' }}>
        <Typography
          sx={{
            color: '#E5FF65',
            fontSize: '18px',
            fontWeight: '500',
          }}
        >
          {getPublicPrice(launchpadInfo?.publicMintPrice)}
        </Typography>
        <Typography
          sx={{
            color: 'rgba(255,255,255,0.65)',
            fontSize: '14px',
            fontWeight: '400',
          }}
        >
          {`Limit ${launchpadInfo?.publicMaxAvailable ?? '--'} per wallet`}
        </Typography>
      </Box>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          height: '48px',
          borderRadius: '4px',
          overflow: 'hidden',
          width: 'fit-content',
          border: '1px solid rgba(255, 255, 255, 0.10)',
        }}
      >
        <Counter
          max={launchpadInfo?.publicMaxAvailable || 1}
          count={count}
          onChange={(value) => {
            setCount(value);
          }}
        />
        <LoadingButton
          variant="contained"
          loading={isLoading}
          disabled={
            !(launchpadInfo?.isPublicMintOpen && launchpadInfo.publicMaxAvailable >= 1 && launchpadInfo?.isOpen)
          }
          sx={{
            background: '#D5E970',
            color: '#171A1F',
            height: '100%',
            fontSize: '16px',
            fontWeight: 500,
            textTransform: 'capitalize',
            borderRadius: 0,
            boxShadow: 'none',
            '&:hover': {
              background: '#D5E970',
            },
          }}
          onClick={handleMint}
        >
          Public mint
        </LoadingButton>
      </Box>
    </Box>
  );
};

export default PublicMint;
