// ============================================================================
// 【BundleSale.tsx】打包出售（Bundle Sale）弹窗组件（扩展预留）
// ----------------------------------------------------------------------------
// 作用：将选定的多个铭文打成一个包裹进行一整笔交易及唯一定价出售（类似 OpenSea Bundle）。
// ============================================================================

'use client';

import { Box, Button, Typography } from '@mui/material';
import { useState } from 'react';
import { useSnapshot } from 'valtio';
import { LoadingButton } from '@mui/lab';

import * as BulkListingStore from '@/stores/BulkListingStore';
import * as EthscriptionsStore from '@/stores/EthscriptionsStore';
import EtchDialog from '@/components/EtchDialog';
import EthsLabelCard from '@/components/EthsLabelCard';
import { evmService } from '@/services';
import { useEthersSigner } from '@/hooks/useEthersSigner';
import { GetEthscriptionsItem } from '@/services/marketpalce/types';
import { IBulkEthscriptionsItem } from '@/stores/BulkListingStore';

interface IBundleSale {
  title: React.ReactNode;
  open: boolean;
  onClose: () => void;
}

const BundleSale: React.FC<IBundleSale> = ({ open, onClose, title }) => {
  const bulkListingStore = useSnapshot(BulkListingStore.store);
  const singer = useEthersSigner();
  const [isSumbit, setIsSubmit] = useState<boolean>(false);

  async function handleUnlist() {
    try {
      setIsSubmit(true);
      await evmService.etchMarket.cancelMultipleMakerOrders({
        singer: singer!,
        ethscription: bulkListingStore.bulkUnlistEths as unknown as GetEthscriptionsItem[],
      });
      EthscriptionsStore.removeOwnerItem(bulkListingStore.bulkUnlistEths as IBulkEthscriptionsItem[]);
      BulkListingStore.clearAllEthsciption();
      onClose();
    } catch (error) {
    } finally {
      setIsSubmit(false);
    }

    // ethscription!.order.isDeposit = true;
    // ethscription!.order.isListing = false;
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
            onClick={handleUnlist}
          >
            Unlist
          </LoadingButton>
        </Box>
      }
    >
      <Box
        sx={{
          p: '40px 0',
        }}
      >
        <Typography>{`Items(${bulkListingStore.bulkUnlistEths.length})`}</Typography>
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
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
          {bulkListingStore.bulkUnlistEths.map((item) => {
            return (
              <Box
                sx={{
                  p: '6px 12px',
                  borderRadius: '8px',
                  background: 'rgba(255, 255, 255, 0.10)',
                }}
                key={item.order.ethscriptionNumber}
              >
                <EthsLabelCard ethscription={item} category={item.order.category} />
              </Box>
            );
          })}
        </Box>
        <Typography sx={{ fontSize: '16px' }}>Are sure to unlist all the items?</Typography>
      </Box>
    </EtchDialog>
  );
};

export default BundleSale;
