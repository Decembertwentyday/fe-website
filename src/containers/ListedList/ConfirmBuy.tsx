// ============================================================================
// 【ConfirmBuy.tsx】列表卡片上的直接购买（Buy）弹窗及按钮
// ----------------------------------------------------------------------------
// 作用：不经过购物车，点击卡片的 Buy Now 直接发起购买。
// 流程：
// 1. 判断是否连着钱包（未连调出登入窗口）。
// 2. 也是判断不要买自己的挂单。
// 3. 弹窗二次确认，展示该单据详情。
// 4. 调用 evmService 的 etchMarket.buy 传递单据签名完成购买交易。
// 5. 交易结束后弹出操作结果（ResultView）展示。
// ============================================================================

'use client';

import { Fragment, useState } from 'react';
import { Box, Button, Divider, SxProps, Typography } from '@mui/material';
import { useAccount } from 'wagmi';
import { ethers } from 'ethers';
import { LoadingButton } from '@mui/lab';

import EtchDialog from '@/components/EtchDialog';
import { evmService } from '@/services';
import { useEthersSigner } from '@/hooks/useEthersSigner';
import WalletConnectButton from '@/components/WalletConnectButton';
import ResultView from '../ResultView';
import EthscriptionView from '../EthscriptionBox/EthscriptionView';
import { GetEthscriptionsItem } from '@/services/marketpalce/types';
import * as EthscriptionsStore from '@/stores/EthscriptionsStore';
import { useSnapshot } from 'valtio';

interface IConfirmBuy {
  ethscription?: GetEthscriptionsItem;
  sx?: SxProps;
}

const ComfirmBuy: React.FC<IConfirmBuy> = ({ ethscription, sx }) => {
  const ethscriptionsStore = useSnapshot(EthscriptionsStore.store);
  const [open, setOpen] = useState<boolean>(false);
  const [openResult, setOpenResult] = useState<boolean>(false);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);

  const [isSumbit, setIsSubmit] = useState<boolean>(false);
  const singer = useEthersSigner();
  const { address } = useAccount();

  if (ethscription === null) return null;

  const isYou =
    address &&
    ethscription?.order.owner &&
    ethers.utils.getAddress(address) == ethers.utils.getAddress(ethscription.order.owner);

  async function handleBuy() {
    try {
      setIsSubmit(true);
      const result = await evmService.etchMarket.buyEthscription({ singer: singer!, ethscription: ethscription! });
      if (result) {
        setIsSuccess(true);
      }
    } catch (error) {
      console.log(error);
      setIsSuccess(false);
    } finally {
      setOpen(false);
      setIsSubmit(false);
      setOpenResult(true);
    }
  }

  async function handleRemoveSignleEthscript() {
    const _ethscriptions = ethscriptionsStore.listedList.ethscriptions.filter((item) => {
      if (
        item.order.ethscriptionId == ethscription?.order.ethscriptionId &&
        item.order.category == ethscription?.order.category &&
        item.order.collectionName == ethscription?.order.collectionName
      ) {
        return false;
      } else {
        return true;
      }
    });
    EthscriptionsStore.setListedList({
      ...ethscriptionsStore.listedList,
      ethscriptions: _ethscriptions,
    });
  }

  return (
    <Fragment>
      <Button
        disabled={ethscription?.order.isUnconfirmed}
        variant="outlined"
        sx={{
          flex: 1,
          height: '36px',
          mt: '13px',
          borderRadius: '46px',
          border: '1px solid #D5E970',
          textTransform: 'none',
          '&:hover': {
            color: '#000',
            bgcolor: 'rgba(229, 255, 101, 1)',
          },
          ...sx,
        }}
        onClick={(e) => {
          e.stopPropagation();
          setOpen(true);
        }}
      >
        {ethscription?.order.isUnconfirmed ? 'Unconfirmed' : 'Buy'}
      </Button>
      <EtchDialog
        open={open}
        onClose={() => {
          setOpen(false);
        }}
        title="Checkout"
        footer={
          <Box sx={{ display: 'flex', alignItems: 'center', gap: '26px' }}>
            <Button
              onClick={(e) => {
                e.stopPropagation();
                setOpen(false);
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
            <WalletConnectButton>
              <LoadingButton
                variant="contained"
                fullWidth
                disableElevation
                loading={isSumbit}
                disabled={Boolean(isYou)}
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
                onClick={handleBuy}
              >
                Buy
              </LoadingButton>
            </WalletConnectButton>
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
            <EthscriptionView ethscription={ethscription!} />
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
              >{`#${ethscription?.order.ethscriptionNumber}`}</Typography>
            </Box>
          </Box>
          <Box sx={{ pt: '20px' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', lineHeight: '40px' }}>
              <Box sx={{ fontSize: '14px' }}>Price</Box>
              <Box sx={{ fontSize: '16px' }}>
                {ethscription?.order.price}
                <Typography display={'inline'} sx={{ ml: '3px' }}>
                  {ethscription?.payment.name}
                </Typography>
              </Box>
            </Box>
          </Box>
          <Divider />
          <Box sx={{ pt: '20px' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', lineHeight: '40px', position: 'relative' }}>
              <Box sx={{ fontSize: '14px' }}>You Pay</Box>
              <Box sx={{ fontSize: '16px', color: 'rgba(229, 255, 101, 1)' }}>
                {`${ethscription?.order.price} ${ethscription?.payment.name}`}
                <Typography
                  display={'inline'}
                  sx={{
                    fontSize: '12px',
                    color: 'rgba(255, 255, 255, 1)',
                    ml: '3px',
                    position: 'absolute',
                    right: '0',
                    bottom: '-10px',
                  }}
                >
                  {`$${Number(ethscription?.order.priceUsd).toFixed(2)}`}
                </Typography>
              </Box>
            </Box>
          </Box>
        </Box>
      </EtchDialog>
      <ResultView
        title="Checkout"
        isSuccess={isSuccess}
        open={openResult}
        onClose={async () => {
          if (isSuccess) {
            await handleRemoveSignleEthscript();
          }
          setOpenResult(false);
        }}
        ethscription={ethscription}
      />
    </Fragment>
  );
};

export default ComfirmBuy;
