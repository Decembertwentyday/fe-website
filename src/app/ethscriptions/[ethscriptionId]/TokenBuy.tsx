'use client';

import { Box, Button, Divider, Typography } from '@mui/material';
import { useEffect, useState } from 'react';

import { GetEthscriptionAssetItem, GetEthscriptionsItem } from '@/services/marketpalce/types';
import ComfirmBuy from '@/containers/ListedList/ConfirmBuy';

interface ITokenBuy {
  ethscription?: GetEthscriptionAssetItem['ethscription'];
}

const TokenBuy: React.FC<ITokenBuy> = ({ ethscription }) => {
  const price = ethscription?.order.price;
  const priceUsd = Number(ethscription?.order.priceUsd).toFixed(2);

  return (
    <Box
      sx={{
        width: '100%',
        height: '120px',
        padding: '20px 24px',
        boxSizing: 'border-box',
        borderRadius: '8px',
        background: ' rgba(255, 255, 255, 0.05)',
        marginTop: '24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}
    >
      <Box>
        <Typography sx={{ fontSize: '14px', color: 'rgba(255, 255, 255, 0.60)' }}>Current Price</Typography>
        <Typography sx={{ fontSize: '32px', color: '#F3F3F8' }}>
          {price}
          <img style={{ width: '24px', height: '24px' }} src="https://etchmarket.s3.amazonaws.com/eth.svg" alt="" />
        </Typography>
        <Typography sx={{ fontSize: '14px', color: 'rgba(255, 255, 255, 0.45)' }}>{`$${priceUsd}`}</Typography>
      </Box>
      <ComfirmBuy
        ethscription={ethscription}
        sx={{
          width: '124px',
          textTransform: 'capitalize',
          color: '#171A1F',
          fontSize: '14px',
          background: '#D5E970',
          flex: 'unset',
        }}
      />
    </Box>
  );
};

export default TokenBuy;
