import { Box, Typography } from '@mui/material';
import EtchDialog from '@/components/EtchDialog';
import { useEthscriptionBoxContext } from './EthscriptionBox/EthscriptionBoxContext';
import { Fragment, useEffect, useState } from 'react';

import SuccessSVG from '@/assets/icons/success.svg';
import FailSVG from '@/assets/icons/fail.svg';
import EthscriptionView from './EthscriptionBox/EthscriptionView';
import { GetEthscriptionsItem } from '@/services/marketpalce/types';

interface IResultView {
  title: React.ReactNode;
  isSuccess: boolean;
  open: boolean;
  onClose: () => void;
  ethscription?: GetEthscriptionsItem;
}

const ResultView: React.FC<IResultView> = ({ ethscription, isSuccess, title, open, onClose }) => {
  // const [_open, setOpen] = useState<boolean>(open);
  // console.log('open', open);

  // useEffect(() => {
  //   console.log("_open",_open)
  //   setOpen(open);
  // }, [open]);
  // const { ethscription, onChange } = useEthscriptionBoxContext();

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
        }}
      >
        <Typography sx={{ textAlign: 'center' }}> Congratulations！</Typography>
        <Typography sx={{ textAlign: 'center' }}>You can check it in your wallet later</Typography>
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
            // width: 'max-content',
            minWidth: '164px',
            maxWidth: '200px',
            margin: '0 auto',
            background: 'rgba(32, 34, 41, 1)',
            borderRadius: '8px',
            mb: '30px',
            overflow: 'hidden',
          }}
        >
          {ethscription && <EthscriptionView ethscription={ethscription} />}
        </Box>

        <Box
          sx={{
            borderRadius: '8px',
            border: '1px solid rgba(255, 255, 255, 0.10)',
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

export default ResultView;
