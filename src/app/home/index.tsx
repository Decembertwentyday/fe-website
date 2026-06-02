/**
 * ==============================================================
 * 文件：src/app/home/index.tsx
 * 作用：网站首页组件
 *
 * 首页的功能布局：
 *   ┌─────────────────────────────┐
 *   │  "The Ethscriptions Explorer"│  ← 标题
 *   │  [  搜索框（多类型）  ]       │  ← 多类型搜索
 *   │                             │
 *   │  [最新铭文列表] [最新交易]    │  ← 两栏实时数据
 *   └─────────────────────────────┘
 *
 * 设计理念：
 *   首页是用户的"入口"，主要目的是：
 *   1. 让用户快速搜索想找的铭文
 *   2. 展示平台活跃度（实时的铭文和交易动态）
 *
 * 组件职责：
 *   这是一个"中等智能"的组件——它管理搜索相关的状态，
 *   但把展示逻辑交给子组件（RecentEthsciptionList、LatestTransactionList）
 * ==============================================================
 */

'use client';
// ↑ 客户端组件（使用了 useState、useRouter 等客户端 API）

import { Box, Typography, useMediaQuery, Grid } from '@mui/material';
// ↑ MUI 组件：
// Box：通用容器
// Typography：文字排版组件（比直接用 <p><h1> 有更多样式控制）
// useMediaQuery：响应式断点检测（但这里导入了没用，可能是遗留）
// Grid：栅格布局系统（将屏幕分为 12 列，lg=6 表示宽屏占 6 列即一半）

import { Fragment, useEffect, useState } from 'react';
// ↑ Fragment、useEffect 导入了但实际没有使用，是历史遗留的冗余导入

import HomeLayout from './HomeLayout';
// ↑ 首页的布局容器（提供背景图、页脚、全屏高度等）

import MutipleTypeSearchInput from '@/components/MutipleTypeSearchInput';
// ↑ 多类型搜索框组件（支持按 token/domain/text/number/all 类型搜索）
// 注意：组件名拼写是 Mutiple（应该是 Multiple），是代码中的 typo

import RecentEthsciptionList from '@/containers/RecentEthsciptionList';
// ↑ 最新铭文列表容器组件（同样有 typo：Ethsciption 应为 Ethscription）

import LatestTransactionList from '@/containers/LatestTransactionList';
// ↑ 最新交易列表容器组件

import { useRouter } from 'next/navigation';
// ↑ Next.js 路由 Hook，用于跳转到搜索结果页

import { SearchType } from '@/services/ethscriptions/types';
// ↑ 搜索类型的枚举：'token' | 'domain' | 'text' | 'number' | 'all' | ''

