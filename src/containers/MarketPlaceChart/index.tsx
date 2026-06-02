import {
  Box,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Typography,
  useMediaQuery,
} from '@mui/material';
import { useEffect, useState } from 'react';
import BigNumber from 'bignumber.js';

import {
  GetCollectionDetailData,
  MarketChartData,
  MarketChartRequest,
  categoryType,
} from '@/services/marketpalce/types';
import CloseSVG from '@/assets/icons/close.svg';
import ChartSVG from '@/assets/icons/chart.svg';
import { useImmer } from 'use-immer';
import services from '@/services';
import InvestInfo from '../Bridge/InvestInfo';
import LineStats from '../Bridge/LineStats';
import NftImage from '@/components/NftImage';
import { numberFormatUnit } from '@/utils/numberFormatUnit';
import getTruncate from '@/utils/getTruncate';
import MarketDownSVG from '@/assets/icons/marketDown.svg';
import MarketUpSVG from '@/assets/icons/marketUp.svg';
import EthLogo from '@/assets/icons/eth16.svg';
import LineChart from '@/components/LineChart';

interface ICategoryHolder {
  category: categoryType;
  collectionName: string;
}

const MarketPlaceChart: React.FC<ICategoryHolder> = ({ category, collectionName }) => {
  const matches = useMediaQuery('(min-width:750px)');
  const [open, setOpen] = useState<boolean>(false);
  const [filterRequest, setFilterRequest] = useImmer<MarketChartRequest>({
    category,
    collectionName,
    period: '1d',
  });

  const [p, tick] = collectionName.split(' ');

  const [lineData, setLineData] = useImmer<MarketChartData>({
    prices: [],
    currentPrice: '0',
    priceChange24h: 0,
    priceChangePercentage24h: 0,
    marketCap: '0',
    volume24h: '0',
    high24h: '0',
    low24h: '0',
    liquidity: '0',
    buy24h: '0',
    sell24h: '0',
  });
  const [collectionDetail, setCollectionDetail] = useState<GetCollectionDetailData>();

  async function getMarketChartData() {
    const response = await services.marketplace.marketChart(filterRequest);

    if (response?.code === 200) {
      setLineData(response.data);
    }
  }

  async function getDetails() {
    const response = await services.marketplace.getCollectionDetail({ category, collectionName });

    if (response?.code == 200) {
      setCollectionDetail(response.data);
    }
  }

  useEffect(() => {
    if (filterRequest.category.trim() != '' && filterRequest.collectionName.trim() != '') {
      getMarketChartData();
    }
  }, [filterRequest]);

  useEffect(() => {
    setFilterRequest((state) => {
      state.category = category;
      state.collectionName = collectionName;
    });
    getDetails();
  }, [category, collectionName]);

  const { value: marketCapValue, unit: marketCapUnit } = numberFormatUnit(lineData.marketCap);
  const { value: volume24Value, unit: volume24Unit } = numberFormatUnit(lineData.volume24h);
  const { value: hight24Value, unit: hight24Unit } = numberFormatUnit(lineData.high24h);
  const { value: low24Value, unit: low24Unit } = numberFormatUnit(lineData.low24h);

  const percentage24hColor = new BigNumber(lineData.priceChangePercentage24h).lte(0) ? '#D8346F' : '#32CA8A';

  return (
    <Box>
      <ChartSVG
        style={{ cursor: 'pointer' }}
        onClick={() => {
          setOpen(true);
        }}
      />
      <Dialog
        open={open}
        onClose={() => {
          setOpen(false);
        }}
        sx={{
          '.MuiPaper-root': {
            borderRadius: '8px',
            background: '#313439',
            width: matches ? '660px' : '100%',
          },
        }}
      >
        <DialogTitle
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontWeight: '700',
            fontSize: '18px',
            p: '16px 16px 16px 20px',
            boxSizing: 'border-box',
          }}
        >
          <Box display="flex" alignItems="center">
            {category == 'nft' && collectionDetail?.collections.icon && (
              <Box
                sx={{
                  width: 'auto',
                  minWidth: '36px',
                  height: '36px',
                  borderRadius: '8px',
                  border: '1px solid #2F343E',
                  background: '#202229',
                  overflow: 'hidden',
                }}
              >
                <NftImage content={collectionDetail?.collections.icon} />
              </Box>
            )}
            {category == 'token' && collectionDetail?.collections?.icon && (
              <Box
                sx={{
                  width: 'auto',
                  minWidth: '36px',
                  height: '36px',
                  borderRadius: '8px',
                  border: '1px solid #2F343E',
                  background: '#202229',
                  overflow: 'hidden',
                }}
              >
                <img
                  src={collectionDetail.collections.icon}
                  height="100%"
                  width="100%"
                  style={{
                    objectFit: 'contain',
                    border: 'none',
                    outline: 'none',
                  }}
                />
              </Box>
            )}
            <Typography color="#fff" sx={{ fontSize: '20px', fontFamily: 'Inter', fontWeight: '700', margin: '0 8px' }}>
              {collectionName ? `${p} ${tick ? tick : ''}` : '--'}
            </Typography>
          </Box>
          <IconButton
            onClick={(e) => {
              setOpen(false);
            }}
          >
            <CloseSVG />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{}}>
          <Box display="flex" alignItems="center" mb="34px">
            <Typography color="#fff" sx={{ fontSize: '20px', fontWeight: '700', marginRight: '13px' }}>
              {`$${getTruncate(lineData.currentPrice, 4)}`}
            </Typography>

            <Box
              color={percentage24hColor}
              display="flex"
              alignItems="center"
              justifyContent="center"
              style={{ gap: '2px' }}
            >
              <Typography sx={{ fontSize: '16px', fontWeight: '500' }}>
                {`${new BigNumber(lineData.priceChangePercentage24h).multipliedBy(100).toFixed(2)}%`}
              </Typography>

              {new BigNumber(lineData.priceChangePercentage24h).lte(0) ? <MarketDownSVG /> : <MarketUpSVG />}
            </Box>
          </Box>
          <LineChart
            dataType={filterRequest.period}
            data={lineData.prices.map((a) => ({
              ...a,
              usdPrice: Number(a.usdPrice),
            }))}
            color={percentage24hColor}
            isToolip
            isXAxis
            style={{ height: '260px', width: '100%', paddingBottom: '48px' }}
          />
          <LineStats
            onSelect={(val) => {
              setFilterRequest((state) => {
                state.period = val;
              });
              setLineData((state) => {
                state.prices = [];
              });
            }}
          />

          <InvestInfo
            data={[
              {
                label: 'Market Cap',
                value: `$${getTruncate(String(marketCapValue), 2)} ${marketCapUnit}`,
              },
              {
                label: '24h Volume',
                value: (
                  <Box display="flex" alignItems="center">
                    {`${getTruncate(String(volume24Value), 2)} ${volume24Unit}`}
                    <EthLogo />
                  </Box>
                ),
              },
              {
                label: '24h low',
                value: `$${getTruncate(String(low24Value), 4)} ${low24Unit}`,
              },
              {
                label: '24h high',
                value: `$${getTruncate(String(hight24Value), 4)} ${hight24Unit}`,
              },
            ]}
          />
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default MarketPlaceChart;
