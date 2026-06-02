// ============================================================================
// 【app/bulk/BulkSettlement.tsx】批量挂单确认与签名提交面板
// ----------------------------------------------------------------------------
// 作用：展示本次批量挂单的总数和预测收益，用户确认后点击执行批量签名。
// 逻辑流程：
// 1. 等待用户对每个挂单铭文逐一签名 或 执行一次性批量签名挂单逻辑 (evmService.batchListEthscriptions)。
// 2. 将最终签名的订单上报至 EtchMarket 数据库服务器。
// ============================================================================

'use client';

import { Box, Typography, Divider, useMediaQuery } from '@mui/material';
import { useSnapshot } from 'valtio';
import { useState } from 'react';
import BigNumber from 'bignumber.js';
import { useRouter } from 'next/navigation';

import dayjs from 'dayjs';
import FilterSelect from '@/components/FilterSelect';
import EthLogo from '@/assets/icons/eth16.svg';
import * as BulkListingStore from '@/stores/BulkListingStore';

import getTruncate from '@/utils/getTruncate';
import { LoadingButton } from '@mui/lab';
import { useEthersSigner } from '@/hooks/useEthersSigner';
import { evmService } from '@/services';
import { IBulkEthscriptionsItem } from '@/stores/BulkListingStore';
import { ContractReceipt, ethers } from 'ethers';
import { useChainId } from 'wagmi';
import ResultViewSweep from '@/containers/ResultViewSweep';

interface IBulkOperation {}

