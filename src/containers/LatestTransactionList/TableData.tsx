// ============================================================================
// 【LatestTransactionList/TableData.tsx】最新交易表格展示
// ----------------------------------------------------------------------------
// 读列：铭文预览图标、from→to地址、价格、时间（ago）、交易哈希链接
// 根据屏幕宽度自适应列数（移动端隐藏部分列）
// CategorySquare 插件展示铭文类型图标（DM/TXT/IMG）
// ============================================================================
import dayjs from 'dayjs';
import BigNumber from 'bignumber.js';
import { Box, Button, CircularProgress, Link, Pagination, Typography, useMediaQuery } from '@mui/material';

import { GetErc20ListData, GetErc20Item, GetRecentTransactionItem } from '@/services/ethscriptions/types';
import ArrowRightSVG from '@/assets/icons/arrow_right.svg';
import { useRouter } from 'next/navigation';
import CategorySquare from '@/components/CategorySquare';
import getTruncate from '@/utils/getTruncate';
import { getTimeAgoString, splitDatauri } from '@/utils';
import { formatAddress } from '@/utils/addressHelper';
import { URL_CONFIG, mimeTypeImagePre } from '@/constants';
import { useChainId } from 'wagmi';
import { useMemo } from 'react';

interface ITxListTable {
  data: GetRecentTransactionItem[];
  pageSize: number;
  isLoading: boolean;
}

const Loading = () => (
  <Box display="flex" alignItems="center" justifyContent="center" height="420px">
    <CircularProgress sx={{ color: 'rgba(255,255,255,0.2)' }} />
  </Box>
);

