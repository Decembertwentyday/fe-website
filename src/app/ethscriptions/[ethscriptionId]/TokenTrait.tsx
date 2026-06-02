'use client';

import Footer from '@/containers/Footer';
import services from '@/services';
import { LoadingButton } from '@mui/lab';

import { Box, Button, Typography } from '@mui/material';
import { useEffect, useState } from 'react';

const TokenTrait = () => {
  return (
    <Box
      sx={{
        width: '100%',
        padding: '20px 24px',
        boxSizing: 'border-box',
        borderRadius: '8px',
        background: ' rgba(255, 255, 255, 0.05)',
        mt: '30px',
      }}
    >
      <Typography sx={{ fontSize: '20px', fontWeight: '700' }}>Traits(5)</Typography>
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: '20px',
          marginTop: '12px',
          '.grid-item-even': {
            '&:after': {
              content: '" "',
              display: 'block',
              borderRight: '1px solid rgba(255,255,255,0.2)',
              height: '28px',
            },
          },
        }}
      >
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
          className="grid-item-even"
        >
          <Box>
            <Typography sx={{ fontSize: '14px', color: 'rgba(255,255,255,0.45)' }}>Clothes</Typography>
            <Typography sx={{ fontSize: '14px', color: 'rgb(255,255,255)' }}>M1 Aquamarine</Typography>
          </Box>
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-end',
            }}
          >
            <Typography sx={{ fontSize: '14px', color: 'rgba(255,255,255,0.45)' }}>Rarity</Typography>
            <Typography sx={{ fontSize: '14px', color: 'rgb(255,255,255)' }}>1254(10%)</Typography>
          </Box>
        </Box>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <Box>
            <Typography sx={{ fontSize: '14px', color: 'rgba(255,255,255,0.45)' }}>Background</Typography>
            <Typography sx={{ fontSize: '14px', color: 'rgb(255,255,255)' }}>M1 Aquamarine</Typography>
          </Box>
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-end',
            }}
          >
            <Typography sx={{ fontSize: '14px', color: 'rgba(255,255,255,0.45)' }}>Rarity</Typography>
            <Typography sx={{ fontSize: '14px', color: 'rgb(255,255,255)' }}>1254(10%)</Typography>
          </Box>
        </Box>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
          className="grid-item-even"
        >
          <Box>
            <Typography sx={{ fontSize: '14px', color: 'rgba(255,255,255,0.45)' }}>Eyes</Typography>
            <Typography sx={{ fontSize: '14px', color: 'rgb(255,255,255)' }}>M1 Aquamarine</Typography>
          </Box>
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-end',
            }}
          >
            <Typography sx={{ fontSize: '14px', color: 'rgba(255,255,255,0.45)' }}>Rarity</Typography>
            <Typography sx={{ fontSize: '14px', color: 'rgb(255,255,255)' }}>1254(10%)</Typography>
          </Box>
        </Box>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <Box>
            <Typography sx={{ fontSize: '14px', color: 'rgba(255,255,255,0.45)' }}>Eyes</Typography>
            <Typography sx={{ fontSize: '14px', color: 'rgb(255,255,255)' }}>M1 Aquamarine</Typography>
          </Box>
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-end',
            }}
          >
            <Typography sx={{ fontSize: '14px', color: 'rgba(255,255,255,0.45)' }}>Rarity</Typography>
            <Typography sx={{ fontSize: '14px', color: 'rgb(255,255,255)' }}>1254(10%)</Typography>
          </Box>
        </Box>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
          className="grid-item-even"
        >
          <Box>
            <Typography sx={{ fontSize: '14px', color: 'rgba(255,255,255,0.45)' }}>Eyes</Typography>
            <Typography sx={{ fontSize: '14px', color: 'rgb(255,255,255)' }}>M1 Aquamarine</Typography>
          </Box>
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-end',
            }}
          >
            <Typography sx={{ fontSize: '14px', color: 'rgba(255,255,255,0.45)' }}>Rarity</Typography>
            <Typography sx={{ fontSize: '14px', color: 'rgb(255,255,255)' }}>1254(10%)</Typography>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default TokenTrait;
