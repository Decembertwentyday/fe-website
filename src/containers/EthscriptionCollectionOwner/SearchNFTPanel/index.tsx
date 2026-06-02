'use client';

import { Box } from '@mui/material';
import React from 'react';

import SearchInput from '@/components/SearchInput';
import TableData from './TableData';
import { useEthscriptionCollectionOwnerContext } from '../EthscriptionCollectionContext';

const SearchNFTPanel = () => {
  const { setFilterRequest, collectionItem } = useEthscriptionCollectionOwnerContext();

  return (
    <Box>
      <SearchInput
        sx={{
          width: '100%',
          height: '36px',
        }}
        onClear={() => {
          setFilterRequest((state) => {
            state.tokenQuery = '';
          });
        }}
        onClick={async (value) => {
          setFilterRequest((state) => {
            state.tokenQuery = value as string;
          });
        }}
        onEnter={async (value) => {
          setFilterRequest((state) => {
            state.tokenQuery = value as string;
          });
        }}
      />
      <Box height="4px" />
      <TableData />
    </Box>
  );
};

export default SearchNFTPanel;
