'use client';

import { Box } from '@mui/material';

import ConfirmRedeem from './ConfirmRedeem';
import { useEthscriptionBoxContext } from '../EthscriptionBox/EthscriptionBoxContext';
import { ethers } from 'ethers';
import { useAccount } from 'wagmi';

const EthscriptionBoxFooter = () => {
  const { address } = useAccount();
  const { ethscription } = useEthscriptionBoxContext();

  const isOwner =
    ethscription?.order.owner &&
    address &&
    ethers.utils.getAddress(ethscription.order.owner) == ethers.utils.getAddress(address);
  return (
    isOwner && (
      <Box>
        <ConfirmRedeem />
      </Box>
    )
  );
};

export default EthscriptionBoxFooter;
