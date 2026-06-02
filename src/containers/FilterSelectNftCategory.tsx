'use client';

import React, { useRef, useState, useEffect } from 'react';
import { Box, Typography, Popover, Button } from '@mui/material';

import ArrowDownSVG from '@/assets/icons/arrow_down.svg';
import ArrowUPSVG from '@/assets/icons/arrow_up.svg';

interface IFilterSelect {
  namespace?: string;
  owner?: string;
  onSelect?: (val: { category: string }) => void;
}

const ntfPunkCategory = [{ category: 'Sub 100' }, { category: 'Sub 1000' }, { category: 'Sub 10000' }];

const FilterSelectNftCategory: React.FC<IFilterSelect> = ({ namespace, owner, onSelect }) => {
  const [anchorEl, setAnchorEl] = React.useState<HTMLDivElement | null>(null);
  const [currentSelect, setCurrentSelect] = useState({
    category: 'All Categories',
  });

  const handleClick = (event: React.MouseEvent<HTMLDivElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);

  const handleOnSelect = (item: { category: string }) => {
    return () => {
      setCurrentSelect(item);

      if (item.category == 'All Categories') {
        onSelect?.({ category: '' });
      } else {
        onSelect?.(item);
      }

      handleClose();
    };
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }} onClick={handleClick}>
        <Typography sx={{ mr: '10px', fontSize: '14px' }}>{currentSelect?.category || 'All Categories'}</Typography>
        {open ? <ArrowUPSVG color="rgba(255,255,255,0.45)" /> : <ArrowDownSVG color="rgba(255,255,255,0.45)" />}
      </Box>
      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        sx={{
          backgroundColor: 'transparent',
          '.MuiPaper-root': {
            background: 'transparent',
          },
        }}
      >
        <Box
          sx={{
            mt: '8px',
            display: 'flex',
            flexDirection: 'column',
            borderRadius: '8px',
            border: '1px solid #474C56',
            background: '#313439',
            p: '16px',
            boxShadow: '0px 0px 4px 0px rgba(19, 33, 82, 0.06), 0px 1px 25px 0px rgba(19, 33, 82, 0.10)',
          }}
        >
          <Button
            key={'All Categories'}
            fullWidth
            variant="text"
            onClick={handleOnSelect({
              category: 'All Categories',
            })}
            sx={{
              color: currentSelect?.category === 'All Categories' ? '#fff' : 'rgba(255, 255, 255, 0.65)',
              justifyContent: 'flex-start',
              fontSize: '14px',
              textTransform: 'none',
              ':hover': {
                color: '#fff',
                backgroundColor: 'transparent',
              },
            }}
          >
            All Categories
          </Button>
          {ntfPunkCategory?.map((item) => {
            return (
              <Button
                key={item.category}
                fullWidth
                variant="text"
                onClick={handleOnSelect(item)}
                sx={{
                  alignItems: 'flex-start',
                  flexDirection: 'column',
                  textTransform: 'none',
                  ':hover': {
                    '.domain-label': {
                      color: '#fff',
                    },
                    backgroundColor: 'transparent',
                  },
                }}
              >
                <Typography
                  className="domain-label"
                  sx={{
                    fontSize: '14px',
                    color: item.category === currentSelect?.category ? '#fff' : 'rgba(255, 255, 255, 0.65)',
                  }}
                >
                  {item.category}
                </Typography>
              </Button>
            );
          })}
        </Box>
      </Popover>
    </Box>
  );
};

export default FilterSelectNftCategory;
