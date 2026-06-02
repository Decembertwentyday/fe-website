'use client';

import { Box, Button, Typography, useMediaQuery } from '@mui/material';
import { ethers } from 'ethers';

import TokenBuy from './TokenBuy';
import { isValidJSON, splitDatauri } from '@/utils';
import TokenActivity from './TokenActivity';
import { GetEthscriptionAssetItem } from '@/services/marketpalce/types';
import { formatAddress } from '@/utils/addressHelper';
import { useAccount } from 'wagmi';
import NftImage from '@/components/NftImage';
import TokenDisplayView from './TokenDisplayView';
import SwooshGreenSVG from '@/assets/images/swoosh-icon-green.svg';

interface ITokenDetails {
  ethscriptionAsset?: GetEthscriptionAssetItem;
}

const TokenDetails: React.FC<ITokenDetails> = ({ ethscriptionAsset }) => {
  const { address } = useAccount();
  const matches = useMediaQuery('(min-width:750px)');

  const category = ethscriptionAsset?.ethscription.order.category;
  const mimetype = ethscriptionAsset?.ethscription.order.mimetype;
  // const content = ethscriptionAsset?.ethscription.order.content.replace('data:,', '');
  const content = ethscriptionAsset?.ethscription.order.content.replace(/data:(.*?,)|data:,/, '');
  const collectionName = ethscriptionAsset?.ethscription.order.collectionName;

  let parsedContent: any;
  if (content) {
    if (category === 'token') {
      parsedContent = JSON.parse(content);
    } else if (category === 'domain') {
      parsedContent = content;
    }
  }

  const ownerAddress = ethscriptionAsset?.ethscription.order.owner;

  const isYou =
    address &&
    ethscriptionAsset?.ethscription.order.owner &&
    ethers.utils.getAddress(address) == ethers.utils.getAddress(ethscriptionAsset?.ethscription.order.owner);

  function displayCategoryName() {
    if (category === 'token') {
      if (mimetype && ['application/json'].includes(mimetype)) {
        return parsedContent.tick;
      }
    }

    if (category === 'text') {
      if (mimetype && ['application/json'].includes(mimetype)) {
        if (collectionName !== '') {
          return collectionName;
        }
        return 'Ethscription';
      }
      if (mimetype && mimetype.startsWith('text/html')) {
        if (collectionName !== '') {
          return collectionName;
        }
        return 'Ethscription';
      }
      if (content?.includes('esip6')) {
        if (collectionName !== '') {
          return collectionName;
        }
        return 'Ethscription';
      }
    }

    if (category === 'domain') {
      return parsedContent;
    }
    if (category && ['image', 'nft'].includes(category)) {
      if (collectionName !== '') {
        return collectionName;
      }
      return 'Ethscription';
    }
  }

  return (
    <Box
      sx={{
        width: matches ? '58%' : '100%',
        height: matches ? '816px' : 'auto',
        padding: '12px 32px',
        boxSizing: 'border-box',
        bgcolor: 'rgba(255, 255, 255, 0.05)',
        borderRadius: '8px',
        flex: '1',
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: '9px' }}>
        <Box sx={{ fontSize: '20px', fontWeight: '700', color: '#fff' }}>{displayCategoryName()}</Box>
        {category !== 'domain' && (
          <Typography sx={{ fontSize: '12px', color: '#fff', opacity: '0.45' }}>
            {`#${ethscriptionAsset?.ethscription.order.ethscriptionNumber}`}
          </Typography>
        )}
        {category === 'token' && ethscriptionAsset?.ethscription.order.isVerified && <SwooshGreenSVG />}
      </Box>
      <Box
        sx={{
          mt: matches ? '0' : '10px',
          display: 'flex',
          columnGap: '24px',
          flexWrap: 'wrap',
          alignItems: matches ? 'center' : 'flex-start',
        }}
      >
        {collectionName && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <Typography sx={{ fontSize: '14px', color: '#fff', opacity: '0.45' }}>Collection</Typography>
            <Typography sx={{ fontSize: '14px', color: '#fff' }}>{collectionName ?? '--'}</Typography>
          </Box>
        )}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
          <Typography sx={{ fontSize: '14px', color: '#fff', opacity: '0.45' }}>Category</Typography>
          <Typography sx={{ fontSize: '14px', color: '#fff' }}>
            {ethscriptionAsset?.ethscription.order.category ?? '--'}
          </Typography>
        </Box>
        <Box sx={{ fontSize: '14px', display: 'flex', alignItems: 'center', gap: '5px' }}>
          <Typography sx={{ fontSize: '14px', color: '#fff', opacity: '0.45' }}>Owner</Typography>
          <Typography sx={{ fontSize: '14px', color: '#fff' }}>
            {ownerAddress ? formatAddress(ownerAddress) : '--'}
          </Typography>
        </Box>
      </Box>
      {ethscriptionAsset?.ethscription.order.isListing && !isYou && (
        <TokenBuy ethscription={ethscriptionAsset?.ethscription} />
      )}

      <TokenActivity />
    </Box>
  );
};

export default TokenDetails;
