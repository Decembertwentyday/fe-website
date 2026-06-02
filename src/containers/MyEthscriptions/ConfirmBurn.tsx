// ============================================================================
// 【ConfirmBurn.tsx】确认销毁（Burn）操作弹窗
// ----------------------------------------------------------------------------
// 作用：将当前铭文转移到黑洞地址 (0x0...0) 或执行指定的烧毁逻辑。
// 注意：仅限特定的 Collection 或 Token 支持此类显式销毁，或者通过转移至 0 地址实现。
// ============================================================================

'use client';

import { Fragment, useState } from 'react';
import { Box, Button, Typography } from '@mui/material';
import LoadingButton from '@mui/lab/LoadingButton';
import { useSnapshot } from 'valtio';

import EtchDialog from '@/components/EtchDialog';
import { useEthscriptionBoxContext } from '@/containers/EthscriptionBox/EthscriptionBoxContext';
import { evmService } from '@/services';
import { useEthersSigner } from '@/hooks/useEthersSigner';
import EthscriptionView from '../EthscriptionBox/EthscriptionView';
import { MenuItem } from './MoreMenuButton';
import * as GlobalStore from '@/stores/GlobalStore';

interface IConfirmBurn {
  open: boolean;
  onClose: (flag: MenuItem['value']) => void;
}

const ConfirmBurn: React.FC<IConfirmBurn> = ({ open, onClose }) => {
  const globalStore = useSnapshot(GlobalStore.store);
  const { ethscription, onChange } = useEthscriptionBoxContext();
  const singer = useEthersSigner();
  const [isSumbit, setIsSubmit] = useState<boolean>(false);

  if (ethscription === null) return null;

  async function handleTransefr() {
    try {
      setIsSubmit(true);
      if (singer && ethscription?.order) {
        await evmService.etchMarket.transferEthscription({
          singer,
          ethscription: ethscription!,
          to: '0x0000000000000000000000000000000000000000',
        });
        await onChange('remove', 'burn', ethscription);
        onClose('burn');
      }
    } catch (error) {
    } finally {
      setIsSubmit(false);
    }
  }

  return (
    <EtchDialog
      open={open}
      onClose={() => {
        onClose('burn');
      }}
      title="Confirmation"
      footer={
        <Box sx={{ display: 'flex', alignItems: 'center', gap: '26px' }}>
          <Button
            onClick={() => {
              onClose('burn');
            }}
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
            fullWidth
            disableElevation
            loading={isSumbit}
            color="primary"
            onClick={handleTransefr}
            variant="contained"
            sx={{
              height: '40px',
              fontSize: '14px',
              fontWeight: 500,
              textTransform: 'capitalize',
              '&.Mui-disabled': {
                background: '#e5ff6566',
              },
            }}
          >
            Burn
          </LoadingButton>
        </Box>
      }
    >
      <Box
        sx={{
          p: '40px 0',
        }}
      >
        <Box
          sx={{
            width: 'max-content',
            minWidth: '160px',
            margin: '0 auto',
            background: 'rgba(32, 34, 41, 1)',
            borderRadius: '8px',
          }}
        >
          <EthscriptionView ethscription={ethscription} />
          <Box
            sx={{
              width: '100%',
              height: '54px',
              background: 'rgba(255, 255, 255, 0.05)',
              borderRadius: '0 0 8px 8px',
            }}
          >
            <Typography
              sx={{ lineHeight: '54px', textAlign: 'center', textDecoration: 'underline' }}
            >{`#${ethscription.order.ethscriptionNumber}`}</Typography>
          </Box>
        </Box>
        <Box
          sx={{
            pt: '20px',
            display: 'flex',
            justifyContent: 'center',
          }}
        >
          {`You will receive ${ethscription.order.quantity} eths as available balance`}
        </Box>
      </Box>
    </EtchDialog>
  );
};

export default ConfirmBurn;
