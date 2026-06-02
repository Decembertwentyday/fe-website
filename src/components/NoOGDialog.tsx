// ============================================================================
// 【NoOGDialog】需要 OG Pass 的操作拦截弹窗
// ----------------------------------------------------------------------------
// OG Pass：早期用户特权凭证（NFT），持有者可进行批量操作等高级功能
// 弹窗内展示 OG Pass 图标 + 提示文字 + 跳转 OpenSea 购买按鈕
// Props:
//   open    = 控制弹窗显隐
//   onClose = 关闭回调
// ============================================================================

'use client';

import { Button, Dialog, Typography, DialogContent } from '@mui/material';

import OGPassSVG from '@/assets/icons/og_pass.svg';

interface INoOGDialog {
  open: boolean;
  onClose: () => void;
}

const NoOGDialog: React.FC<INoOGDialog> = ({ open, onClose }) => {
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
          border: '1px solid #474C56',
          boxShadow: '0px 0px 4px 0px rgba(19, 33, 82, 0.06), 0px 1px 25px 0px rgba(19, 33, 82, 0.10)',
        },
      }}
    >
      <DialogContent
        sx={{
          width: '440px',
          height: '343px',
          p: '12px 32px 32px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          gap: '24px',
        }}
      >
        <OGPassSVG />
        <Typography
          sx={{
            color: '#FFF',
            fontSize: '16px',
            fontWeight: 500,
          }}
        >
          Sorry, Only open to OG PASS users.
        </Typography>
        <Button
          variant="contained"
          sx={{
            background: '#E5FF65',
            borderRadius: '6px',
            width: '134px',
            height: '40px',
          }}
          onClick={() => {
            onClose();
          }}
        >
          OK
        </Button>
      </DialogContent>
    </Dialog>
  );
};

export default NoOGDialog;
