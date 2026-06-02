import { Box, IconButton, Link, Typography } from '@mui/material';
import toast from 'react-hot-toast';

import SuccessSVG from '@/assets/icons/success32.svg';
import WarnSVG from '@/assets/icons/warn32.svg';

import LinkSVG from '@/assets/icons/sharp.svg';
import { ethers } from 'ethers';
import { URL_CONFIG } from '@/constants';

export const toastResult = ({
  receipt,
  type,
  chainId,
}: {
  receipt?: ethers.ContractReceipt;
  type: 'success' | 'fail';
  chainId: number;
}) => {
  if (type == 'fail') {
    toast.custom(
      <Box
        sx={{
          width: '380px',
          display: 'flex',
          alignItems: 'center',
          padding: '16px',
          border: '1px solid #2F343E',
          borderRadius: '8px',
          background: '#202229',
        }}
      >
        <WarnSVG style={{ marginRight: '12px' }} />
        <Typography sx={{ color: '#FFF' }}>Transaction Failed</Typography>
      </Box>,
    );
    return;
  }

  if (type == 'success') {
    toast.custom(
      <Box
        sx={{
          width: '380px',
          display: 'flex',
          alignItems: 'center',
          padding: '16px',
          border: '1px solid #2F343E',
          borderRadius: '8px',
          background: '#202229',
        }}
      >
        {receipt?.status == 1 ? (
          <SuccessSVG style={{ marginRight: '12px' }} />
        ) : (
          <WarnSVG style={{ marginRight: '12px' }} />
        )}
        <Box>
          <Typography sx={{ color: '#FFF' }}>Transaction Succed</Typography>
          <Link
            sx={{ display: 'flex', alignItems: 'center' }}
            href={`${URL_CONFIG[chainId].etherScanUrl}/tx/${receipt?.transactionHash}`}
            target="_blank"
          >
            <Typography sx={{ color: 'rgba(255,255,255,0.6)' }}>View on explorer</Typography>
            <IconButton>
              <LinkSVG />
            </IconButton>
          </Link>
        </Box>
      </Box>,
    );
    return;
  }
};
