/**
 * ==============================================================
 * 文件：src/containers/Header.tsx
 * 作用：全局顶部导航栏
 *
 * 这个组件是整个网站的"脸面"，包含：
 *   - 网站 Logo（点击回首页）
 *   - 导航菜单（PC 端横向导航 / 移动端汉堡菜单）
 *   - 搜索框（PC 端宽屏时显示）
 *   - 连接钱包按钮
 *   - 购物车入口
 *
 * 响应式设计策略：
 *   这个组件有多套 UI，根据屏幕宽度自动切换：
 *   ≥750px（平板/PC）：Logo + 横向导航菜单 + 搜索框 + 钱包按钮
 *   <750px（手机）：Logo/移动Logo + 移动搜索框 + 汉堡菜单按钮（点击展开侧边菜单）
 *   ≥1250px（宽屏）：额外显示 Header 内嵌搜索框
 *
 * 重要逻辑：
 *   组件挂载/地址变化时，初始化登录状态（从 localStorage 恢复 token）
 *   并向 Sentry 上报当前钱包信息（用于错误追踪）
 * ==============================================================
 */

'use client';
// ↑ 客户端组件（使用了多个客户端 Hook：useState、useEffect、useMediaQuery 等）

import { Box, Drawer, IconButton } from '@mui/material';
// ↑ MUI 组件：
// Box：通用容器（相当于带 sx 属性的 div，支持响应式样式）
// Drawer：抽屉组件（从侧边滑出的面板，用于移动端菜单）
// IconButton：图标按钮（只有图标，没有文字的按钮）

import { useEffect, useMemo, useState } from 'react';
// ↑ useEffect：副作用（监听地址变化）
// useMemo：缓存计算结果（避免每次渲染都重新计算）
// useState：组件内部状态

import { useAccount, useConnect } from 'wagmi';
// ↑ wagmi 的 Hook：
// useAccount：获取当前连接的钱包信息（地址、连接器、是否连接等）
// useConnect：（这里导入了但未使用，可能是历史遗留）

import useMediaQuery from '@mui/material/useMediaQuery';
// ↑ MUI 的响应式检测 Hook
// 用法：useMediaQuery('(min-width:750px)') 在屏幕≥750px时返回true
// 当窗口大小变化时，自动重新计算并触发组件更新

import * as Sentry from '@sentry/nextjs';
// ↑ Sentry 错误监控 SDK
// 用于设置"tag"（标签），方便在 Sentry 控制台按钱包地址筛选错误报告

import ConnectWallet from '@/containers/ConnectWallet';
// ↑ 连接钱包按钮容器组件

import LogoSVG from '@/assets/icons/logo.svg';
// ↑ PC 端完整 Logo（SVG 格式，直接作为 React 组件使用）
// 可以通过 @svgr/webpack 实现（在 next.config.js 中配置）

import LogoMobileSVG from '@/assets/icons/logo_mobile.svg';
// ↑ 移动端简化版 Logo（通常是只有图标，没有文字的版本）

import NavigationAPP from './NavigationAPP';
// ↑ 导航菜单组件（同一 containers 目录下的组件）

import * as GlobalStore from '@/stores/GlobalStore';
// ↑ 全局状态 store（用于初始化登录状态）

import H5MenuSvg from '@/assets/icons/h5_menu.svg';
// ↑ 移动端汉堡菜单图标（H5 = HTML5，即移动端的意思）

import CartDrawer from '@/containers/CartDrawer';
// ↑ 购物车抽屉组件（右侧滑出的购物车面板）

import SearchInput from '@/components/SearchInput';
// ↑ 搜索框组件（纯展示组件，接收 onEnter/onClick 回调）

import { usePathname, useRouter } from 'next/navigation';
// ↑ Next.js 的路由 Hook：
// usePathname：获取当前页面路径（如 '/market'、'/'）
// useRouter：路由操作（push 跳转、replace 替换当前历史记录等）

