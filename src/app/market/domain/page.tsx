// ============================================================================
// 【app/market/domain/page.tsx】指定品类 - 域名集交易市场分页
// ----------------------------------------------------------------------------
// 主要分发渲染 Listed / Holders / Orders (全局历史) / My Orders。
// 内部使用 Tabs 切页视图。
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
    ui: <ListedList category="domain" />,
  },
  {
    label: 'Holders',
    value: 'holders',
    ui: <CategoryHolder category="domain" />,
  },
  {
    label: 'Orders',
    value: 'orders',
    ui: <OrderList category="domain" />,
  },
  {
    label: 'My Orders',
    value: 'my-orders',
    ui: <OrderList isOwner={true} category="domain" />,
  },
];

const DomainPage = () => {
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
      <DetailBack label="Domains / Detail" />
      <CollectionDetail category="domain" />
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

export default DomainPage;
