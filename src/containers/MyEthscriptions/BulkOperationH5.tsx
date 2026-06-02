// ============================================================================
// 【BulkOperationH5.tsx】移动端批量操作栏（适配小屏幕）
// ----------------------------------------------------------------------------
// 作用：移动端下由于屏幕宽度限制，将"挂单"、"转移"等多按钮折叠到【更多】下拉菜单中。
// 唤起：弹出 Popover 显示 MenuItem 项，执行动作与桌面端一致。
// ============================================================================

'use client';

import { useState } from 'react';
import { useSnapshot } from 'valtio';
import { useRouter } from 'next/navigation';
import { Box, Button, ButtonProps, Checkbox, Popover, Stack, Typography, useMediaQuery } from '@mui/material';

import * as BulkListingStore from '@/stores/BulkListingStore';
import * as EthscriptionsStore from '@/stores/EthscriptionsStore';
import BulkTransfer from './BulkTransfer';
import MoreButtonSVG from '@/assets/icons/more_button.svg';

import BulkUnlist from './BulkUnlist';
import BulkWithdraw from './BulkWithdraw';
import NoOGDialog from '@/components/NoOGDialog';
import { useImmer } from 'use-immer';
import { LoadingButton } from '@mui/lab';

interface IBulkOperationH5 {}

export interface MenuItem {
  label: string;
  value: 'list' | 'unlist' | 'withdraw' | 'transfer' | 'inscribeTransfer';
  disabled: boolean;
}

const ButtonSX: ButtonProps['sx'] = {
  borderRadius: '46px',
  background: '#D5E970',
  color: '#171A1F',
  fontSize: '14px',
  textTransform: 'none',
  px: '20px',
  '&.Mui-disabled': {
    color: '#171A1F',
    bgcolor: 'rgba(229, 255, 101, 1)',
  },
  '&:hover': {
    color: '#000',
    bgcolor: 'rgba(229, 255, 101, 1)',
  },
};

const BulkOperationH5: React.FC<IBulkOperationH5> = () => {
  const ethscriptionsStore = useSnapshot(EthscriptionsStore.store);
  const bulkListingStore = useSnapshot(BulkListingStore.store);
  const router = useRouter();
  const matches = useMediaQuery('(min-width:750px)');
  const [anchorEl, setAnchorEl] = useState<HTMLDivElement | null>(null);

  const [buttonFlag, setButtonFlag] = useImmer<{ [key in MenuItem['value']]: boolean }>({
    transfer: false,
    withdraw: false,
    inscribeTransfer: false,
    unlist: false,
    list: false,
  });

  const handleClick = (event: React.MouseEvent<HTMLDivElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const MenuList: MenuItem[] = [
    {
      label: `Unlist (${bulkListingStore.bulkUnlistEths.length})`,
      value: 'unlist',
      disabled: bulkListingStore.bulkUnlistEths.length == 0,
    },
    {
      label: `Withdraw (${bulkListingStore.bulkWithdrawEths.length})`,
      value: 'withdraw',
      disabled: bulkListingStore.bulkWithdrawEths.length == 0,
    },
    {
      label: `Transfer (${bulkListingStore.bulkTransferEths.length})`,
      value: 'transfer',
      disabled: bulkListingStore.bulkTransferEths.length == 0,
    },
  ];

  const open = Boolean(anchorEl);

  const handleOnSelect = (item: MenuItem) => {
    return () => {
      setButtonFlag((state) => {
        state[item.value] = true;
      });
      handleClose();
    };
  };

  return (
    bulkListingStore.ethsList.length > 0 && (
      <Box
        sx={{
          width: '100%',
          background: 'rgba(43, 45, 52, 1)',
          position: 'fixed',
          display: 'flex',
          bottom: 0,
          left: 0,
          flexDirection: matches ? 'row' : 'column',
          alignItems: matches ? 'center' : 'flex-start',
          justifyContent: matches ? 'space-between' : 'unset',
          p: { xs: '10px', sm: '10px 140px' },
          zIndex: '1000',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', mb: '12px' }}>
          <Checkbox
            className="checkbox"
            size="small"
            checked={bulkListingStore.selectAll}
            sx={{
              '&.MuiCheckbox-root': {
                width: '26px',
                height: '26px',
              },
              '&.MuiCheckbox-root:hover': {
                bgcolor: 'transparent',
              },
            }}
            onChange={(_, checked) => {
              BulkListingStore.setSelectAll(checked);
              BulkListingStore.clearAllEthsciption();

              if (checked) {
                ethscriptionsStore.ownerList.ethscriptions.forEach((item) => {
                  BulkListingStore.toggleEthscriptionToCart({ ...item, floorPrice: '', protocol: '0', royalty: '0' });
                });
              }
            }}
          />
          <Typography
            sx={{
              color: '#FFF',
              fontSize: '14px',
              fontWeight: '500',
            }}
          >
            Select All
          </Typography>
          <Typography
            sx={{
              color: 'rgba(255, 255, 255, 0.45)',
              fontSize: '12px',
              fontWeight: '400',
              marginLeft: '12px',
            }}
          >
            {`${bulkListingStore.ethsList.length} selected`}
          </Typography>
        </Box>

        <Stack direction="row" sx={{ width: '100%', gap: '8px' }} justifyContent="space-between" alignItems="center">
          <LoadingButton
            variant="contained"
            fullWidth
            disableElevation
            color="primary"
            disabled={bulkListingStore.bulkListEths.length == 0}
            sx={{
              height: '36px',
              borderRadius: '46px',
              border: '1px solid #D5E970',
              textTransform: 'none',
              '&:hover': {
                color: '#000',
                bgcolor: 'rgba(229, 255, 101, 1)',
              },
            }}
            onClick={() => {
              router.push('/bulk');
            }}
          >
            {`Bulk listing (${bulkListingStore.bulkListEths.length})`}
          </LoadingButton>
          <Box sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }} onClick={handleClick}>
            <MoreButtonSVG />
          </Box>
        </Stack>

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
                  <Box className="label">{item.label}</Box>
                </Button>
              );
            })}
          </Box>
        </Popover>

        <BulkTransfer
          title="Bulk Transfer"
          open={buttonFlag.transfer}
          onClose={() => {
            setButtonFlag((state) => {
              state.transfer = false;
            });
          }}
        />
        <BulkUnlist
          title="Bulk Unlist"
          open={buttonFlag.unlist}
          onClose={async () => {
            setButtonFlag((state) => {
              state.unlist = false;
            });
          }}
        />
        <BulkWithdraw
          title="Bulk Withdraw"
          open={buttonFlag.withdraw}
          onClose={async () => {
            setButtonFlag((state) => {
              state.withdraw = false;
            });
          }}
        />
      </Box>
    )
  );
};

export default BulkOperationH5;
