'use client';

import { ContentCopy, Logout } from '@mui/icons-material';
import { Box, Divider, ListItemIcon, Menu, MenuItem, useMediaQuery } from '@mui/material';
import React from 'react';
import { useAccount, useDisconnect } from 'wagmi';
import { useRouter } from 'next/navigation';
import { useCopy } from '@/utils/useCopy';
import HomeIcon from '@mui/icons-material/Home';
import WalletIcon from '@mui/icons-material/Wallet';

const AccountMenu: React.FC<{ children: React.ReactElement }> = ({ children }) => {
  const { disconnect } = useDisconnect();
  const account = useAccount();
  const router = useRouter();
  const matches = useMediaQuery('(max-width:750px)');

  const [isCopy, copyhandler] = useCopy();
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    !matches && setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };
  return (
    <Box>
      <Box onClick={handleClick}>{children}</Box>
      <Menu
        anchorEl={anchorEl}
        id="account-menu"
        open={open}
        onClose={handleClose}
        onClick={handleClose}
        sx={{
          '& .MuiMenu-paper': {
            background: 'rgb(32, 34, 41)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            mt: '10px',
          },
          '& .item': {
            p: '10px 20px',
            color: 'rgba(255,255,255,1)',
            fontSize: '14px',
            fontWeight: 500,
            '&:hover': {
              color: 'white',
            },
          },
          '& .icon': {
            color: 'rgba(255,255,255,0.64)',
          },
        }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <MenuItem onClick={() => router.push('/owner')} className="item">
          <ListItemIcon>
            <HomeIcon className="icon" fontSize="small" />
          </ListItemIcon>
          My Ethscriptions
        </MenuItem>
        <MenuItem onClick={() => router.push('/asset')} className="item">
          <ListItemIcon>
            <WalletIcon className="icon" fontSize="small" />
          </ListItemIcon>
          My Assets
        </MenuItem>
        <MenuItem onClick={() => copyhandler(account?.address || '')} className="item">
          <ListItemIcon>
            <ContentCopy className="icon" fontSize="small" />
          </ListItemIcon>
          Copy Address
        </MenuItem>
        <Divider sx={{ width: '80%', margin: '0 auto' }} />
        <MenuItem onClick={() => disconnect()} className="item">
          <ListItemIcon>
            <Logout className="icon" fontSize="small" />
          </ListItemIcon>
          Logout
        </MenuItem>
      </Menu>
    </Box>
  );
};

export default AccountMenu;
