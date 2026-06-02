// ============================================================================
// 【BulkWithdraw.tsx】批量提取（Bulk Withdraw）弹窗组件
// ----------------------------------------------------------------------------
// 作用：用户在批量操作模式下选定多个存放在合约(Facet/L2)中的铭文，一次性提取回主网 L1 钱包。
// 流程：
// 1. 获取已选中的包含 isDeposit: true 状态的铭文列表。
// 2. 循环遍历呈现选中的铭文缩略列表（EthsLabelCard）。
// 3. 点击【Withdraw】发起后端批量 `withdrawMultipleEthscriptions` 智能合约方法。
// ============================================================================

'use client';

import { Box, Button, Typography } from '@mui/material';
import { useState } from 'react';
import { useSnapshot } from 'valtio';
import { LoadingButton } from '@mui/lab';

import * as BulkListingStore from '@/stores/BulkListingStore';
import * as EthscriptionsStore from '@/stores/EthscriptionsStore';
import EtchDialog from '@/components/EtchDialog';
import EthscriptionLabel from '@/components/EthscriptionLabel';
import { useEthersSigner } from '@/hooks/useEthersSigner';
import { evmService } from '@/services';
import { IBulkEthscriptionsItem } from '@/stores/BulkListingStore';

interface IBulkWithdraw {
  title: React.ReactNode;
  open: boolean;
  onClose: () => void;
}

const BulkWithdraw: React.FC<IBulkWithdraw> = ({ open, onClose, title }) => {
  // const bulkListingStore = useSnapshot(BulkListingStore.store);
  // const [isSumbit, setIsSubmit] = useState<boolean>(false);

  // async function handleWithdraw() {}

  const singer = useEthersSigner();
  const bulkListingStore = useSnapshot(BulkListingStore.store);
  const [isSumbit, setIsSubmit] = useState<boolean>(false);

  async function handleWithdraw() {
    try {
      setIsSubmit(true);

      await evmService.etchMarket.withdrawBulkEthscription({
        singer: singer!,
        ethscriptions: bulkListingStore.bulkWithdrawEths as IBulkEthscriptionsItem[],
      });

      EthscriptionsStore.removeOwnerItem(bulkListingStore.bulkWithdrawEths as IBulkEthscriptionsItem[]);
      BulkListingStore.clearAllEthsciption();
      onClose();
    } catch (error) {
      console.log(error);
    } finally {
      setIsSubmit(false);
    }
  }

  return (
    <EtchDialog
      open={open}
      onClose={onClose}
      title={title}
      footer={
        <Box sx={{ display: 'flex', alignItems: 'center', gap: '26px' }}>
          <Button
            onClick={onClose}
            variant="outlined"
            sx={{
              height: '40px',
              fontSize: '14px',
              fontWeight: 500,
              textTransform: 'capitalize',
              borderColor: '#fff',
              color: '#fff',
              '&:hover': {
                bgcolor: 'rgb(80 81 83 / 50%)',
                borderColor: '#fff',
              },
            }}
          >
            Cancel
          </Button>
          <LoadingButton
            variant="contained"
            fullWidth
            loadingPosition="start"
            disableElevation
            loading={isSumbit}
            color="primary"
            sx={{
              height: '40px',
              fontSize: '14px',
              fontWeight: 500,
              textTransform: 'capitalize',
              '&.Mui-disabled': {
                background: '#e5ff6566',
              },
            }}
            onClick={handleWithdraw}
          >
            Withdraw
          </LoadingButton>
        </Box>
      }
    >
      <Box
        sx={{
          p: '40px 0',
        }}
      >
        <Typography>{`Items(${bulkListingStore.bulkWithdrawEths.length})`}</Typography>
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(200px,1fr))',
            gap: '20px',
            boxSizing: 'border-box',
            m: '20px 0',
            minHeight: '54px',
            maxHeight: '128px',
            overflowY: 'scroll',
            '&::-webkit-scrollbar-thumb': {
              backgroundColor: '#a5a9b5',
            },
          }}
        >
          {bulkListingStore.bulkWithdrawEths.map((item) => {
            return (
              <Box
                sx={{
                  p: '6px 12px',
                  boxSizing: 'border-box',
                  borderRadius: '8px',
                  bgcolor: 'rgba(255, 255, 255, 0.10)',
                }}
                key={item.order.ethscriptionNumber}
              >
                <EthscriptionLabel
                  category={item.order.category}
                  icon={item.order.content}
                  collectionName={item.order.collectionName}
                  numberId={
                    <Typography fontWeight={500} fontSize={'14px'} mr="6px">
                      {`#${item.order.ethscriptionNumber}`}
                    </Typography>
                  }
                />
              </Box>
            );
          })}
        </Box>
        <Typography sx={{ fontSize: '16px' }}>Are sure to withdraw all the items?</Typography>
      </Box>
    </EtchDialog>
  );
};

export default BulkWithdraw;
