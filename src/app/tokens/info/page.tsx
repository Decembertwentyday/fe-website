// ============================================================================
// 【app/tokens/info/page.tsx】Token 铭文详情页（路由：/tokens/info?p=...&tick=...）
// ----------------------------------------------------------------------------
// 职责：
//   展示某个具体 Token 的详细页面，由三部分组成：
//   1. 顶部导航栏：返回按钮 + 集合标签（协议名 + tick 名）
//   2. TokenOverview：铸造进度条 + 详情数据面板（含 Ethscribe 按钮）
//   3. TokenTables：持有者列表（Holders）+ 转账记录（Transfers）Tab 切换
//
// URL 参数读取：
//   p = 协议名（如 'erc-20'、'erc--20'）
//   tick = 代币符号（如 'ordi'）
//   两个参数通过 useSearchParams 从 URL query string 读取
//
// 组件关系：
//   CoinDetails（薄页面，负责布局和参数传递）
//     └─ TokenOverview（厚容器，铸造进度/数据/按钮）
//     └─ TokenTables（厚容器，Holders/Transfers Tab 切换）
//
// EthscriptionLabel 用法：
//   这里把 `${p} ${data.tick}` 作为 collectionName 传入，
//   所以显示的是"erc-20 ordi"这样的协议+符号文字。
// ============================================================================

'use client';

import { Box, IconButton } from '@mui/material';
import { useRouter, useSearchParams } from 'next/navigation';
import BackSVG from '@/assets/icons/back.svg';
import TokenOverview from '@/containers/TokenOverview';
import TokenTables from '@/containers/TokenTables';
import EthscriptionLabel from '@/components/EthscriptionLabel';

const CoinDetails = () => {
  const router = useRouter();

  const queryParams = useSearchParams();

  // 从 URL query string 中读取协议名和代币符号
  const data = { p: queryParams?.get('p') ?? '', tick: queryParams?.get('tick') ?? '' };

  return (
    // 最小高度保证页面不空洞；居中且最大宽 1160px（桌面端固定宽度）
    <Box sx={{ minHeight: 'calc(100vh - 203.5px)', width: { xs: '100%', sm: '1160px' }, margin: '0 auto' }}>
      {/* 顶部：返回按钮 + 集合标签（显示协议名+tick）*/}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: '28px' }}>
        <IconButton
          sx={{ marginRight: '16px' }}
          onClick={() => {
            router.back(); // 返回上一页
          }}
        >
          <BackSVG />
        </IconButton>
        {/* collectionName 格式："{p} {tick}"，如 "erc-20 ordi" */}
        <EthscriptionLabel collectionName={`${data.p} ${data.tick}`} category="token" icon="" />
      </Box>
      {/* 铸造进度、详情数据、Ethscribe 按钮 */}
      <TokenOverview {...data} />
      {/* Holders / Transfers Tab 切换表格 */}
      <TokenTables {...data} />
    </Box>
  );
};

export default CoinDetails;