const BulkSettlement: React.FC<IBulkOperation> = () => {
  const bulkListingStore = useSnapshot(BulkListingStore.store);
  const singer = useEthersSigner();
  const chainId = useChainId();
  const router = useRouter();
  const matches = useMediaQuery('(min-width:750px)');

  const [isSumbit, setIsSubmit] = useState<boolean>(false);
  const [openResult, setOpenResult] = useState<boolean>(false);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);

  const [listTitle, setListTitle] = useState<string>('Listing');
  const [expiration, setExpiration] = useState(dayjs.duration({ months: 1 }).valueOf().toString());

  let serviceFee = '0';
  let creatorRoyalty = '0';
  let totalPrice = '0';
  let quantity = '0';

  bulkListingStore.bulkListEths.forEach((item) => {
    serviceFee = new BigNumber(item.protocol).plus(serviceFee).toString();
    creatorRoyalty = new BigNumber(item.royalty).plus(creatorRoyalty).toString();
    totalPrice = new BigNumber(item.order.price || 0).plus(totalPrice).toString();
    quantity = new BigNumber(item.order.quantity || 0).plus(quantity).toString();
  });

  const totalRevenue = new BigNumber(totalPrice).minus(serviceFee).minus(creatorRoyalty).toString();

  const totalRevenuePrice = new BigNumber(bulkListingStore.ethPriceData?.price || 0)
    .multipliedBy(totalRevenue)
    .toString();

  const isSubmitedDisabled =
    BigNumber(totalRevenue).isNaN() ||
    BigNumber(totalRevenue).lte(0) ||
    bulkListingStore.bulkListEths.some((item) => BigNumber(item.order.price || 0).lte(0));

  async function handleListing() {
    try {
      setIsSubmit(true);

      if (singer && bulkListingStore.orderNonceData?.nonce) {
        if (bulkListingStore.bulkListEths.every((item) => item.order.isDeposit)) {
          setListTitle('Signing');
        } else {
          setListTitle('Depositing');

          await evmService.etchMarket.transferEthscriptionBulk({
            singer,
            to: bulkListingStore.orderNonceData.protocolData.protocolAddress,
            ethscription: bulkListingStore.bulkListEths as unknown as IBulkEthscriptionsItem[],
          });
        }

        bulkListingStore.bulkListEths.forEach((item) => {
          const _eths = {
            ...item,
            order: {
              ...item.order,
              isDeposit: true,
              owner: bulkListingStore?.orderNonceData?.protocolData.protocolAddress!,
            },
          };
          BulkListingStore.updateBulkListEths(_eths);
        });

        // ethscriptionClone.order.unitPriceUsd = totalRevenue.unitPrice;

        setListTitle('Signing');

        const signResult = await evmService.etchMarket.signEthscriptionOrderBulk({
          singer,
          ethscription: bulkListingStore.bulkListEths as unknown as IBulkEthscriptionsItem[],
          chainId,
          expiration,
          orderNonceData: bulkListingStore.orderNonceData,
        });

        if (signResult) {
          setIsSuccess(true);
        }

        // if (result) {
        //   ethscriptionClone.order.isListing = true;
        //   ethscriptionClone.order.nonce = orderNonceData.nonce;
        //   ethscriptionClone.order.price = value;
        //   await onChange('update', 'listing', ethscriptionClone);
        //   setOpen(false);
        // }
      }
    } catch (error) {
      console.log(error);
      setIsSuccess(false);
    } finally {
      setIsSubmit(false);
      setOpenResult(true);
    }
  }

  return (
    <Box
      sx={{
        width: matches ? '420px' : '100%',
        height: '482px',
        borderRadius: '8px',
        border: '1px solid rgba(49, 52, 57, 1)',
        p: '24px',
        boxSizing: 'border-box',
        background: '#202229',
      }}
    >
      <Typography
        sx={{
          fontSize: '16px',
          color: 'rgba(255, 255, 255, 1)',
          fontWeight: '500',
        }}
      >
        Summary
      </Typography>
      <Typography
        sx={{
          fontSize: '12px',
          color: 'rgba(255, 255, 255, 0.45 )',
          fontWeight: '500',
          m: '15px 0 30px 0',
        }}
      >
        {`Listing ${bulkListingStore.bulkListEths.length} items`}
      </Typography>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', height: '36px' }}>
        <Typography sx={{ fontSize: '14px' }}>Expiration</Typography>
        <FilterSelect
          selectList={[
            {
              label: '1 Month',
              value: dayjs.duration({ months: 1 }).valueOf().toString(),
            },
            {
              label: '3 Month',
              value: dayjs.duration({ months: 3 }).valueOf().toString(),
            },
            {
              label: '6 Month',
              value: dayjs.duration({ months: 6 }).valueOf().toString(),
            },
            {
              label: '12 Month',
              value: dayjs.duration({ months: 12 }).valueOf().toString(),
            },
          ]}
          onSelect={(item) => {
            setExpiration(item.value);
          }}
        />
      </Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', height: '36px' }}>
        <Typography sx={{ fontSize: '14px' }}>Service Fee</Typography>
        <Typography sx={{ fontSize: '14px', display: 'flex', alignItems: 'center' }}>
          {serviceFee}
          <EthLogo />
        </Typography>
      </Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', height: '36px' }}>
        <Typography sx={{ fontSize: '14px' }}>Creator Royalty</Typography>
        <Typography sx={{ fontSize: '14px', display: 'flex', alignItems: 'center' }}>
          {creatorRoyalty} <EthLogo />
        </Typography>
      </Box>
      <Divider sx={{ m: '25px 0' }} />
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', height: '36px' }}>
        <Typography sx={{ fontSize: '14px', flex: 1 }}>Total Revenue</Typography>
        <Typography sx={{ fontSize: '14px', color: '#E5FF65' }}>{getTruncate(totalRevenue || '0', 2)}</Typography>
        <EthLogo />
      </Box>
      <Typography sx={{ fontSize: '14px', color: '#E5FF65', textAlign: 'right', mb: '20px' }}>{`≈ $${getTruncate(
        totalRevenuePrice,
        2,
      )}`}</Typography>
      <LoadingButton
        variant="contained"
        fullWidth
        loadingPosition="start"
        disableElevation
        loading={isSumbit}
        disabled={isSubmitedDisabled}
        color="primary"
        sx={{
          width: '100%',
          borderRadius: '46px',
          height: '40px',
          fontSize: '14px',
          fontWeight: 500,
          textTransform: 'capitalize',
          mb: '12px',
          '&.Mui-disabled': {
            background: '#e5ff6566',
          },
        }}
        onClick={handleListing}
      >
        {listTitle}
      </LoadingButton>
      <Typography
        sx={{
          fontSize: '12px',
          color: 'rgba(255, 255, 255, 0.65)',
        }}
      >
        Input valid prices for all the items you want to Listing
      </Typography>
      <ResultViewSweep
        title="Confirmation"
        open={openResult}
        onClose={async () => {
          setOpenResult(false);
          if (isSuccess) {
            BulkListingStore.clearAllEthsciption();
            router.back();
          }
        }}
        isSuccess={isSuccess}
      />
    </Box>
  );
};

export default BulkSettlement;
