// ============================================================================
// 【app/market/nft/page.tsx】特定品类 - NFT交易子市场
// ----------------------------------------------------------------------------
// 主要分发渲染该子类目下特属集合页的挂单与统计持仓。
// ============================================================================

'use client';

import { Box, Tab } from '@mui/material';
import { TabContext, TabList, TabPanel } from '@mui/lab';
import ListedList from '@/containers/ListedList';
import OrderList from '@/containers/OrderList';
import { useCallback, useState } from 'react';
import DetailBack from '../DetailBack';
import CollectionDetail from '@/containers/CollectionDetail';
import CategoryHolder from '@/containers/CategoryHolder';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

const MarketplaceTabs = [
  {
    label: 'Listed',
    value: 'listed',
    ui: <ListedList category="nft" />,
  },
  {
    label: 'Holders',
    value: 'holders',
    ui: <CategoryHolder category="nft" />,
  },
  {
    label: 'Orders',
    value: 'orders',
    ui: <OrderList category="nft" />,
  },
  {
    label: 'My Orders',
    value: 'my-orders',
    ui: <OrderList isOwner={true} category="nft" />,
  },
];

const NftPage = () => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const tab = searchParams.get('tab') || 'listed';
  const [value, setValue] = useState(tab || MarketplaceTabs[0].value);

  const createQueryString = useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set(name, value);

      return params.toString();
    },
    [searchParams],
  );

  const handleChange = (event: React.SyntheticEvent, newValue: string) => {
    setValue(newValue);
    router.push(pathname + '?' + createQueryString('tab', newValue));
  };

  return (
    <Box>
      <DetailBack label="Collections / Detail" />
      <CollectionDetail category="nft" />
      <TabContext value={value}>
        <TabList
          onChange={handleChange}
          sx={{
            borderBottom: '1px solid rgba(255, 255, 255, 0.10)',
            '& .MuiButtonBase-root.MuiTab-root': {
              minWidth: 'auto',
              padding: '12px',
              textTransform: 'none',
            },
          }}
        >
          {MarketplaceTabs.map((item) => (
            <Tab label={item.label} key={item.value} value={item.value} />
          ))}
        </TabList>
        {MarketplaceTabs.map((item) => (
          <TabPanel
            sx={{
              padding: '30px 0 0',
            }}
            value={item.value}
            key={item.value}
          >
            {item.ui}
          </TabPanel>
        ))}
      </TabContext>
    </Box>
  );
};

export default NftPage;
