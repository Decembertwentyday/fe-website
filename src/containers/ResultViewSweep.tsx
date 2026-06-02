import { Box, Link, Typography, useMediaQuery } from '@mui/material';
import EtchDialog from '@/components/EtchDialog';
import { Fragment } from 'react';
import { useChainId } from 'wagmi';
import { ContractReceipt } from 'ethers';

import SuccessSVG from '@/assets/icons/success.svg';
import FailSVG from '@/assets/icons/fail.svg';
import { URL_CONFIG } from '@/constants';

interface IResultViewSweep {
  title: React.ReactNode;
  txResult?: ContractReceipt;
  isSuccess: boolean;
  open: boolean;
  onClose: () => void;
}

const ResultViewSweep: React.FC<IResultViewSweep> = ({ isSuccess, txResult, title, open, onClose }) => {
  const chainId = useChainId();

  const FailComponent = (
    <Fragment>
      <FailSVG />
      <Box
        sx={{
          pt: '24px',
          color: '#FFF',
          fontFamily: 'Poppins',
          fontSize: '16px',
          fontWeight: 500,
          lineHeight: '20px',
        }}
      >
        <Typography sx={{ textAlign: 'center' }}> Sorry, Transaction Failed</Typography>
      </Box>
    </Fragment>
  );

  const SuccessComponent = (
    <Fragment>
      <SuccessSVG />
      <Box
        sx={{
          pt: '24px',
          color: '#FFF',
          fontFamily: 'Poppins',
          fontSize: '16px',
          fontWeight: 500,
          lineHeight: '20px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Typography sx={{ textAlign: 'center' }}> Congratulations！</Typography>
        <Typography sx={{ textAlign: 'center' }}>You can check it in your wallet later</Typography>
        {txResult?.transactionHash && (
          <Link
            sx={{ textDecoration: 'none', color: '#D5E970' }}
            href={`${URL_CONFIG[chainId].etherScanUrl}/tx/${txResult?.transactionHash}`}
            target="_blank"
          >
            View on explorer
          </Link>
        )}
      </Box>
    </Fragment>
  );

  return (
    <EtchDialog open={open} onClose={onClose} title={title} footer={null}>
      <Box
        sx={{
          p: '40px 0',
        }}
      >
        <Box
          sx={{
            background: '#313439',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'column',
            p: '32px',
          }}
        >
          {isSuccess ? SuccessComponent : FailComponent}
        </Box>
      </Box>
    </EtchDialog>
  );
};

export default ResultViewSweep;