const DataItem: React.FC<{ item: GetRecentTransactionItem; chainId: number }> = ({ item, chainId }) => {
  const [pre, data] = splitDatauri(item.content || '');
  const isImage = useMemo(() => {
    return item.category === 'image' || pre.includes(mimeTypeImagePre);
  }, [item]);
  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'space-between',
        height: '60px',
        alignItems: 'center',
      }}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          minWidth: '128px',
        }}
      >
        <img
          src={isImage && item.content ? item.content : item.icon}
          alt="icon"
          style={{ width: '32px', height: '32px' }}
        />
        <Box ml="8px">
          <Link
            target="__blank"
            href={`${URL_CONFIG[chainId].etherscription}/ethscriptions/${item.ethscriptionId}`}
            sx={{ fontSize: '14px', fontWeight: 500, color: 'white', textDecoration: 'none' }}
          >
            #{item.ethscriptionNumber}
          </Link>
          <Typography sx={{ fontSize: '14px', color: 'rgba(255,255,255,0.45)' }}>
            {getTimeAgoString(item.eventTime)}
          </Typography>
        </Box>
      </Box>
      <Box sx={{ display: 'flex', alignItems: 'flex-end', flexDirection: 'column', minWidth: '130px' }}>
        <Box display="flex" alignItems="center">
          <Typography sx={{ fontSize: '14px', color: 'rgba(255,255,255,0.45)', mr: '8px' }}>From</Typography>
          <Typography
            sx={{
              fontSize: '14px',
              fontWeight: 500,
              '&:hover': {
                textDecoration: 'underline',
                cursor: 'pointer',
              },
            }}
          >
            {formatAddress(item.from) || '--'}
          </Typography>
        </Box>
        <Box display="flex" alignItems="center">
          <Typography sx={{ fontSize: '14px', color: 'rgba(255,255,255,0.45)', mr: '8px' }}>To</Typography>
          <Typography
            sx={{
              fontSize: '14px',
              fontWeight: 500,
              '&:hover': {
                textDecoration: 'underline',
                cursor: 'pointer',
              },
            }}
          >
            {formatAddress(item.to) || '--'}
          </Typography>
        </Box>
      </Box>
      <Box
        sx={{
          fontSize: 14,
          minWidth: '80px',
          p: '0 4px',
          borderRadius: '3px',
          textAlign: 'center',
          color: 'rgba(255,255,255,0.45)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
        }}
        color="rgba(255,255,255)"
      >
        {item.price ? `${getTruncate(item.price, 4)} ETH` : '--'}
      </Box>
    </Box>
  );
};
const DataItemMobile: React.FC<{ item: GetRecentTransactionItem; chainId: number }> = ({ item, chainId }) => {
  const [pre, data] = splitDatauri(item.content || '');
  const isImage = useMemo(() => {
    return item.category === 'image' || pre.includes(mimeTypeImagePre);
  }, [item]);
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        p: '8px 12px',
        borderBottom: '1px solid rgba(255,255,255,0.2)',
      }}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
          }}
        >
          <img
            src={isImage && item.content ? item.content : item.icon}
            alt="icon"
            style={{ width: '32px', height: '32px' }}
          />
          <Box ml="8px">
            <Link
              target="__blank"
              href={`${URL_CONFIG[chainId].etherscription}/ethscriptions/${item.ethscriptionId}`}
              sx={{ fontSize: '14px', fontWeight: 500, color: 'white', textDecoration: 'none' }}
            >
              #{item.ethscriptionNumber}
            </Link>
            <Typography sx={{ fontSize: '14px', color: 'rgba(255,255,255,0.45)' }}>
              {getTimeAgoString(item.eventTime)}
            </Typography>
          </Box>
        </Box>
        <Box
          sx={{
            fontSize: 14,
            minWidth: '80px',
            p: '0 4px',
            borderRadius: '3px',
            textAlign: 'center',
            color: 'rgba(255,255,255,0.45)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
          }}
          color="rgba(255,255,255)"
        >
          {item.price ? `${getTruncate(item.price, 4)} ETH` : '--'}
        </Box>
      </Box>
      <Box display="flex" my={'2px'} justifyContent="space-between" alignItems="center">
        <Typography sx={{ fontSize: '14px', color: 'rgba(255,255,255,0.45)', mr: '8px' }}>From</Typography>
        <Typography
          sx={{
            fontSize: '14px',
            fontWeight: 500,
            '&:hover': {
              textDecoration: 'underline',
              cursor: 'pointer',
            },
          }}
        >
          {formatAddress(item.from) || '--'}
        </Typography>
      </Box>
      <Box display="flex" my={'2px'} justifyContent="space-between" alignItems="center">
        <Typography sx={{ fontSize: '14px', color: 'rgba(255,255,255,0.45)', mr: '8px' }}>To</Typography>
        <Typography
          sx={{
            fontSize: '14px',
            fontWeight: 500,
            '&:hover': {
              textDecoration: 'underline',
              cursor: 'pointer',
            },
          }}
        >
          {formatAddress(item.to) || '--'}
        </Typography>
      </Box>
    </Box>
  );
};

const TableData = ({ data, isLoading }: ITxListTable) => {
  const router = useRouter();
  const isMobile = useMediaQuery('(max-width:750px)');
  const chainId = useChainId();
  return (
    <Box sx={{ width: '100%', minHeight: '480px', mt: '16px' }}>
      {isLoading && <Loading />}
      {data && (
        <Box>
          {data.map((item, index) => {
            return isMobile ? (
              <DataItemMobile chainId={chainId} item={item} key={Symbol(item.ethscriptionId + index).toString()} />
            ) : (
              <DataItem chainId={chainId} item={item} key={Symbol(item.ethscriptionId + index).toString()} />
            );
          })}
        </Box>
      )}
      <Box display="flex" justifyContent="center" mt="20px">
        <Button
          sx={{
            height: '40px',
            border: '1px solid rgba(255,255,255,0.65)',
            borderRadius: '20px',
            textTransform: 'none',
            color: 'rgba(255,255,255,0.45)',
            '&:hover': {
              backgroundColor: 'transparent',
              color: 'white',
            },
          }}
          onClick={() => {
            router.push('/transactions');
          }}
          variant="outlined"
        >
          See More
        </Button>
      </Box>
    </Box>
  );
};

export default TableData;
