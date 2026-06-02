'use client';

import { Box, Button, Divider, Typography } from '@mui/material';
import { useEffect, useState } from 'react';
import { useImmer } from 'use-immer';
import { ethers } from 'ethers';
import dayjs from 'dayjs';

import VerifySVG from '@/assets/icons/verify.svg';
import CustomPagination from '@/components/Pagination';
import LaunchpadDialog from '@/containers/LaunchpadDialog.tsx';
import { GetLaunchpadListData, GetLaunchpadListRequest } from '@/services/launchpad/types';
import services from '@/services';
import { GetLaunchpadItem } from '@/services/launchpad/types';

const PAGE_START_INIT = 10;

const ListArea: React.FC = () => {
  const [filterRequest, setFilterRequest] = useImmer<GetLaunchpadListRequest>({
    status: '',
    'page.size': PAGE_START_INIT,
    'page.index': 1,
  });

  const [list, setList] = useState<GetLaunchpadListData>({
    list: [],
    page: {
      size: PAGE_START_INIT,
      index: 1,
      total: '0',
    },
  });
  const [selectedNft, setSelectNft] = useState<GetLaunchpadItem | undefined>(undefined);

  const [open, setOpen] = useState(false);

  const getLaunchpadList = async () => {
    const response = await services.launchpad.getLaunchpadList(filterRequest);
    if (response?.code === 200) {
      setList(response.data);
    }
  };

  const getMintingTime = (start: string, end: string) => {
    const now = new Date().getTime();
    const startTime = Number(start) * 1000;
    const endTime = Number(end) * 1000;
    if (now < startTime) {
      return dayjs(startTime).format('MM/DD HH:mm');
    } else {
      if (now < endTime || endTime === 0) {
        return 'Now';
      } else {
        return 'Ended';
      }
    }
  };

  useEffect(() => {
    getLaunchpadList();
  }, [filterRequest]);

  return (
    <Box>
      <Box
        sx={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-end',
          p: { xs: '28px 10px', sm: '28px 140px' },
        }}
      >
        <Button
          sx={{
            borderRadius: '46px',
            background: '#E5FF65',
            padding: '10px 20px',
            color: '#171A1F',
            '&:hover': {
              color: '#fff',
            },
          }}
          onClick={() => {
            window.open('https://forms.gle/i54oqjXL2Rqsi61y8');
          }}
        >
          Apply
        </Button>
      </Box>
      <Box
        sx={{
          width: '100%',
          p: { xs: '28px 10px', sm: '28px 140px' },
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(270px, 1fr))',
          justifyContent: 'space-between',
          gridGap: '24px',
        }}
      >
        {list.list.map((item, index) => {
          return (
            <Box
              key={index}
              sx={{
                borderRadius: '8px',
                border: '1px solid #2F343E',
                background: '#202229',
                cursor: 'pointer',
                transition: 'all 0.8s',
                '&:hover': {
                  borderColor: '#D5E970',
                },
              }}
              onClick={() => {
                setSelectNft(item);
                setOpen(true);
              }}
            >
              <Box
                sx={{
                  flex: '1 1',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
              >
                <img
                  src={item.previewImage}
                  height="100%"
                  width="100%"
                  style={{
                    objectFit: 'contain',
                    border: 'none',
                    outline: 'none',
                    imageRendering: 'pixelated',
                    borderRadius: '8px 8px 0 0',
                  }}
                />
              </Box>
              <Box sx={{ p: '16px 16px 20px 16px' }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Typography sx={{ fontSize: '14px', fontWeight: 500, mr: '8px' }}>{item.name}</Typography>
                  {item.blueVerified && <VerifySVG />}
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: '16px' }}>
                  <Typography fontSize="12px" color="rgba(255,255,255,0.65)">
                    Minting
                  </Typography>
                  <Typography fontSize="12px">{getMintingTime(item.startTime, item.endTime)}</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: '4px' }}>
                  <Typography fontSize="12px" color="rgba(255,255,255,0.65)">
                    Price
                  </Typography>
                  <Typography fontSize="12px" color="#D5E970">
                    {`${item.mintPrice} ETH`}
                  </Typography>
                </Box>
              </Box>
            </Box>
          );
        })}
      </Box>
      <Box mt={'40px'} mb={'131px'}>
        <CustomPagination
          pageSize={filterRequest['page.size']}
          pageTotal={list.page.total}
          onPageChange={(e) => {
            setFilterRequest((state) => {
              state['page.index'] = e.page;
            });
          }}
        />
      </Box>
      {selectedNft && <LaunchpadDialog launchpadItem={selectedNft} open={open} onClose={() => setOpen(false)} />}
    </Box>
  );
};

export default ListArea;
