// ============================================================================
// 【LaunchpadDialog.tsx/index.tsx】项目发射台弹窗组的主容器
// ----------------------------------------------------------------------------
// 作用：从列表页点击某个打新项目（Launchpad）后弹出的详细面板。
// 主要调用 `evmService.etchLaunchpad.getLaunchpadInfo` 来拉取最新盲盒合约里的实时阶段参数。
// ============================================================================

'use client';

import { Box, Dialog, DialogContent, DialogTitle, IconButton, Typography } from '@mui/material';
import { useEffect, useState } from 'react';

import CloseSVG from '@/assets/icons/close.svg';
import { GetLaunchpadInfoData } from '@/services/evm/etchLaunchpad';
import { GetLaunchpadItem } from '@/services/launchpad/types';
import VerifySVG from '@/assets/icons/verify.svg';
import DateLimit from './DateLimit';
import WhitelistMint from './WhitelistMint';
import MediaList from '@/components/MediaList';
import PublicMint from './PublicMint';
import { evmService } from '@/services';
import { useEthersSigner } from '@/hooks/useEthersSigner';
import { useAccount } from 'wagmi';

interface IEtchDialog {
  launchpadItem: GetLaunchpadItem;
  open: boolean;
  onClose: () => void;
}

const MintDialog: React.FC<IEtchDialog> = ({ open, onClose, launchpadItem }) => {
  const singer = useEthersSigner();
  const { address } = useAccount();
  const [launchpadInfo, setLanchpadInfo] = useState<GetLaunchpadInfoData>();
  const getLaunchpadInfo = async () => {
    if (singer) {
      const result = await evmService.etchLaunchpad.getLaunchpadInfo({ singer, launchpadItem });
      setLanchpadInfo(result);
    }
  };

  useEffect(() => {
    if (open && launchpadItem) {
      getLaunchpadInfo();
    } else {
      setLanchpadInfo(undefined);
    }
  }, [address, singer, open, launchpadItem]);

  return (
    <Dialog
      open={open}
      onClose={() => {
        onClose();
      }}
      sx={{
        '.MuiPaper-root': {
          borderRadius: '8px',
          background: '#313439',
          maxWidth: '720px',
        },
      }}
    >
      <DialogTitle
        sx={{
          fontWeight: '500',
          fontSize: '18px',
          p: '32px',
          position: 'relative',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Typography sx={{ fontSize: '18px', fontWeight: 600, mr: '8px' }}>{launchpadItem.name}</Typography>
          {launchpadItem.blueVerified && <VerifySVG />}
        </Box>
        <MediaList data={launchpadItem.socialPlatform} />
        <IconButton
          onClick={() => {
            onClose();
          }}
          sx={{ position: 'absolute', top: '18px', right: '32px' }}
        >
          <CloseSVG />
        </IconButton>
      </DialogTitle>
      <DialogContent
        sx={{
          p: '0 32px  64px',
        }}
      >
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            flexDirection: { xs: 'column', sm: 'row' },
            alignItems: 'center',
            mb: '24px',
            gap: '24px',
          }}
        >
          <Box
            sx={{
              flex: '1 1',
              borderRadius: '4px',
              overflow: 'hidden',
            }}
          >
            <img
              src={launchpadItem.projectImage}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'contain',
                border: 'none',
                outline: 'none',
                imageRendering: 'pixelated',
              }}
            />
          </Box>
          <DateLimit
            launchpadInfo={launchpadInfo}
            sx={{
              flex: 1,
              width: '100%',
            }}
          />
        </Box>
        <Typography sx={{ color: 'rgba(255,255,255, 0.64)', fontSize: '14px', mb: '32px' }}>
          {launchpadItem.desc}
        </Typography>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            flexDirection: { xs: 'column', sm: 'row' },
            gap: { xs: '26px', sm: '86px' },
          }}
        >
          <WhitelistMint launchpadInfo={launchpadInfo} launchpadItem={launchpadItem} onClose={onClose} />
          <PublicMint launchpadInfo={launchpadInfo} launchpadItem={launchpadItem} onClose={onClose} />
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default MintDialog;
