// ============================================================================
// 【app/owner/page.tsx】用户资产/主页（"My Ethscriptions"）
// ----------------------------------------------------------------------------
// 主要入口页面：主要挂载了返回导航、我的铭文展示容器 (MyEthscriptions) 以及针对其操作的批量功能 (BulkOperation)。
// ============================================================================

'use client';

import { Fragment } from 'react';
import { useMediaQuery } from '@mui/material';

import DetailBack from './DetailBack';
import MyEthscriptions from '@/containers/MyEthscriptions';
import BulkOperation from '@/containers/MyEthscriptions/BulkOperation';
import BulkOperationH5 from '@/containers/MyEthscriptions/BulkOperationH5';

const EthscriptionsPage = () => {
  const matches = useMediaQuery('(min-width:750px)');
  return (
    <Fragment>
      <DetailBack label="My Ethscriptions" />
      <MyEthscriptions />
      {matches ? <BulkOperation /> : <BulkOperationH5 />}
    </Fragment>
  );
};

export default EthscriptionsPage;
