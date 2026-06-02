'use client';

import { Dialog, DialogActions, DialogContent, DialogTitle, IconButton, useMediaQuery } from '@mui/material';

import CloseSVG from '@/assets/icons/close.svg';

interface IEtchDialog {
  children: React.ReactNode;
  footer: React.ReactNode;
  title: React.ReactNode;
  open: boolean;
  onClose: () => void;
}

const EtchDialog: React.FC<IEtchDialog> = ({ title, footer, open, onClose, children }) => {
  const matches = useMediaQuery('(min-width:750px)');

  return (
    <Dialog
      open={open}
      onClose={() => {
        onClose();
      }}
      onClick={(e) => {
        e.stopPropagation();
      }}
      sx={{
        '.MuiPaper-root': {
          borderRadius: '8px',
          background: '#313439',
        },
      }}
    >
      <DialogTitle
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontWeight: '500',
          fontSize: '18px',
          p: '16px 32px 20px',
          borderBottom: '1px solid rgba(255,255,255,0.1)',
          width: matches ? '600px' : '100%',
        }}
      >
        {title}
        <IconButton
          onClick={(e) => {
            onClose();
          }}
        >
          <CloseSVG />
        </IconButton>
      </DialogTitle>
      <DialogContent
        sx={{
          p: '0 32px',
        }}
      >
        {children}
      </DialogContent>
      {footer && (
        <DialogActions
          sx={{
            borderTop: '1px solid rgba(255,255,255,0.1)',
            p: '20px 32px',
          }}
        >
          {footer}
        </DialogActions>
      )}
    </Dialog>
  );
};

export default EtchDialog;
