'use client';

import { Box, IconButton, Link, Typography, useMediaQuery } from '@mui/material';

import { GetEthscriptionAssetItem } from '@/services/marketpalce/types';
import { formatAddress } from '@/utils/addressHelper';
import { getTimeAgoString } from '@/utils';
import CopySVG from '@/assets/icons/copy.svg';
import DoneAllOutlinedIcon from '@mui/icons-material/DoneAllOutlined';
import { useCopy } from '@/utils/useCopy';
import { URL_CONFIG } from '@/constants';
import { useChainId } from 'wagmi';
import TokenDisplayView from './TokenDisplayView';

interface ITokenDisplay {
  ethscriptionAsset?: GetEthscriptionAssetItem;
}

const TokenDisplay: React.FC<ITokenDisplay> = ({ ethscriptionAsset }) => {
  const [copyEthsId, setCopyEthsId] = useCopy();
  const [copyCreatorAddr, setCopyCreatorAddr] = useCopy();
  const [copyOwnerAddr, setCopyOwnerAddr] = useCopy();
  const [copySellerAddr, setCopySellerAddr] = useCopy();
  const chainId = useChainId();
  const matches = useMediaQuery('(min-width:750px)');

  const _url = `${URL_CONFIG[chainId].etherscription}/ethscriptions/${ethscriptionAsset?.ethscription.order.ethscriptionId}`;

  const ownerAddress = ethscriptionAsset?.ethscription.order.owner;
  const creatorAddress = ethscriptionAsset?.ethscription.order.creator;
  const sellerAddress = ethscriptionAsset?.ethscription.order.seller;
  const ethscriptionId = ethscriptionAsset?.ethscription.order.ethscriptionId;

  return (
    <Box
      sx={{
        width: matches ? '42%' : '100%',
        height: matches ? '816px' : 'auto',
        padding: '24px 32px',
        boxSizing: 'border-box',
        bgcolor: 'rgba(255, 255, 255, 0.05)',
        borderRadius: '8px',
      }}
    >
      <Box
        sx={{
          width: '100%',
          maxHeight: 'auto',
          minHeight: matches ? '400px' : '300px',
          borderRadius: '12px',
          background: '#09090D',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          overflow: 'hidden',
        }}
      >
        {ethscriptionAsset?.ethscription && <TokenDisplayView ethscription={ethscriptionAsset.ethscription} />}
      </Box>
      <Box
        sx={{
          width: '100%',
          height: '226px',
          display: 'grid',
          gridTemplateColumns: '50% 40%',
          gap: '10px 15px',
          marginTop: '26px',
        }}
      >
        <Box>
          <Typography color={'rgba(255,255,255,0.45)'} sx={{ fontSize: '14px' }}>
            Ethscription Number
          </Typography>
          <Typography color={'rgba(255,255,255,1)'} sx={{ fontSize: '14px' }}>
            {ethscriptionAsset?.ethscription.order.ethscriptionNumber ?? '--'}
          </Typography>
        </Box>
        <Box>
          <Typography color={'rgba(255,255,255,0.45)'} sx={{ fontSize: '14px' }}>
            Ethscription Id
          </Typography>
          <Typography color={'rgba(255,255,255,1)'} sx={{ fontSize: '14px' }}>
            {ethscriptionId ? formatAddress(ethscriptionId) : '--'}
            <IconButton
              size="small"
              onClick={() => {
                setCopyEthsId(ethscriptionId!);
              }}
              sx={{ marginLeft: '5px' }}
            >
              {copyEthsId ? (
                <DoneAllOutlinedIcon sx={{ width: '14px', height: '14px', color: 'rgba(255,255,255,0.45)' }} />
              ) : (
                <CopySVG style={{ color: 'rgba(255,255,255,0.45)' }} />
              )}
            </IconButton>
          </Typography>
        </Box>
        <Box>
          <Typography color={'rgba(255,255,255,0.45)'} sx={{ fontSize: '14px' }}>
            Creator
          </Typography>
          <Typography color={'rgba(255,255,255,1)'} sx={{ fontSize: '14px' }}>
            {creatorAddress ? formatAddress(creatorAddress) : '--'}
            <IconButton
              size="small"
              onClick={() => {
                setCopyCreatorAddr(creatorAddress!);
              }}
              sx={{ marginLeft: '5px' }}
            >
              {copyCreatorAddr ? (
                <DoneAllOutlinedIcon sx={{ width: '14px', height: '14px', color: 'rgba(255,255,255,0.45)' }} />
              ) : (
                <CopySVG style={{ color: 'rgba(255,255,255,0.45)' }} />
              )}
            </IconButton>
          </Typography>
        </Box>
        <Box>
          <Typography color={'rgba(255,255,255,0.45)'} sx={{ fontSize: '14px' }}>
            Owner
          </Typography>
          <Typography color={'rgba(255,255,255,1)'} sx={{ fontSize: '14px' }}>
            {ownerAddress ? formatAddress(ownerAddress) : '--'}
            <IconButton
              size="small"
              onClick={() => {
                setCopyOwnerAddr(ownerAddress!);
              }}
              sx={{ marginLeft: '5px' }}
            >
              {copyOwnerAddr ? (
                <DoneAllOutlinedIcon sx={{ width: '14px', height: '14px', color: 'rgba(255,255,255,0.45)' }} />
              ) : (
                <CopySVG style={{ color: 'rgba(255,255,255,0.45)' }} />
              )}
            </IconButton>
          </Typography>
        </Box>
        {sellerAddress && (
          <Box>
            <Typography color={'rgba(255,255,255,0.45)'} sx={{ fontSize: '14px' }}>
              Seller
            </Typography>
            <Typography color={'rgba(255,255,255,1)'} sx={{ wordWrap: 'break-word', fontSize: '14px' }}>
              {sellerAddress ? formatAddress(sellerAddress) : '--'}
              <IconButton
                size="small"
                onClick={() => {
                  setCopySellerAddr(sellerAddress!);
                }}
                sx={{ marginLeft: '5px' }}
              >
                {copySellerAddr ? (
                  <DoneAllOutlinedIcon sx={{ width: '14px', height: '14px', color: 'rgba(255,255,255,0.45)' }} />
                ) : (
                  <CopySVG style={{ color: 'rgba(255,255,255,0.45)' }} />
                )}
              </IconButton>
            </Typography>
          </Box>
        )}
        <Box>
          <Typography color={'rgba(255,255,255,0.45)'} sx={{ fontSize: '14px' }}>
            Mimetype
          </Typography>
          <Typography color={'rgba(255,255,255,1)'} sx={{ fontSize: '14px' }}>
            {ethscriptionAsset?.ethscription.order.mimetype ?? '--'}
          </Typography>
        </Box>
        <Box>
          <Typography color={'rgba(255,255,255,0.45)'} sx={{ fontSize: '14px' }}>
            Created
          </Typography>
          <Typography color={'rgba(255,255,255,1)'} sx={{ fontSize: '14px' }}>
            {getTimeAgoString(ethscriptionAsset?.ethscription.order.createdAt)}
          </Typography>
        </Box>
        <Box>
          <Typography color={'rgba(255,255,255,0.45)'} sx={{ fontSize: '14px' }}>
            View
          </Typography>
          <Link
            href={_url}
            sx={{
              display: 'flex',
              textDecoration: 'none',
              alignItems: 'center',
              color: '#fff',
              lineHeight: '20px',
              cursor: 'pointer',
            }}
            target="_blank"
          >
            <Typography color={'rgb(48 129 217)'} sx={{ fontSize: '14px' }}>
              ethscriptions.com
            </Typography>
          </Link>
        </Box>
      </Box>
    </Box>
  );
};

export default TokenDisplay;
