// ============================================================================
// 【BulkOperation.tsx】桌面端批量操作栏（悬浮底部或固定位置）
// ----------------------------------------------------------------------------
// 作用：当用户点击"批量操作"开关进入选择模式后，显示的批量操作工具栏。
// 功能：
// 1. 全选/反选当前已加载的所有铭文。
// 2. 显示当前已选中的铭文数量。
// 3. 行动触发按钮：挂单 (List)、取消挂单 (Unlist)、提取 (Withdraw)、转移 (Transfer)。
// 注意：部分动作需要二次确认弹窗或跳转至批量操作确认页。
// ============================================================================

'use client';

import { useSnapshot } from 'valtio';
import { useRouter } from 'next/navigation';
import { Box, Button, ButtonProps, Checkbox, Typography } from '@mui/material';

import * as BulkListingStore from '@/stores/BulkListingStore';
import * as EthscriptionsStore from '@/stores/EthscriptionsStore';
import * as GlobalStore from '@/stores/GlobalStore';
import BulkTransfer from './BulkTransfer';
import { useState } from 'react';
import BulkUnlist from './BulkUnlist';
import BulkWithdraw from './BulkWithdraw';
import NoOGDialog from '@/components/NoOGDialog';
import BundleSale from './BundleSale';

interface IBulkOperation {}

const ButtonSX: ButtonProps['sx'] = {
  borderRadius: '46px',
  background: '#E5FF65',
  color: '#171A1F',
  fontSize: '14px',
  textTransform: 'none',
  px: '20px',
  '&.Mui-disabled': {
    color: '#171A1F',
    bgcolor: 'rgba(229, 255, 101, 0.6)',
  },
  '&:hover': {
    color: '#000',
    bgcolor: 'rgba(229, 255, 101, 0.8)',
  },
};

const BulkOperation: React.FC<IBulkOperation> = () => {
  const ethscriptionsStore = useSnapshot(EthscriptionsStore.store);
  const bulkListingStore = useSnapshot(BulkListingStore.store);
  // const globalStore = useSnapshot(GlobalStore.store);
  const router = useRouter();
  // const [isOgPass, setIsOgPass] = useState<boolean>(false);
  const [openTransfer, setOpenTransfer] = useState<boolean>(false);
  const [openBundle, setOpenBundle] = useState<boolean>(false);
  const [openUnlist, setOpenUnlist] = useState<boolean>(false);
  const [openWithdraw, setOpenWithdraw] = useState<boolean>(false);

  return (
    bulkListingStore.ethsList.length > 0 && (
      <Box
        sx={{
          width: '100%',
          height: '62px',
          background: 'rgba(43, 45, 52, 1)',
          position: 'fixed',
          display: 'flex',
          bottom: 0,
          left: 0,
          alignItems: 'center',
          justifyContent: 'space-between',
          p: { xs: '0 10px', sm: '0 140px' },
          zIndex: '99999',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
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
        <Box
          sx={{
            display: 'flex',
            gap: '10px',
          }}
        >
          <Button
            sx={ButtonSX}
            disabled={bulkListingStore.bulkListEths.length == 0}
            onClick={() => {
              router.push('/bulk');
            }}
          >
            {`List (${bulkListingStore.bulkListEths.length})`}
          </Button>
          {/*   <Button
            sx={ButtonSX}
            disabled={bulkListingStore.bulkListEths.length == 0}
            onClick={() => {
              setOpenBundle(true);
            }}
          >
            {`Bundle (${bulkListingStore.bulkListEths.length})`}
          </Button> */}

          <Button
            sx={ButtonSX}
            disabled={bulkListingStore.bulkUnlistEths.length == 0}
            onClick={() => {
              setOpenUnlist(true);
            }}
          >
            {`Unlist (${bulkListingStore.bulkUnlistEths.length})`}
          </Button>
          <Button
            sx={ButtonSX}
            disabled={bulkListingStore.bulkTransferEths.length == 0}
            onClick={() => {
              setOpenTransfer(true);
            }}
          >
            {`Transfer (${bulkListingStore.bulkTransferEths.length})`}
          </Button>

          <Button
            sx={ButtonSX}
            disabled={bulkListingStore.bulkWithdrawEths.length == 0}
            onClick={() => {
              setOpenWithdraw(true);
            }}
          >
            {`Withdraw (${bulkListingStore.bulkWithdrawEths.length})`}
          </Button>
        </Box>
        <BulkTransfer
          title="Bulk Transfer"
          open={openTransfer}
          onClose={async () => {
            setOpenTransfer(false);
          }}
        />
        <BulkUnlist
          title="Bulk Unlist"
          open={openUnlist}
          onClose={async () => {
            setOpenUnlist(false);
          }}
        />
        <BundleSale
          title="Bundle Sale"
          open={openBundle}
          onClose={async () => {
            setOpenBundle(false);
          }}
        />
        <BulkWithdraw
          title="Bulk Withdraw"
          open={openWithdraw}
          onClose={async () => {
            setOpenWithdraw(false);
          }}
        />
        {/* <NoOGDialog
          open={isOgPass}
          onClose={() => {
            setIsOgPass(false);
          }}
        /> */}
      </Box>
    )
  );
};

export default BulkOperation;