const Header = () => {
  // ─────────────────────────────────────────────────────────────
  // 响应式断点检测
  // ─────────────────────────────────────────────────────────────
  const matches = useMediaQuery('(min-width:750px)');
  // ↑ matches = true：屏幕宽≥750px（平板/PC）
  // matches = false：屏幕宽<750px（手机）
  // 这个值变化时，组件会自动重新渲染，切换不同的 UI

  const pathname = usePathname();
  // ↑ 当前路径字符串，如 '/'、'/market'、'/swap' 等
  // 用于判断当前在哪个页面，决定某些 UI 是否显示

  const isHome = useMemo(() => pathname === '/', [pathname]);
  // ↑ 是否是首页
  // useMemo：只在 pathname 变化时重新计算（性能优化）
  // 用途：首页有特殊的 UI 处理（如：移动端首页显示完整 Logo）

  const hidePcSearch = useMediaQuery('(max-width:1250px)');
  // ↑ hidePcSearch = true：屏幕宽≤1250px（不够宽，Header 内不显示搜索框）
  // hidePcSearch = false：屏幕宽>1250px（够宽，Header 右侧额外显示搜索框）

  const { address, connector } = useAccount();
  // ↑ 从 wagmi 获取钱包连接信息：
  // address：当前钱包地址（如 '0xAbCd...1234'）；未连接时为 undefined
  // connector：当前使用的钱包连接器（如 MetaMask Connector）；含 .name 属性

  const [openH5Menu, setOpenH5Menu] = useState<boolean>(false);
  // ↑ 移动端汉堡菜单是否展开
  // false = 菜单收起（默认）
  // true = 菜单展开（用户点击了汉堡图标）

  const router = useRouter();
  // ↑ Next.js 路由实例，用于跳转页面

  const showPcSearch = useMemo(() => !isHome && !hidePcSearch, [pathname, hidePcSearch]);
  // ↑ 是否在 Header 中显示 PC 端搜索框
  // 条件：不是首页 AND 屏幕宽>1250px
  // 为什么首页不显示？首页有自己的大型搜索框（居中展示），Header 里不需要重复

  // ─────────────────────────────────────────────────────────────
  // 事件处理函数
  // ─────────────────────────────────────────────────────────────

  // 搜索回调：把搜索词作为 URL 参数，跳转到搜索结果页
  const goSearch = (e: string) => {
    router.replace(`/search?searchBy=${e}`);
    // router.replace vs router.push：
    // push：在历史记录中添加新条目（用户可以点"后退"回来）
    // replace：替换当前历史条目（搜索时通常用 replace，避免"后退"返回上一次搜索）
  };

  // 向 Sentry 设置当前用户标签（用于错误追踪时过滤特定用户的报错）
  const setSentryTag = () => {
    Sentry.setTag('account', address);
    // ↑ 设置 'account' 标签 = 当前钱包地址
    // 在 Sentry 控制台可以按地址搜索该用户遇到的所有错误

    Sentry.setTag('ConnectorName', connector?.name);
    // ↑ 设置 'ConnectorName' 标签 = 钱包类型（如 'MetaMask'、'OKX Wallet'）
    // 有助于判断某类问题是否只在特定钱包中出现
  };

  // ─────────────────────────────────────────────────────────────
  // 副作用：监听钱包地址/连接器变化
  // ─────────────────────────────────────────────────────────────
  useEffect(() => {
    if (address) {
      GlobalStore.initRainbowKitAuthStatus(address);
      // ↑ 用户连接了钱包（address 有值）：
      // 尝试从 localStorage 恢复该地址的登录 token
      // 如果有有效 token → 自动设为已登录状态（用户无需重新点 Sign In）
    }
    if (address && connector) {
      setSentryTag();
      // ↑ 同时有地址和连接器时，向 Sentry 上报钱包信息
    }
  }, [address, connector]);
  // ↑ 依赖：address 或 connector 变化时重新执行
  // 触发场景：
  //   - 用户首次连接钱包（address 从 undefined 变为地址）
  //   - 用户切换钱包地址
  //   - 用户切换钱包类型（如从 MetaMask 切到 OKX）

  // ─────────────────────────────────────────────────────────────
  // 渲染
  // ─────────────────────────────────────────────────────────────
  return (
    <Box
      sx={{
        width: '100vw', // 占满视口宽度（vw = viewport width）
        height: '64px', // 固定高度 64px
        background: '#171A1F', // 深色背景（品牌深黑色）
        backdropFilter: 'blur(4.5px)', // 背景模糊效果（毛玻璃感），增加层次感
        display: 'flex',
        justifyContent: 'space-between', // 子元素两端对齐
        alignItems: 'center', // 垂直居中
        position: 'fixed', // 固定定位：始终显示在屏幕顶部，不随滚动消失
        left: '0',
        top: '0',
        zIndex: (theme) => theme.zIndex.drawer + 1,
        // ↑ z-index（层叠顺序）
        // MUI Drawer 的默认 zIndex 是 1200，这里设置比 Drawer 高 1（即 1201）
        // 确保 Header 始终在所有弹出层（包括侧边抽屉）之上
      }}
    >
      {/* ─── 左侧：Logo + 导航菜单区域 ─── */}
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        {/* Logo：点击跳转首页 */}
        <Box
          onClick={() => {
            router.push('/');
            // ↑ 点击 Logo 返回首页（push 会在历史记录中添加一条 '/' 记录）
          }}
          sx={{
            position: 'absolute', // 绝对定位，精确控制 Logo 的位置
            left: '24px', // 距左边 24px
            zIndex: 5, // 比导航菜单层级高，避免被覆盖
            display: 'flex',
            alignItems: 'center',
            textDecoration: 'none', // 去掉链接下划线
            cursor: 'pointer', // 鼠标悬停显示手型
          }}
        >
          {/* Logo 显示逻辑：
              条件 matches || (!matches && isHome) 的含义：
              - PC 端（matches=true）：显示完整 Logo
              - 移动端首页（!matches && isHome）：显示完整 Logo
              - 移动端非首页（!matches && !isHome）：显示简化 Logo（节省空间）
          */}
          {matches || (!matches && isHome) ? <LogoSVG /> : <LogoMobileSVG />}
        </Box>

        {/* 移动端非首页：在 Logo 右侧显示搜索框（代替导航菜单） */}
        {!matches && !isHome && (
          <SearchInput
            sx={{
              p: '2px 4px',
              display: 'flex',
              alignItems: 'center',
              width: '52vw', // 宽度占视口的 52%
              height: 40,
              ml: '70px', // 左边距 70px（避开 Logo）
              borderRadius: '20px', // 圆角搜索框
              border: '1px solid #2F343E',
            }}
            placeholder={matches ? 'Search ethscriptions' : 'Ethscription'}
            onClear={() => {}}
            onClick={(val) => {
              goSearch(val as string);
            }}
            onEnter={(val) => {
              // ↑ 用户按 Enter 键触发搜索
              goSearch(val as string);
            }}
          />
        )}

        {/* PC 端：在 Logo 右侧显示横向导航菜单 */}
        {matches && (
          <Box
            sx={{
              position: 'absolute',
              height: '100%',
              top: 0,
              left: '164px', // 距左边 164px（Logo 宽度约 140px + 间距）
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              pointerEvents: 'fill', // 确保菜单区域可以接收鼠标事件
              zIndex: 2,
            }}
          >
            <NavigationAPP />
            {/* ↑ 横向导航菜单：包含 Indexer、Market、Swap 等菜单项 */}
          </Box>
        )}
      </Box>

      {/* ─── 右侧：搜索框 + 钱包按钮 + 购物车区域 ─── */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          position: 'absolute',
          right: matches ? '20px' : '54px',
          // ↑ PC 端：距右 20px；移动端：距右 54px（为右边的汉堡菜单按钮留位置）
          zIndex: 5,
        }}
      >
        {/* 宽屏 PC 端：Header 内嵌搜索框（非首页、且屏幕>1250px 时显示） */}
        {showPcSearch && (
          <SearchInput
            sx={{
              p: '2px 4px',
              display: 'flex',
              alignItems: 'center',
              width: matches ? '300' : '52vw',
              height: 40,
              mr: '20px', // 右边距，与钱包按钮保持间距
              borderRadius: matches ? '6px' : '20px', // PC 方角，移动端圆角
              border: '1px solid #2F343E',
            }}
            placeholder={matches ? 'Search ethscriptions' : 'Ethscription'}
            onClear={() => {}}
            onClick={(val) => {
              goSearch(val as string);
            }}
            onEnter={(val) => {
              goSearch(val as string);
            }}
          />
        )}

        <Box
          sx={{
            zIndex: 5,
            display: 'flex',
            alignItems: 'center',
            gap: '10px', // 子元素之间间距 10px
          }}
        >
          {/* PC 端显示"连接钱包"按钮；移动端该按钮放在汉堡菜单里 */}
          {matches && <ConnectWallet />}

          {/* 购物车图标（所有设备都显示） */}
          <CartDrawer />
          {/* ↑ CartDrawer 内部包含购物车图标和数量徽章，点击打开购物车抽屉 */}
        </Box>
      </Box>

      {/* ─── 移动端：汉堡菜单按钮（仅手机显示） ─── */}
      {!matches && (
        <Box sx={{ position: 'absolute', right: '10px', zIndex: '5' }}>
          <IconButton
            onClick={() => {
              setOpenH5Menu(!openH5Menu);
              // ↑ 切换菜单展开/收起状态（toggle）
            }}
          >
            <H5MenuSvg />
            {/* ↑ 汉堡菜单图标（三条横线） */}
          </IconButton>
        </Box>
      )}

      {/* ─── 移动端：侧边抽屉菜单 ─── */}
      {openH5Menu && !matches && (
        // ↑ 只在移动端且菜单展开时渲染（性能优化：不展开就不渲染）
        <Drawer
          sx={{
            '& .MuiDrawer-paper': {
              // ↑ 使用 MUI 的 CSS 选择器语法，定制 Drawer 内部纸张容器的样式
              top: '64px', // 从 Header 底部（64px）开始，不遮挡 Header
              background: '#171A1F', // 与 Header 相同的深色背景
              width: '220px', // 抽屉宽度
              p: '24px 20px', // 内边距
            },
          }}
          anchor={'right'} // 从右侧滑入
          open={openH5Menu} // 是否展开
          onClose={() => setOpenH5Menu(false)} // 点击遮罩层关闭菜单
        >
          <NavigationAPP
            onClick={() => {
              setOpenH5Menu(false);
              // ↑ 点击菜单项后，自动收起汉堡菜单（用户体验优化）
            }}
          />
          {/* ↑ 移动端在抽屉内也渲染导航菜单（包含"连接钱包"按钮） */}
        </Drawer>
      )}
    </Box>
  );
};

export default Header;
