// ============================================================================
// 【app/tokens/page.tsx】Token 铭文主页（路由：/tokens）
// ----------------------------------------------------------------------------
// 职责：
//   "薄页面"模式：自身只负责布局和导航，数据展示委托给 TokenList 容器。
//
// 页面结构（从上到下）：
//   1. 说明文字（荧光黄标题）：提示用户可以查询地址的 Token 持仓
//   2. SearchInput：输入地址后跳转查询
//   3. 辅助说明文字：说明支持 DEPLOY/MINT/TRANSFER 操作
//   4. TokenList：ERC-20 Token 铭文全量列表（厚容器）
//
// SearchInput 三个回调的导航逻辑：
//   - onClear：清空输入框 → 跳转到 /tokens/search（无参数，展示全量结果）
//   - onClick（点击搜索按钮）→ 跳转到 /tokens/search?address=xxx
//   - onEnter（按回车键）→ 同 onClick
//   注意：使用 router.replace 而非 router.push，
//   这样用户按浏览器返回键不会回到中间搜索状态。
// ============================================================================

'use client';

import { Box, Typography } from '@mui/material';

import TokenList from '@/containers/TokenList';
import { useRouter } from 'next/navigation';
import SearchInput from '@/components/SearchInput';

const TokenPage = () => {
  const router = useRouter();

  return (
    // minHeight 确保页面高度至少等于视口减去 Header+Footer 高度（203.5px），避免 Footer 悬空
    <Box sx={{ minHeight: 'calc(100vh - 203.5px)' }}>
      {/* 荧光黄说明文字 */}
      <Typography
        sx={{
          color: '#E6FF65',
          textAlign: 'center',
          fontSize: '20px',
          fontWeight: '600',
          letterSpacing: '1px',
        }}
        gutterBottom
      >
        Check out token ethscriptions balance of the address.
      </Typography>
      <Box sx={{ display: 'flex', justifyContent: 'center', m: '24px 0 16px 0' }}>
        {/* 搜索框：输入以太坊地址后回调导航 */}
        <SearchInput
          onClear={() => {
            // 清空时跳转无参搜索页
            router.replace('/tokens/search');
          }}
          onClick={(value) => {
            // 点击搜索按钮跳转，并附带 address 参数
            router.replace(`/tokens/search?address=${value}`);
          }}
          onEnter={(value) => {
            // 回车键效果同点击按钮
            router.replace(`/tokens/search?address=${value}`);
          }}
        />
      </Box>
      <Typography
        sx={{
          color: 'rgba(255, 255, 255, 0.8)',
          textAlign: 'center',
          fontSize: '14px',
          lineHeight: '16px',
          letterSpacing: '1px',
        }}
        gutterBottom
      >
        Recognize all operations including DEPLOY, MINT and TRANSFER.
      </Typography>
      <TokenList />
    </Box>
  );
};

export default TokenPage;
