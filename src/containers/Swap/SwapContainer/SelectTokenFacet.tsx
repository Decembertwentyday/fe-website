'use client';

import { Fragment, useEffect, useState } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  InputAdornment,
  OutlinedInput,
  Typography,
} from '@mui/material';
import { orderBy, sortBy } from 'lodash-es';
import BigNumber from 'bignumber.js';
import { useSnapshot } from 'valtio/react';

import CloseSVG from '@/assets/icons/close.svg';
import ArrowDownSVG from '@/assets/icons/arrow_down.svg';
import { ISwapToken, PairsToken } from '@/services/facet/types';
import { FACET_CONFIG } from '@/constants/config';
import { ethers } from 'ethers';
import getTruncate from '@/utils/getTruncate';

import * as FacetSwapStore from '@/stores/FacetSwapStore';

interface ISelectTokenFacet {
  value?: ISwapToken;
  onSelect: (val: ISwapToken) => void;
  facetList: ISwapToken[];
}

const SelectTokenFacet: React.FC<ISelectTokenFacet> = ({ onSelect, facetList, value }) => {
  const facetSwapStore = useSnapshot(FacetSwapStore.store);
  const [open, setOpen] = useState(false);
  const [searchValue, setSearchValue] = useState<string>('');

  let facetListFilter =
    searchValue == ''
      ? facetList
      : facetList.filter((item) => {
          if (ethers.utils.isAddress(searchValue)) {
            return ethers.utils.getAddress(item.address) === ethers.utils.getAddress(searchValue);
          }
          return item.name.toLocaleLowerCase().includes(searchValue.toLocaleLowerCase());
        });

  facetListFilter = orderBy(
    facetListFilter,
    [
      (item) => {
        return new BigNumber(item.balance).toNumber();
      },
      (item) => {
        return new BigNumber(item.tvl_in_weth).toNumber();
      },
    ],
    ['desc', 'desc'],
  );

  const onClose = () => {
    setOpen(false);
  };

  const isFETH = value?.address == FACET_CONFIG.FETH_ADDRESS;

  const handleOnClickPair = (item: ISwapToken) => {
    return () => {
      onSelect(item);
      setOpen(false);
    };
  };

  return (
    <Fragment>
      <Box
        sx={{
          borderRadius: '25px',
          background: 'rgba(255, 255, 255, 0.10)',
          display: 'flex',
          alignItems: 'center',
          p: isFETH ? '4px 8px' : '4px 4px 4px 8px',
          fontSize: '16px',
          fontWeight: 500,
          cursor: isFETH ? 'default' : 'pointer',
        }}
        onClick={() => {
          if (!isFETH) {
            setOpen(true);
          }
        }}
      >
        <Box sx={{}}>{value?.symbol || 'Select Token'}</Box>
        {!isFETH && <ArrowDownSVG />}
      </Box>

      <Dialog
        open={open}
        onClose={() => {
          onClose();
        }}
        sx={{
          '.MuiPaper-root': {
            borderRadius: '8px',
            background: '#313439',
          },
        }}
      >
        <DialogTitle
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontWeight: '500',
            fontSize: '18px',
            p: '16px 20px 0px 32px',
            width: '100%',
          }}
        >
          <Typography
            sx={{
              color: '#FFF',
              fontSize: '18px',
              fontWeight: 600,
            }}
          >
            Select Token
          </Typography>
          <IconButton
            onClick={(e) => {
              onClose();
            }}
          >
            <CloseSVG />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ p: 0 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: '20px', p: '30px 32px 0' }}>
            <OutlinedInput
              autoComplete="off"
              placeholder="Search name or address"
              onChange={(event) => {
                setSearchValue(event.target.value);
              }}
              value={searchValue}
              endAdornment={
                searchValue && (
                  <InputAdornment position="end" sx={{ cursor: 'pointer' }}>
                    <CloseSVG
                      onClick={() => {
                        setSearchValue('');
                      }}
                    />
                  </InputAdornment>
                )
              }
              sx={{
                width: '100%',
                height: '48px',
                borderRadius: '48px',
                bgcolor: 'rgba(32, 34, 41, 1)',
                '& input': {
                  fontSize: '16px',
                },
                '&.MuiOutlinedInput-root': {
                  fieldset: {
                    borderColor: 'transparent',
                  },
                  '&:hover fieldset': {
                    borderColor: 'transparent',
                    borderWidth: '1px',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: 'transparent',
                    borderWidth: '1px',
                  },
                },
              }}
            />
          </Box>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: '24px',
              mb: '20px',
              p: '0 32px 20px',
              borderBottom: '1px solid rgba(255,255,255,0.1)',
            }}
          >
            {/*
              FACET 0x26231ad975456d53682e1b6364e9e005886281e7
              NODES 0x5d0dc4380fc8d501795aec7e7a908cb25c4131c6
              PAMP 0xa38ad4c62a70e14619fa56548bb5e11381d58ff6
              ETHS 0x55ab0390a89fed8992e3affbf61d102490735e24
            */}
            {facetList
              .filter((item) =>
                [
                  '0x26231ad975456d53682e1b6364e9e005886281e7',
                  '0x5d0dc4380fc8d501795aec7e7a908cb25c4131c6',
                  '0x55ab0390a89fed8992e3affbf61d102490735e24',
                ].includes(item.address),
              )
              .map((item) => {
                return (
                  <Box
                    sx={{
                      p: '4px 8px',
                      boxSizing: 'border-box',
                      cursor: 'pointer',
                      borderRadius: '25px',
                      background: 'rgba(255, 255, 255, 0.10)',
                      fontSize: '16px',
                      fontWeight: 400,
                      color: 'rgba(255,255,255,0.45)',
                      transition: 'all 0.2s ease-in-out',
                      ':hover': {
                        color: '#fff',
                      },
                    }}
                    key={item.address}
                    onClick={handleOnClickPair(item)}
                  >
                    {item.symbol}
                  </Box>
                );
              })}
          </Box>

          <Box
            sx={{
              maxHeight: '375px',
              overflowY: 'auto',
              '&::-webkit-scrollbar': {
                width: '0.4em',
              },
              '&:hover': {
                '&::-webkit-scrollbar-thumb': {
                  backgroundColor: 'rgba(255,255,255,0.5)',
                  webkitBoxShadow: 'inset 0 0 5px rgba(0, 0, 0, 0.2)',
                },
                '&::-webkit-scrollbar-track': {
                  backgroundColor: 'transparent',
                },
              },
            }}
          >
            {facetListFilter.map((item) => {
              const _decimals =
                facetSwapStore.tokenInfo?.tokens[ethers.utils.getAddress(item.address)]?.decimals || '0';
              return (
                <Box
                  sx={{
                    p: '12px 32px',
                    boxSizing: 'border-box',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease-in-out',
                    ':hover': {
                      background: 'rgba(255, 255, 255, 0.10)',
                    },
                  }}
                  key={item.address}
                  onClick={handleOnClickPair(item)}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '30px' }}>
                    <Box sx={{ color: '#fff', fontSize: '16px', fontWeight: 500, wordBreak: 'break-all' }}>
                      {item.name}
                    </Box>
                    <Typography sx={{ color: 'rgba(255,255,255,0.45)' }}>{`Tvl: ${
                      Boolean(_decimals) ? getTruncate(ethers.utils.formatUnits(item.tvl_in_weth, _decimals), 6) : '--'
                    } ETH`}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Typography sx={{ color: 'rgba(255,255,255,0.45)', fontSize: '16px', fontWeight: 400 }}>
                      {item.symbol}
                    </Typography>
                    <Typography sx={{ color: 'rgba(255,255,255,0.45)' }}>{`Balance: ${getTruncate(
                      ethers.utils.formatUnits(item.balance, _decimals),
                      6,
                    )}`}</Typography>
                  </Box>
                </Box>
              );
            })}
          </Box>
        </DialogContent>
      </Dialog>
    </Fragment>
  );
};

export default SelectTokenFacet;
