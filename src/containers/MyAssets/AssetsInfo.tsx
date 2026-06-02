// ============================================================================
// 【AssetsInfo.tsx】我的总资产信息面板
// ----------------------------------------------------------------------------
// 作用：显示地址缩写，根据地址生成 Emoji 头像，以及循环统计计算其名下所有不同代币
// 根据每个币种的提供价格 `valueUsd` 并依据 `decimals` 小数位累计相加得到一个总概览估值展示。
// ============================================================================
import { Box, Stack, Typography, useMediaQuery } from '@mui/material';

import MoneySVG from '@/assets/icons/money.svg';
import { emojiAvatarForAddress } from '../ConnectButtonLocal/emojiAvatar';
import { useAccount } from 'wagmi';
import { formatAddress } from '@/utils/addressHelper';
import { AssetItem } from '@/services/ethscriptions/types';
import BigNumber from 'bignumber.js';
import getTruncate from '@/utils/getTruncate';

interface IAssetsInfo {
  assetList: AssetItem[];
}

const AssetsInfo: React.FC<IAssetsInfo> = ({ assetList }) => {
  const account = useAccount();
  const matches = useMediaQuery('(min-width:750px)');

  const emojiInfo = account?.address && emojiAvatarForAddress(account?.address);

  let amount = '0';
  assetList.forEach((item) => {
    if (item.category === 'ethereum') {
      amount = new BigNumber(amount).plus(item.valueUsd).toString(10);
    } else {
      const valueUsdFacet = new BigNumber(item.valueUsd)
        .div(new BigNumber(10).exponentiatedBy(item.decimals || 18))
        .toString(10);
      amount = new BigNumber(amount).plus(valueUsdFacet).toString(10);
    }
  });

  return (
    <Stack
      direction="row"
      sx={{
        borderRadius: '12px',
        border: '1px solid #2F343E',
        background: '#202229',
        p: '24px',
        boxSizing: 'border-box',
        gap: '48px',
        mb: '28px',
      }}
    >
      {matches && (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Box
            sx={{
              width: '32px',
              height: '32px',
              borderRadius: '16px',
              fontSize: '16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: emojiInfo && emojiInfo.color,
            }}
          >
            {emojiInfo && emojiInfo.emoji}
          </Box>
          <Box>
            <Typography sx={{ fontSize: '20px', fontFamily: 'Poppins', fontWeight: 600 }}>
              {formatAddress(account.address || '')}
            </Typography>
            <Typography sx={{ fontSize: '14px', color: 'rgba(255,255,255,0.45)' }}>Address</Typography>
          </Box>
        </Box>
      )}
      {matches && <Box sx={{ width: '1px', height: '50px', background: 'rgba(255, 255, 255, 0.10)' }} />}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
        <MoneySVG />
        <Box>
          <Typography sx={{ fontSize: '20px', fontFamily: 'Poppins', fontWeight: 600 }}>{`$${getTruncate(
            amount,
            4,
          )}`}</Typography>
          <Typography sx={{ fontSize: '14px', color: 'rgba(255,255,255,0.45)' }}>Total assets</Typography>
        </Box>
      </Box>
    </Stack>
  );
};

export default AssetsInfo;
