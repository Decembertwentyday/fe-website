// ============================================================================
// 【app/bulk/page.tsx】批量挂单确认页面
// ----------------------------------------------------------------------------
// 作用：当用户在 `MyEthscriptions` 中选择完一些铭文，点击"挂单"后会挑战到这个页面进行统一价格设置和上链确认签名。
// ============================================================================

'use client';

import { Box } from '@mui/material';

import DetailBack from './DetailBack';
import BulkList from './BulkList';

const EthscriptionsPage = () => {
  return (
    <Box sx={{ width: { xs: '100%', sm: '1400px' }, margin: '0 auto' }}>
      <DetailBack label="Bulk Listing" />
      <BulkList />
    </Box>
  );
};

export default EthscriptionsPage;
