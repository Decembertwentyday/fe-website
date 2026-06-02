'use client';

import { useMemo } from 'react';
import { GetRecentEthsItem } from '@/services/ethscriptions/types';
import { getTimeAgoString, isValidJSON, splitDatauri } from '@/utils';
import { Box } from '@mui/material';
import Link from 'next/link';

import SwooshGreenSVG from '@/assets/images/swoosh-icon-green.svg';
import { formatAddress } from '@/utils/addressHelper';
import { useRouter } from 'next/navigation';
import EthsView from '@/components/EthsView';

const EthsCard: React.FC<{ ethscription: GetRecentEthsItem; chainId: number }> = ({ ethscription, chainId }) => {
  const HtmlDataUrlPre = 'data:text/html';

  const [data, isJson, isImage, isHtml] = useMemo(() => {
    // html detection priority is the highest, and both  image type and text type may contain it
    if (ethscription.data.includes(HtmlDataUrlPre)) {
      return [ethscription.data, false, false, true];
    }
    if (ethscription.category === 'nft') {
      return [ethscription.data, false, true, false];
    }
    if (ethscription.category === 'domain') {
      return [splitDatauri(ethscription.data)[1], false, false, false];
    }
    if (ethscription.category === 'image') {
      return [ethscription.data, false, true, false];
    }
    if (ethscription.category === 'token') {
      const [pre, tokenData] = splitDatauri(ethscription.data);
      if (isValidJSON(tokenData)) {
        const json = JSON.parse(tokenData);
        const isValueType = ['number', 'string'].includes(typeof json);
        return [JSON.stringify(json, null, 2), !isValueType, false, false];
      }
      return [ethscription.data, false, false, false];
    }
    const [pre, dataPart] = splitDatauri(ethscription.data);
    if (ethscription.category === 'text') {
      if (pre.includes('image/')) {
        return [ethscription.data, false, true, false];
      }

      if (isValidJSON(dataPart)) {
        const json = JSON.parse(dataPart);
        const isValueType = ['number', 'string'].includes(typeof json);
        return [JSON.stringify(json, null, 2), !isValueType, false, false];
      }
      return [dataPart, false, false, false];
    }

    return ['', false, false, false];
  }, [ethscription]);

  return (
    <Box
      sx={{
        position: 'relative',
        width: '100%',
        borderRadius: '8px',
        border: '1px solid #2F343E',
        overflow: 'hidden',
        transition: 'all 0.8s',
        display: 'flex',
        flexDirection: 'column',
        height: '265px',
        background: '#2c2d34',
        paddingBottom: '4px',
        '&:hover': {
          borderColor: '#D5E970',
          cursor: 'pointer',
        },
      }}
    >
      <Link
        href={`/ethscriptions/${ethscription.ethscriptionId}`}
        style={{
          textDecoration: 'none',
          color: '#fff',
        }}
      >
        <Box
          sx={{
            height: '191px',
            overflow: isHtml ? 'auto' : 'hidden',
            background: '#202229',
            display: 'flex',
            justifyContent: isJson ? 'flex-start' : 'center',
          }}
        >
          <EthsView category={isImage ? 'image' : ethscription.category} data={data} isHtml={isHtml} isJson={isJson} />
        </Box>
      </Link>
      <Box sx={{ p: '16px', fontSize: '14px', background: '#2c2d34' }}>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            fontSize: '14px',
            mb: '4px',
          }}
        >
          <Box> #{ethscription.confirmed ? ethscription.ethscriptionNumber : 'Unconfirmed'}</Box>
          <Box>{formatAddress(ethscription.creator)}</Box>
        </Box>
        <Box
          color={'rgba(255,255,255,0.45)'}
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <Box fontSize={'12px'}> Created {getTimeAgoString(ethscription.blockTime)}</Box>
          {ethscription.verified && <SwooshGreenSVG style={{ fontSize: '14px' }} />}
        </Box>
      </Box>
    </Box>
  );
};

export default EthsCard;
