/**
 * ==============================================================
 * 文件：src/app/market/layout.tsx
 * 作用：市场模块（/market/*）的共享布局
 *
 * Next.js Layout 特性：
 *   访问 /market、/market/nft、/market/token 时，本 layout 不会卸载，
 *   只有 {children} 部分切换 → CategoryTag 选中态、Footer 保持不动
 *
 * 布局结构：
 *   ┌─────────────────────────────────────┐
 *   │ CategoryTag（Token/Domain/NFT Tab） │  My Ethscriptions 按钮
 *   ├─────────────────────────────────────┤
 *   │ {children}  ← page.tsx 内容          │
 *   ├─────────────────────────────────────┤
 *   │ Footer                               │
 *   └─────────────────────────────────────┘
 *
 * OG Pass 徽章：
 *   globalStore.isOgPass 由 providersMiddleware 在连接钱包后查询 DID 接口设置
 *   早期用户（OG）在 market 页显示专属小图标，增强社区认同感
 *
 * 移动端 CategoryTag → LocalSelect：
 *   Tab 横向排列在小屏放不下，改用下拉选择 category，onChange 跳转 /market?category=xxx
 * ==============================================================
 */

'use client';

import Footer from '@/containers/Footer';
import services from '@/services';
import { Box, Button, useMediaQuery } from '@mui/material';
import { useEffect, useState } from 'react';
import { useAccount } from 'wagmi';
import { useSnapshot } from 'valtio';
import { useRouter, useSearchParams } from 'next/navigation';

import * as GlobalStore from '@/stores/GlobalStore';
import OGPassSmallSVG from '@/assets/icons/og_pass_small.svg';
import CategoryTag from './CategoryTag';
import Link from 'next/link';
import LocalSelect from '@/components/LocalSelect';

export default function MarketLayout({ children }: { children: React.ReactNode }) {
  const globalStore = useSnapshot(GlobalStore.store);
  const matches = useMediaQuery('(min-width:750px)');

  const router = useRouter();

  return (
    <Box sx={{ paddingTop: '64px', boxSizing: 'border-box' }}>
      <Box sx={{ minHeight: 'calc(100vh - 203.5px)', p: { xs: '0 10px 110px', sm: '0 140px 110px' } }}>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            p: '40px 0 34px',
            gap: '20px',
            boxSizing: 'border-box',
            justifyContent: 'space-between',
          }}
        >
          {matches ? (
            <CategoryTag />
          ) : (
            <LocalSelect
              conditionArr={[
                { label: 'Token', value: 'token' },
                { label: 'Domain', value: 'domain' },
                { label: 'NFT', value: 'nft' },
              ]}
              onChange={(item) => {
                router.push(`/market?category=${item.value}`);
              }}
              bordered={true}
              sx={{
                '.MuiSelect-select.MuiSelect-outlined': {
                  color: '#E5FF65',
                },
                '& svg': {
                  color: '#E5FF65',
                },
                '& fieldset': {
                  borderRadius: '44px',
                  borderColor: '#E5FF65',
                },
              }}
            />
          )}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            {globalStore.isOgPass && <OGPassSmallSVG />}
            <Link href="/owner" style={{ textDecoration: 'none' }}>
              <Box
                sx={{
                  height: '40px',
                  width: '140px',
                  borderRadius: '46px',
                  fontFamily: 'HarmonyOS Sans',
                  background: '#E5FF65',
                  fontWeight: 500,
                  fontSize: '14px',
                  boxSizing: 'border-box',
                  color: '#171A1F',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  transition: 'background 0.2s ease-in-out',
                  '&:hover': {
                    background: 'rgba(229,255,101,0.7)',
                  },
                }}
              >
                My Ethscriptions
              </Box>
            </Link>
          </Box>
        </Box>
        {children}
      </Box>
      <Footer />
    </Box>
  );
}
