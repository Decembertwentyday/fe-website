// ============================================================================
// 【LaunchpadDialog.tsx/DateLimit.tsx】发射进度面板
// ----------------------------------------------------------------------------
// 显示发射的总量上限及当前已被 mint 数量（显示百分比及阶段结束日限制）。
// ============================================================================

'use client';

import { Box, BoxProps, Radio, Typography } from '@mui/material';

import { GetLaunchpadInfoData } from '@/services/evm/etchLaunchpad';
import { GetLaunchpadItem } from '@/services/launchpad/types';
import VerifySVG from '@/assets/icons/verify.svg';
import ProgressBar from '../ProgressBar';
import BigNumber from 'bignumber.js';
import dayjs from 'dayjs';

interface IDateLimit {
  launchpadInfo?: GetLaunchpadInfoData;
}

const DateLimit: React.FC<IDateLimit & BoxProps> = ({ launchpadInfo, ...props }) => {
  return (
    <Box {...props}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: '6px' }}>
        <Typography
          sx={{
            color: 'E5FF65',
            fontSize: '14px',
            fontWeight: 500,
          }}
        >
          {`${
            launchpadInfo?.current_index
              ? BigNumber(launchpadInfo?.current_index || 0)
                  .div(launchpadInfo?.MaxAvailable || 0)
                  .multipliedBy(100)
                  .toString()
              : '--'
          }% minted`}
        </Typography>
        <Typography
          sx={{
            color: 'rgba(255,255,255,0.64)',
            fontSize: '14px',
          }}
        >
          {`${launchpadInfo?.current_index ?? '--'}/${launchpadInfo?.MaxAvailable ?? '--'}`}
        </Typography>
      </Box>
      <ProgressBar
        sx={{ width: '100%', height: '8px', mb: '25px' }}
        variant="determinate"
        value={
          BigNumber(launchpadInfo?.current_index || 0)
            .div(launchpadInfo?.MaxAvailable || 0)
            .multipliedBy(100)
            .toNumber() || 0
        }
      />
      <Box
        sx={{
          display: 'flex',
          alignItems: 'flex-start',
          gap: '8px',
          mb: '20px',
          opacity: launchpadInfo?.isPublicMintOpen ? 1 : 0.5,
        }}
      >
        <Radio
          checked={launchpadInfo?.isPublicMintOpen ?? false}
          sx={{
            width: '20px',
            height: '20px',
            cursor: 'default',
          }}
        />
        <Box>
          <Typography
            sx={{
              color: '#FFF',
              fontSize: '14px',
              fontWeight: 500,
            }}
          >
            Public Mint
          </Typography>
          <Typography
            sx={{
              color: 'rgba(255,255,255, 0.64)',
              fontSize: '14px',
            }}
          >
            {launchpadInfo?.publicMintStartAfter
              ? dayjs.unix(Number(launchpadInfo.publicMintStartAfter)).format('YYYY/MM/DD HH:mm:ss')
              : '--'}
          </Typography>
        </Box>
      </Box>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'flex-start',
          gap: '8px',
          opacity: launchpadInfo?.isWhitelistMintOpen ? 1 : 0.5,
        }}
      >
        <Radio
          checked={launchpadInfo?.isWhitelistMintOpen ?? false}
          sx={{
            width: '20px',
            height: '20px',
            cursor: 'default',
          }}
        />
        <Box>
          <Typography
            sx={{
              color: '#FFF',
              fontSize: '14px',
              fontWeight: 500,
            }}
          >
            Whitelist Mint
          </Typography>
          <Typography
            sx={{
              color: 'rgba(255,255,255, 0.64)',
              fontSize: '14px',
            }}
          >
            {launchpadInfo?.whitelistMintStartAfter
              ? dayjs.unix(Number(launchpadInfo.whitelistMintStartAfter)).format('YYYY/MM/DD HH:mm:ss')
              : '--'}
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};

export default DateLimit;
