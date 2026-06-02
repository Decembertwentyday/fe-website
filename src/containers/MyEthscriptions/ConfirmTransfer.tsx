// ============================================================================
// 【ConfirmTransfer.tsx】确认转移（Transfer）铭文弹窗组件
// ----------------------------------------------------------------------------
// 作用：将选定的铭文转移给其它钱包地址。
// 逻辑流程：
// 1. 输入目标钱包地址 (TO)。
// 2. 调用 evmService.transferEthscription 并在链上执行转移铭文逻辑。
// 3. 转移成功后触发界面更新（onChange），该铭文会从当前钱包资产列表中消失。
// ============================================================================

'use client';

import { useRef, useState } from 'react';
import { Box, Button, InputAdornment, OutlinedInput, Typography } from '@mui/material';
import LoadingButton from '@mui/lab/LoadingButton';

import EtchDialog from '@/components/EtchDialog';
import { useEthscriptionBoxContext } from '@/containers/EthscriptionBox/EthscriptionBoxContext';
import { evmService } from '@/services';
import { useEthersSigner } from '@/hooks/useEthersSigner';
import EthscriptionView from '../EthscriptionBox/EthscriptionView';
import EthscriptionLabel from '@/components/EthscriptionLabel';
import { MenuItem } from './MoreMenuButton';

interface IConfirmTransfer {
  open: boolean;
  onClose: (flag: MenuItem['value']) => void;
}

const ConfirmTransfer: React.FC<IConfirmTransfer> = ({ open, onClose }) => {
  const { ethscription, onChange } = useEthscriptionBoxContext();
  const singer = useEthersSigner();
  const [isDisabled, setIsDisabled] = useState<boolean>(false);
  const [isSumbit, setIsSubmit] = useState<boolean>(false);

  const inputRef = useRef<HTMLInputElement>();

  if (ethscription === null) return null;

  async function handleTransefr() {
    try {
      setIsSubmit(true);
      if (inputRef!.current?.value && singer && ethscription?.order) {
        await evmService.etchMarket.transferEthscription({
          singer,
          ethscription: ethscription!,
          to: inputRef.current.value,
        });
        await onChange('remove', 'transfer', ethscription);
        onClose('transfer');
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
        onClose('transfer');
      }}
      title={
        <Box
          sx={{
            display: 'flex',
            alignItems: { xs: 'flex-start', md: 'center' },
            flexDirection: { xs: 'column', md: 'row' },
            gap: { xs: '0px', md: '5px' },
          }}
        >
          <Typography>Transfer</Typography>
          <EthscriptionLabel
            collectionName={ethscription.order.collectionName}
            category={ethscription.order.category}
            icon={ethscription.order.content}
          />
          <Typography>for address</Typography>
        </Box>
      }
      footer={
        <Box sx={{ display: 'flex', alignItems: 'center', gap: '26px' }}>
          <Button
            onClick={() => {
              onClose('transfer');
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
            disabled={isDisabled}
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
        <Box
          sx={{
            // width: 'max-content',
            minWidth: '160px',
            maxWidth: '200px',
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
            alignItems: 'center',
            flexDirection: 'column',
            position: 'relative',
          }}
        >
          <OutlinedInput
            startAdornment={<InputAdornment position="start">To</InputAdornment>}
            inputRef={inputRef}
            onInput={(event) => {
              const _value = inputRef.current?.value.trim() ?? '';
              setIsDisabled(_value === '');
            }}
            sx={{
              width: { xs: '100%', md: '355px' },
              height: '48px',
              bgcolor: 'rgba(32, 34, 41, 1)',
              '&.MuiOutlinedInput-root': {
                fontSize: '12px',
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
        </Box>
      </Box>
    </EtchDialog>
  );
};

export default ConfirmTransfer;
