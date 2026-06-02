// ============================================================================
// 【MoreMenuButton.tsx】铭文卡片操作区的【... 更多】下拉菜单组件
// ----------------------------------------------------------------------------
// 根据铭文状态（是否质押、是否 Facet 资产、是否挂单等）决定哪些菜单项可用：
//   - unlist: 取消挂单（仅对已经在卖的可用）
//   - transfer: 转移（仅对未挂单且合法的可传）
//   - stake: 质押（如果该集合支持质押）
//   - withdraw: 提取（从 Facet 到 L1）
//   - burn: 销毁（转移到黑洞）
// ============================================================================

'use client';

import React from 'react';
import { Box, Popover, Button } from '@mui/material';

import MoreButtonSVG from '@/assets/icons/more_button.svg';
import MenuStakeSVG from '@/assets/icons/menu_stake.svg';
import MenuUnlistSVG from '@/assets/icons/menu_unlist.svg';
import MenuTransferSVG from '@/assets/icons/menu_transfer.svg';
import MenuWithdrawSVG from '@/assets/icons/menu_withdraw.svg';
import MenuBurneSVG from '@/assets/icons/menu_burn.svg';
import { useEthscriptionBoxContext } from '../EthscriptionBox/EthscriptionBoxContext';

export interface MenuItem {
  label: string;
  icon: React.ReactNode;
  value: 'unlist' | 'stake' | 'withdraw' | 'transfer' | 'burn';
  disabled: boolean;
}

interface IFilterSelect {
  onSelectMenu?: (val: MenuItem) => void;
}

const MoreMenuButton: React.FC<IFilterSelect> = ({ onSelectMenu }) => {
  const { ethscription } = useEthscriptionBoxContext();
  const [anchorEl, setAnchorEl] = React.useState<HTMLDivElement | null>(null);

  const tokenConetnt = ethscription?.order.category == 'token' ? JSON.parse(ethscription?.order.content || '') : '';
  const isTokenTransfer = tokenConetnt?.op == 'transfer';

  const handleClick = (event: React.MouseEvent<HTMLDivElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const MenuList: MenuItem[] = [
    {
      label: 'Unlist',
      value: 'unlist',
      icon: <MenuUnlistSVG />,
      disabled: !Boolean(ethscription?.order.isListing),
    },
    // {
    //   label: 'Stake',
    //   value: 'stake',
    //   icon: <MenuStakeSVG />,
    //   disabled:
    //     true ||
    //     Boolean(ethscription?.order.isListing) ||
    //     Boolean(ethscription?.order.isDeposit) ||
    //     !(Boolean(ethscription?.order.isVerified) && ethscription?.order.category == 'token' && !isTokenTransfer),
    // },
    {
      label: 'Withdraw',
      value: 'withdraw',
      icon: <MenuWithdrawSVG />,
      disabled: Boolean(ethscription?.order.isListing) || !Boolean(ethscription?.order.isDeposit),
    },
    {
      label: 'Transfer',
      value: 'transfer',
      icon: <MenuTransferSVG />,
      disabled: Boolean(ethscription?.order.isListing) || Boolean(ethscription?.order.isDeposit),
    },
    // {
    //   label: 'Burn',
    //   value: 'burn',
    //   icon: <MenuBurneSVG />,
    //   disabled:
    //     Boolean(ethscription?.order.isListing) ||
    //     Boolean(ethscription?.order.isDeposit) ||
    //     !(Boolean(ethscription?.order.isVerified) && ethscription?.order.category == 'token' && isTokenTransfer),
    // },
  ];

  const open = Boolean(anchorEl);

  const handleOnSelect = (item: MenuItem) => {
    return () => {
      onSelectMenu?.(item);
      handleClose();
    };
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }} onClick={handleClick}>
        <MoreButtonSVG />
      </Box>
      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        sx={{
          backgroundColor: 'transparent',
          '.MuiPaper-root': {
            background: 'transparent',
          },
        }}
      >
        <Box
          sx={{
            mt: '8px',
            display: 'flex',
            flexDirection: 'column',
            borderRadius: '8px',
            border: '1px solid #474C56',
            background: '#313439',
            p: '16px',
            boxShadow: '0px 0px 4px 0px rgba(19, 33, 82, 0.06), 0px 1px 25px 0px rgba(19, 33, 82, 0.10)',
          }}
        >
          {MenuList.map((item) => {
            return (
              <Button
                key={item.value}
                fullWidth
                variant="text"
                onClick={handleOnSelect(item)}
                disabled={item.disabled}
                sx={{
                  color: '#fff',
                  justifyContent: 'flex-start',
                  fontSize: '14px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  textTransform: 'none',
                  svg: {
                    color: 'rgba(255,255,255,0.65)',
                  },
                }}
              >
                {item.icon}
                <Box className="label">{item.label}</Box>
              </Button>
            );
          })}
        </Box>
      </Popover>
    </Box>
  );
};

export default MoreMenuButton;
