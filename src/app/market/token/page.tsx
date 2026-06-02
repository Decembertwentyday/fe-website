// ============================================================================
// 【app/market/token/page.tsx】特定品类 - 同质化 Token 类别的交易市场
// ----------------------------------------------------------------------------
// 主要分发渲染 Token ERC20 铭文相关的在售列表挂单 (Listed) 以及图表。
// ============================================================================

'use client';

import { Box, Tab, useMediaQuery } from '@mui/material';
import { TabContext, TabList, TabPanel } from '@mui/lab';
import { useSnapshot } from 'valtio/react';
import { useCallback, useState } from 'react';

import ListedList from '@/containers/ListedList';
import OrderList from '@/containers/OrderList';
import DetailBack from '../DetailBack';
import CollectionDetail from '@/containers/CollectionDetail';
import VaultList from '@/containers/VaultList';
import CategoryHolder from '@/containers/CategoryHolder';
import Swap from '@/containers/Swap';
import * as EthscriptionsStore from '@/stores/EthscriptionsStore';
import { IEthscriptionsStore } from '@/stores/EthscriptionsStore';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

const TokenPage = () => {
  const ethscriptionsStore = useSnapshot(EthscriptionsStore.store) as IEthscriptionsStore;
  const matches = useMediaQuery('(min-width:750px)');
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const tab = searchParams.get('tab') || 'listed';

  let MarketplaceTabs = [
    {
      label: 'Listed',
      value: 'listed',
      ui: <ListedList category="token" />,
    },
    {
      label: 'Swap',
      value: 'swap',
      ui: <Swap category="token" />,
    },
    {
      label: 'Holders',
      value: 'holders',
      ui: <CategoryHolder category="token" />,
    },
    // {
    //   label: 'Vault',
    //   value: 'vault',
    //   ui: <VaultList category="token" />,
    // },
    {
      label: 'Orders',
      value: 'orders',
      ui: <OrderList category="token" />,
    },
    {
      label: 'My Orders',
      value: 'my-orders',
      ui: <OrderList isOwner={true} category="token" />,
    },
  ];

  const createQueryString = useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set(name, value);

      return params.toString();
    },
    [searchParams],
  );

  const [value, setValue] = useState(tab || MarketplaceTabs[0].value);

  const handleChange = (event: React.SyntheticEvent, newValue: string) => {
    setValue(newValue);
    router.push(pathname + '?' + createQueryString('tab', newValue));
  };

  if (!Boolean(ethscriptionsStore.collectionDetail?.collections.facetStat.contractAddress)) {
    MarketplaceTabs = MarketplaceTabs.filter((item) => item.value !== 'swap');
  }

  return (
    <Box>
      <DetailBack label="Tokens / Detail" />
      <CollectionDetail category="token" />
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
              padding: matches ? '30px 0 0' : '15px  0 0',
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

export default TokenPage;
