'use client';

import { Box } from '@mui/material';

import SwapSwitchSVG from '@/assets/icons/swap_switch.svg';
import services from '@/services';
import * as FacetSwapStore from '@/stores/FacetSwapStore';
import { useSnapshot } from 'valtio/react';
import { GetCollectionDetailData } from '@/services/marketpalce/types';

interface ISwitchButton {
  collectionDetail?: GetCollectionDetailData;
}

const SwitchButton: React.FC<ISwitchButton> = ({ collectionDetail }) => {
  const facetSwapStore = useSnapshot(FacetSwapStore.store);

  const handleOnClick = () => {
    const tmp = facetSwapStore.token0;

    FacetSwapStore.setInSelectToken(facetSwapStore.token1);
    FacetSwapStore.setOutSelectToken(tmp);
    FacetSwapStore.setIsExactTokens(false);
  };
  return (
    <Box
      sx={{
        height: '60px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <SwapSwitchSVG style={{ cursor: 'pointer' }} onClick={handleOnClick} />
    </Box>
  );
};

export default SwitchButton;
