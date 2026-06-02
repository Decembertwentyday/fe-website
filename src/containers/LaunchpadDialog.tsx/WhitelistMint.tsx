// ============================================================================
// 【LaunchpadDialog.tsx/WhitelistMint.tsx】白名单（Whitelist Mint）参与面板
// ----------------------------------------------------------------------------
// 判断当前是否属于白单预售阶段 (isWhitelistMintOpen)。
// 对钱包地址进行白名判断与分配；使用 MerkleTree 计算证明（proof）。
// ============================================================================

'use client';

import { Box, BoxProps, Typography } from '@mui/material';
import { LoadingButton } from '@mui/lab';

import { GetLaunchpadInfoData } from '@/services/evm/etchLaunchpad';
import Counter from '@/components/Counter';
import BigNumber from 'bignumber.js';
import { ethers } from 'ethers';
import { useEffect, useState } from 'react';
import services, { evmService } from '@/services';
import { GetLaunchpadItem, GetLaunchpadInfoData as GetLaunchpadInfoDataTemp } from '@/services/launchpad/types';
import { useAccount, useChainId } from 'wagmi';
import { useEthersSigner } from '@/hooks/useEthersSigner';
import { toastResult } from './ResultViewHoc';

interface IWhitelistMint {
  launchpadInfo?: GetLaunchpadInfoData;
  launchpadItem: GetLaunchpadItem;
  onClose: () => void;
}

const WhitelistMint: React.FC<IWhitelistMint & BoxProps> = ({ launchpadInfo, launchpadItem, onClose, ...props }) => {
  const singer = useEthersSigner();
  const chainId = useChainId();
  const [count, setCount] = useState<number>(1);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [launchpadInfoTemp, setLaunchpadInfoTemp] = useState<GetLaunchpadInfoDataTemp>();
  const { address } = useAccount();

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

  useEffect(() => {
    if (address && launchpadItem) {
      services.launchpad
        .getLaunchpadInfo({
          name: launchpadItem.name,
          address: address,
        })
        .then((response) => {
          if (response.code == 200) {
            setLaunchpadInfoTemp(response.data);
          }
        });
    }
  }, [address, launchpadItem]);

  async function handleMint() {
    try {
      setIsLoading(true);
      const receipt = await evmService.etchLaunchpad.whitelistMint({
        singer: singer!,
        amount: count,
        launchpadItem: launchpadInfoTemp!,
        launchpadInfo: launchpadInfo!,
      });
      toastResult({ type: 'success', receipt, chainId });
      onClose();
    } catch (e) {
      toastResult({ type: 'fail', chainId });
    } finally {
      setIsLoading(false);
    }
  }

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
          {getPublicPrice(launchpadInfo?.whitelistMintPrice)}
        </Typography>
        <Typography
          sx={{
            color: 'rgba(255,255,255,0.65)',
            fontSize: '14px',
            fontWeight: '400',
          }}
        >
          {`Limit ${launchpadInfo?.whitelistMaxAvailable ?? '--'} per wallet`}
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
          max={launchpadInfo?.whitelistMaxAvailable || 1}
          count={count}
          onChange={(value) => {
            setCount(value);
          }}
        />
        <LoadingButton
          variant="contained"
          loading={isLoading}
          disabled={
            !(
              launchpadInfo?.isWhitelistMintOpen &&
              launchpadInfo?.whitelistMaxAvailable >= 1 &&
              launchpadInfoTemp?.isWhitelist &&
              launchpadInfo?.isOpen
            )
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
          Whitelist mint
        </LoadingButton>
      </Box>
      <Typography sx={{ color: 'rgba(255,255,255,0.64)', fontSize: '14px', mt: '5px' }}>
        {launchpadInfoTemp
          ? launchpadInfoTemp?.isWhitelist
            ? 'You are eligible for the whitelist'
            : 'You are not eligible for the whitelist'
          : '--'}
      </Typography>
    </Box>
  );
};

export default WhitelistMint;