const Home = () => {
  // ─────────────────────────────────────────────────────────────
  // 搜索状态管理
  // ─────────────────────────────────────────────────────────────
  const [searchType, setSearchType] = useState<SearchType>('all');
  // ↑ 搜索类型，默认 'all'（搜索所有类型）
  // 用户可以点击下拉框选择：token / domain / text / number / all

  const [searchBy, setSearchBy] = useState('');
  // ↑ 搜索关键词，默认空字符串
  // 随着用户输入实时更新

  const router = useRouter();

  // ─────────────────────────────────────────────────────────────
  // 搜索触发：跳转到搜索结果页
  // ─────────────────────────────────────────────────────────────
  const onclickSearch = () => {
    router.push(`/search?searchType=${searchType}&searchBy=${searchBy}`);
    // ↑ 把搜索类型和关键词作为 URL 参数，跳转到 /search 页面
    // 示例：/search?searchType=token&searchBy=ETHS
    //
    // 为什么把参数放在 URL 里而不是状态里？
    // 优点：1. URL 可以分享给别人  2. 浏览器后退可以回到搜索状态
    //       3. 页面刷新不会丢失搜索内容（服务端渲染时可以从 URL 读取）
  };

  // 搜索类型改变的回调（传给 MutipleTypeSearchInput 子组件）
  const onSearchTypeChange = (e: SearchType) => {
    setSearchType(e);
    // ↑ 更新 searchType 状态
    // 状态更新 → 组件重新渲染 → MutipleTypeSearchInput 的 searchType prop 更新
  };

  // ─────────────────────────────────────────────────────────────
  // 渲染
  // ─────────────────────────────────────────────────────────────
  return (
    <HomeLayout>
      {/* ↑ 首页专用布局：背景图、最小全屏高度、底部页脚 */}

      <Box
        sx={{
          flex: 1, // 占据 HomeLayout 的剩余空间（把 Footer 挤到底部）
          display: 'flex',
          flexDirection: 'column', // 子元素纵向排列
          alignItems: 'center', // 水平居中
          px: { xs: '10px', sm: '140px' },
          // ↑ 响应式内边距：
          //   xs（超小屏/手机）：左右各 10px
          //   sm（小屏/平板）及以上：左右各 140px
          pb: '110px', // 底部内边距（为 Footer 留空间）
          pt: '115px', // 顶部内边距（为 Header 64px + 额外间距）
        }}
      >
        {/* 首页标题 */}
        <Typography
          sx={{
            color: '#E6FF65', // 品牌黄绿色文字
            fontSize: '20px',
            fontWeight: '600', // 半粗体
            mb: '16px', // 下边距 16px
            textAlign: 'center',
          }}
        >
          The Ethscriptions Explorer
          {/* ↑ 副标题：说明这是铭文浏览器（Explorer）功能 */}
        </Typography>

        {/* 搜索区域 */}
        <Box display="flex" flexDirection="column" alignItems="center" mb="108px">
          {/* ↑ mb="108px"：与下方列表之间留 108px 间距（视觉层次感） */}

          <MutipleTypeSearchInput
            onClear={() => {
              setSearchBy(''); // 清除搜索词
            }}
            searchType={searchType} // 当前选择的搜索类型（受控状态）
            searchBy={searchBy} // 当前输入的搜索词（受控状态）
            onSearchByChange={(e: string) => {
              setSearchBy(e); // 用户输入时实时更新
            }}
            onSearchTypeChage={onSearchTypeChange}
            // ↑ 注意：prop 名 onSearchTypeChage 也有 typo（缺少 n），是历史遗留
            onClick={onclickSearch} // 点击搜索按钮
            onEnter={onclickSearch} // 按 Enter 键
          />
          {/*
            MutipleTypeSearchInput 的 props 设计解析：
            - 它是受控组件（controlled component）：searchType 和 searchBy 由父组件管理
            - 父组件通过回调（onChange）接收子组件的输入变化
            - 这是 React 数据流的标准模式：props down（数据向下），events up（事件向上）
          */}
        </Box>

        {/* 下方两栏实时数据展示 */}
        <Grid container spacing={3} sx={{ maxWidth: '1400px' }}>
          {/*
          ↑ MUI Grid 栅格系统：
          container：这是容器（父）
          spacing={3}：子项之间的间距（3 × 8px = 24px）
          maxWidth：最大宽度限制，防止在超宽屏幕上过度拉伸
        */}

          <Grid item lg={6} xs={12}>
            {/*
            ↑ 左侧：最新铭文列表
            lg={6}：大屏时占 12 列中的 6 列（即 50%，左半边）
            xs={12}：小屏时占 12 列中的 12 列（即 100%，独占一行）
            响应式效果：宽屏两列并排，窄屏上下堆叠
          */}
            <RecentEthsciptionList />
            {/* 内部包含：标题、实时轮询刷新的铭文卡片列表 */}
          </Grid>

          <Grid item lg={6} xs={12}>
            {/* ↑ 右侧：最新交易列表（与左侧相同的响应式逻辑） */}
            <LatestTransactionList />
            {/* 内部包含：标题、实时轮询刷新的交易记录列表 */}
          </Grid>
        </Grid>

        {/* 以下是被注释掉的旧版布局（用 flex 实现的两列，已被 Grid 替代）
        <Box sx={{ display: 'flex', justifyContent: 'center', gap: '24px', ... }}>
          <RecentEthsciptionList />
          <LatestTransactionList />
        </Box>
        */}
      </Box>
    </HomeLayout>
  );
};

export default Home;
