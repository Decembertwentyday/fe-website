// ============================================================================
// 【RecentEthsciptionList/TableData.tsx】最新铭刻表格展示
// ----------------------------------------------------------------------------
// 读列：铭文 content、铸造者地址、mint进度条、时间（ago）、交易哈希链接
// ProgressBar 显示该铭文集合当前铸造进度（如 mint 500/1000 显示 50%）
// ============================================================================
import dayjs from 'dayjs';
import BigNumber from 'bignumber.js';
import { Box, Button, CircularProgress, Pagination, Typography, useMediaQuery, Link } from '@mui/material';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';

import ProgressBar from '@/containers/ProgressBar';
import { GetRecentEthsItem } from '@/services/ethscriptions/types';
import { useRouter } from 'next/navigation';
import { getTimeAgoString } from '@/utils';
import { formatAddress } from '@/utils/addressHelper';
import { useChainId } from 'wagmi';
import { URL_CONFIG } from '@/constants';

interface ITxListTable {
  data: GetRecentEthsItem[];
  isLoading: boolean;
}

const Loading = () => (
  <Box display="flex" alignItems="center" justifyContent="center" height="420px">
    <CircularProgress sx={{ color: 'rgba(255,255,255,0.2)' }} />
  </Box>
);

const DataItem: React.FC<{ item: GetRecentEthsItem; chainId: number }> = ({ item, chainId }) => {
  return (
    <Box height="60px" display={'flex'} justifyContent="space-between" alignItems="center">
      <Box
        sx={{
          minWidth: '141px',
          display: 'flex',
          alignItems: 'center',
        }}
      >
        <img
          src={item.category === 'image' ? item.data : item.icon}
          alt="icon"
          style={{ width: '32px', height: '32px' }}
        />
        <Box ml="8px">
          <Link
            target="__blank"
            href={`${URL_CONFIG[chainId].etherscription}/ethscriptions/${item.ethscriptionId}`}
            sx={{ fontSize: '14px', fontWeight: 500, textDecorationLine: 'none', color: '#fff' }}
          >
            {item.confirmed ? `#${item.ethscriptionNumber}` : '#Unconfirmed'}
          </Link>
          <Typography sx={{ fontSize: '14px', color: 'rgba(255,255,255,0.45)' }}>
            {getTimeAgoString(item.blockTime)}
          </Typography>
        </Box>
      </Box>
      <Box sx={{ display: 'flex', alignItems: 'flex-end', flexDirection: 'column' }}>
        <Box display="flex" alignItems="center">
          <Typography sx={{ fontSize: '14px', fontWeight: 500, color: 'rgba(255,255,255,0.45)', mr: '8px' }}>
            Creator
          </Typography>
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
            {formatAddress(item.creator)}
          </Typography>
        </Box>
        <Box display="flex" alignItems="center">
          <Typography sx={{ fontSize: '14px', fontWeight: 500, color: 'rgba(255,255,255,0.45)', mr: '8px' }}>
            Owner
          </Typography>
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
            {formatAddress(item.owner)}
          </Typography>
        </Box>
      </Box>

      <Box
        sx={{
          fontSize: 14,
          width: '70px',
          p: '0 4px',
          borderRadius: '3px',
          textAlign: 'center',
          textTransform: 'capitalize',
          color: 'rgba(255,255,255,0.45)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
        }}
      >
        {item.category}
      </Box>
    </Box>
  );
};
const DataItemMobile: React.FC<{ item: GetRecentEthsItem; chainId: number }> = ({ item }) => {
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
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
          }}
        >
          <img
            src={item.category === 'image' ? item.data : item.icon}
            alt="icon"
            style={{ width: '32px', height: '32px' }}
          />
          <Box ml="8px">
            <Typography sx={{ fontSize: '14px', fontWeight: 500 }}>
              {item.confirmed ? `#${item.ethscriptionNumber}` : '#Unconfirmed'}
            </Typography>
            <Typography sx={{ fontSize: '14px', color: 'rgba(255,255,255,0.45)' }}>
              {getTimeAgoString(item.blockTime)}
            </Typography>
          </Box>
        </Box>
        <Box
          sx={{
            fontSize: 14,
            width: '70px',
            p: '0 4px',
            borderRadius: '3px',
            textAlign: 'center',
            textTransform: 'capitalize',
            color: 'rgba(255,255,255,0.45)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
          }}
        >
          {item.category}
        </Box>
      </Box>
      <Box display="flex" my={'2px'} justifyContent="space-between" alignItems="center">
        <Typography sx={{ fontSize: '14px', fontWeight: 500, color: 'rgba(255,255,255,0.45)', mr: '8px' }}>
          Creator
        </Typography>
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
          {formatAddress(item.creator)}
        </Typography>
      </Box>
      <Box display="flex" my={'2px'} justifyContent="space-between" alignItems="center">
        <Typography sx={{ fontSize: '14px', fontWeight: 500, color: 'rgba(255,255,255,0.45)', mr: '8px' }}>
          Owner
        </Typography>
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
          {formatAddress(item.owner)}
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
              <DataItem item={item} chainId={chainId} key={Symbol(item.ethscriptionId + index).toString()} />
            );
          })}
        </Box>
      )}
      <Box display="flex" justifyContent="center" mt="20px">
        <Button
          sx={{
            height: '40px',
            color: 'rgba(255,255,255,0.45)',
            border: '1px solid rgba(255,255,255,0.65)',
            borderRadius: '20px',
            textTransform: 'none',
            '&:hover': {
              backgroundColor: 'transparent',
              color: 'white',
            },
          }}
          onClick={() => {
            router.push('/ethscriptions');
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
