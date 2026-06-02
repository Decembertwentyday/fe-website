// ============================================================================
// 【BulkTransfer.tsx】批量转移（Bulk Transfer）弹窗组件
// ----------------------------------------------------------------------------
// 作用：用户在批量操作模式下选定多个铭文后，输入同一个目标地址，一次性转移多张铭文。
// 流程：
// 1. 获取 BulkListingStore 中已选中的铭文列表。
// 2. 输入目标以太坊钱包地址并做规范验证。
// 3. 点击【Transfer】向合约发起多张铭文的转移动作 `transferMultipleEthscriptions`。
// ============================================================================

'use client';

import { Box, Button, Typography, OutlinedInput } from '@mui/material';
import { useState } from 'react';
import { useSnapshot } from 'valtio';
import { LoadingButton } from '@mui/lab';
import { ethers } from 'ethers';

import * as BulkListingStore from '@/stores/BulkListingStore';
import * as EthscriptionsStore from '@/stores/EthscriptionsStore';
import EtchDialog from '@/components/EtchDialog';
// import EthscriptionLabel from '@/components/EthscriptionLabel';
import EthsLabelCard from '@/components/EthsLabelCard';
import { evmService } from '@/services';
import { useEthersSigner } from '@/hooks/useEthersSigner';
import { IBulkEthscriptionsItem } from '@/stores/BulkListingStore';

interface IBulkTransfer {
  title: React.ReactNode;
  open: boolean;
  onClose: () => void;
}

const BulkTransfer: React.FC<IBulkTransfer> = ({ open, onClose, title }) => {
  const bulkListingStore = useSnapshot(BulkListingStore.store);
  const singer = useEthersSigner();
  const [value, setValue] = useState<string>('');
  const [isSumbit, setIsSubmit] = useState<boolean>(false);
  const [isDisabled, setIsDisabled] = useState<boolean>(true);

  async function handleTransfer() {
    try {
      setIsSubmit(true);
      await evmService.etchMarket.transferEthscriptionBulk({
        singer: singer!,
        to: value,
        ethscription: bulkListingStore.bulkTransferEths as unknown as IBulkEthscriptionsItem[],
      });
      EthscriptionsStore.removeOwnerItem(bulkListingStore.bulkTransferEths as IBulkEthscriptionsItem[]);
      BulkListingStore.clearAllEthsciption();
      onClose();
    } catch (error) {
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
            disabled={isDisabled}
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
            onClick={handleTransfer}
          >
            Transfer
          </LoadingButton>
        </Box>
      }
    >
      <Box
        sx={{
          p: '40px 0',
        }}
      >
        <Typography>{`Items(${bulkListingStore.ethsList.length})`}</Typography>
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(200px,1fr))',
            gap: '20px',
            m: '20px 0',
            minHeight: '54px',
            maxHeight: '128px',
            overflowY: 'scroll',
            '&::-webkit-scrollbar-thumb': {
              backgroundColor: '#a5a9b5',
            },
          }}
        >
          {bulkListingStore.bulkTransferEths.map((item) => {
            return (
              <Box
                sx={{
                  boxSizing: 'border-box',
                  p: '6px 12px',
                  borderRadius: '8px',
                  background: 'rgba(255, 255, 255, 0.10)',
                }}
                key={item.order.ethscriptionNumber}
              >
                <EthsLabelCard category={item.order.category} ethscription={item} />
              </Box>
            );
          })}
        </Box>
        <Box>
          <Typography sx={{ fontSize: '16px', mb: '12px' }}>Send to</Typography>
          <OutlinedInput
            value={value}
            onChange={(event) => {
              const _value = event.target.value.trim() ?? '';
              setIsDisabled(!ethers.utils.isAddress(_value));
              setValue(_value);
            }}
            fullWidth
            placeholder={'0x...address'}
            sx={{
              height: '56px',
              border: '1px solid rgba(255, 255, 255, 0.10)',
              background: '#202229',
              '&.MuiOutlinedInput-root': {
                fontSize: '14px',
                fieldset: {
                  borderColor: 'transparent',
                },
                '&:hover fieldset': {
                  borderColor: 'rgba(255, 255, 255, 0.45)',
                  borderWidth: '1px',
                },
                '&.Mui-focused fieldset': {
                  borderColor: '#E5FF65',
                  borderWidth: '1px',
                },
              },
            }}
          />
          {isDisabled && value.trim() !== '' && (
            <Typography sx={{ fontSize: '14px', color: 'rgba(244, 7, 7, 0.5)' }}>Check Input Address</Typography>
          )}
          <Typography sx={{ fontSize: '14px', mt: '12px', color: 'rgba(255,255,255,0.5)' }}>
            WARNING: You will not be able to retrieve the transferred Ethscriptions after the transaction.
          </Typography>
        </Box>
      </Box>
    </EtchDialog>
  );
};

export default BulkTransfer;
