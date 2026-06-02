// ============================================================================
// 【主导航菜单】整站顶部导航栏的菜单部分（不含 Logo、钱包、购物车）
// ----------------------------------------------------------------------------
// 文件结构（包含 3 个组件）：
//   1. IndexerMenu  → "Indexer" 下拉菜单（含 Ethscriptions、Transactions 子项）
//   2. MoreMenu     → "..." 下拉菜单（含外链：表单、Dune 数据等）
//   3. NavigationAPP → 主导航菜单（拼装上述两个 + 平铺的菜单项）
//
// 响应式设计的双形态：
//   - 桌面端（matches=true）：菜单横向排列，子菜单用 Menu 下拉
//   - 移动端（matches=false）：菜单纵向排列，子菜单用 Collapse 折叠
//   两套 UI 同一份数据，通过 matches 切换。
//
// 关键依赖：
//   - usePathname()  → Next.js 提供的钩子，获取当前路径用于高亮当前菜单
//   - useRouter()    → 编程式跳转（点击菜单项时使用）
//
// 高亮规则：
//   - 子菜单：pathname === item.pathname 完全匹配才高亮
//   - 主菜单：pathname.startsWith(item.pathname) 起始匹配（如 /market/xxx 也算 /market 高亮）
//
// 菜单数据：
//   menu       → 主菜单平铺项（Tokens / Marketplace / Launchpad）
//   indexerLinks → Indexer 子项（Ethscriptions / Transactions）
//   outerLinks → 外链项（带 SharpSVG 角标，新窗口打开）
// ============================================================================

'use client';

import {
  Box,
  Button,
  Collapse,
  Divider,
  List,
  ListItemButton,
  ListItemText,
  Menu,
  MenuItem,
  Typography,
} from '@mui/material';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import useMediaQuery from '@mui/material/useMediaQuery';
import React, { useMemo, useState } from 'react';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import MediaList from './MediaList';
import SharpSVG from '@/assets/icons/sharp.svg';
import { ExpandLess, ExpandMore } from '@mui/icons-material';
import ConnectWallet from '@/containers/ConnectWallet';

type INavigationAPP = {
  // 点击菜单项后的回调（移动端用于关闭抽屉式菜单）
  onClick?: () => void;
};

// ============================================================================
// 子组件 1：IndexerMenu —— "Indexer" 下拉菜单
// 桌面端：鼠标点击 → 弹出 Menu；移动端：点击 → Collapse 展开/收起
// ============================================================================
const IndexerMenu: React.FC<INavigationAPP> = ({ onClick }) => {
  const matches = useMediaQuery('(min-width:750px)');
  const [anchorIndexerEl, setanchorIndexerEl] = useState<null | HTMLElement>(null);
  const openIndexer = Boolean(anchorIndexerEl);
  const [expandIndexer, setExpandIndexer] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const onClickIndexer = (event: React.MouseEvent<HTMLDivElement>) => {
    setanchorIndexerEl(event.currentTarget);
  };
  const handleCloseIndexer = () => {
    setanchorIndexerEl(null);
  };
  const indexerLinks = [
    {
      pathname: '/ethscriptions',
      name: 'Ethscriptions',
      isNew: false,
    },
    {
      pathname: '/transactions',
      name: 'Transactions',
      isNew: false,
    },
  ];
  const isIndexerRoutes = useMemo(
    () => Boolean(indexerLinks.find((item) => item.pathname === pathname)),
    [pathname, indexerLinks],
  );
  return (
    <>
      {matches ? (
        <>
          <Box className={'menu'} sx={{ display: 'flex' }} onClick={onClickIndexer}>
            <Box className={isIndexerRoutes ? 'active-menu' : ''}>Indexer</Box>
            {openIndexer ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
          </Box>
          <Menu
            id="basic-menu"
            anchorEl={anchorIndexerEl}
            open={openIndexer}
            onClose={handleCloseIndexer}
            sx={{
              '& .MuiMenu-paper': {
                borderRadius: '8px',
                mt: '10px',
              },
            }}
            MenuListProps={{
              'aria-labelledby': 'basic-button',
            }}
          >
            {indexerLinks.map((item) => (
              <MenuItem
                key={item.name}
                sx={{
                  color: pathname === item.pathname ? 'white' : 'rgba(255,255,255,0.64)',
                  fontSize: '14px',
                  '&:hover': { color: 'white' },
                }}
                onClick={() => {
                  router.push(item.pathname);
                  handleCloseIndexer();
                }}
              >
                {item.name}
              </MenuItem>
            ))}
          </Menu>
        </>
      ) : (
        <>
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              width: '100%',
              alignItems: 'center',
              lineHeight: '40px',
              height: '40px',
            }}
            className="h5 memu"
            onClick={() => setExpandIndexer(!expandIndexer)}
          >
            <Typography sx={{ fontSize: '16px', fontWeight: 500 }}>Indexer</Typography>
            {expandIndexer ? <ExpandLess /> : <ExpandMore />}
          </Box>
          <Collapse sx={{ width: '100%' }} in={expandIndexer} timeout="auto" unmountOnExit>
            {indexerLinks.map((item) => {
              const active = item.pathname === pathname;
              return (
                <Box
                  onClick={() => {
                    onClick && onClick();
                  }}
                  key={item.name}
                  sx={{ width: '100%', textAlign: 'left', p: '0 12px' }}
                >
                  <Link
                    href={item.pathname}
                    key={item.name}
                    className={'h5 menu sub'}
                    style={{ position: 'relative', color: active ? 'white' : 'rgba(255,255,255,0.65)' }}
                  >
                    {item.name}
                  </Link>
                </Box>
              );
            })}
          </Collapse>
        </>
      )}
    </>
  );
};
const MoreMenu: React.FC<INavigationAPP> = ({ onClick }) => {
  // ============================================================================
  // 子组件 2：MoreMenu —— "..." 菜单（外部链接集合）
  // 【与IndexerMenu的区别】菜单项点击后走 window.open 新窗口打开，不是路由内部跳转
  // ============================================================================
  const matches = useMediaQuery('(min-width:750px)');
  const [anchorMoreEl, setanchorMoreEl] = useState<null | HTMLElement>(null);
  const openMore = Boolean(anchorMoreEl);
  const [expandMore, setExpandMore] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const onClickMore = (event: React.MouseEvent<HTMLDivElement>) => {
    setanchorMoreEl(event.currentTarget);
  };
  const handleCloseMore = () => {
    setanchorMoreEl(null);
  };
  const outerLinks = [
    {
      name: 'List Marketplace',
      pathname: 'https://forms.gle/T4n73hAWoJNKSjgFA',
    },
    {
      name: 'Apply For Launchpad',
      pathname: 'https://forms.gle/i54oqjXL2Rqsi61y8',
    },
    {
      name: 'Dune Analytics',
      pathname: 'https://dune.com/etchmarket/ethscriptions-marketplaces',
    },
  ];

  return (
    <>
      {matches ? (
        <>
          <Box className={'menu'} sx={{ display: 'flex' }} onClick={onClickMore}>
            <Box>...</Box>
          </Box>
          <Menu
            id="basic-menu"
            anchorEl={anchorMoreEl}
            open={openMore}
            onClose={handleCloseMore}
            sx={{
              '& .MuiMenu-paper': {
                borderRadius: '8px',
                mt: '10px',
              },
            }}
            MenuListProps={{
              'aria-labelledby': 'basic-button',
            }}
          >
            {outerLinks.map((item) => (
              <MenuItem
                key={item.name}
                sx={{
                  color: pathname === item.pathname ? 'white' : 'rgba(255,255,255,0.64)',
                  fontSize: '14px',
                  '&:hover': { color: 'white' },
                }}
                onClick={() => {
                  window.open(item.pathname);
                  handleCloseMore();
                }}
              >
                {item.name}
                <SharpSVG color="rgba(255,255,255,0.45)" style={{ marginLeft: '4px' }} />
              </MenuItem>
            ))}
            <Divider sx={{ mx: '10px' }} />
            <MediaList color="rgba(255,255,255,0.45)" />
          </Menu>
        </>
      ) : (
        <>
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              width: '100%',
              alignItems: 'center',
              height: '40px',
              lineHeight: '40px',
            }}
            className="h5 memu"
            onClick={() => setExpandMore(!expandMore)}
          >
            <Typography sx={{ fontSize: '16px', fontWeight: 500 }}>More</Typography>
            {expandMore ? <ExpandLess /> : <ExpandMore />}
          </Box>
          <Collapse sx={{ width: '100%' }} in={expandMore} timeout="auto" unmountOnExit>
            {outerLinks.map((item) => (
              <Box
                onClick={() => {
                  onClick && onClick();
                }}
                key={item.name}
                sx={{ width: '100%', textAlign: 'left', pl: '12px', whiteSpace: 'noWrap' }}
              >
                <Link href={item.pathname} target="_blank" key={item.name} className={'h5 menu sub'}>
                  {item.name}
                </Link>
              </Box>
            ))}
          </Collapse>
        </>
      )}
    </>
  );
};

const NavigationAPP: React.FC<INavigationAPP> = ({ onClick }) => {
  // ============================================================================
  // 主组件：NavigationAPP —— 拼装所有菜单项
  // 桌面布局：IndexerMenu | Tokens | Marketplace | Launchpad | MoreMenu（横向）
  // 移动布局：垂直排列 + 额外加上 ConnectWallet、My Ethscriptions、My Assets、媒体图标
  // ============================================================================
  const matches = useMediaQuery('(min-width:750px)');
  const pathname = usePathname();
  const menu = [
    // 【被注释掉的菜单项】ERC20S、Staking、Swap、Bridge
    // 保留在代码中是为了未来迅速重启用，不需要重新设计路由/UI
    // {
    //   name: 'ERC20S',
    //   pathname: '/erc20s',
    //   isNew: false,
    // },
    // {
    //   name: 'Staking',
    //   pathname: '/staking',
    //   isNew: false,
    // },
    {
      name: 'Tokens',
      pathname: '/tokens',
      isNew: false,
    },
    {
      name: 'Marketplace',
      pathname: '/market',
      isNew: false,
    },
    // {
    //   name: 'Swap',
    //   pathname: '/swap',
    //   isNew: false,
    // },
    // {
    //   name: 'Bridge',
    //   pathname: '/bridge',
    //   isNew: false,
    // },
    {
      name: 'Launchpad',
      pathname: '/launchpad',
      isNew: false,
    },
  ];

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        flexDirection: matches ? 'row' : 'column',
        gap: matches ? '28px' : 'none',
        // 【CSS 全局样式】通过 sx 的子选择器统一控制所有 .menu 类名的子元素
        // 这样菜单项不需要逐个写 sx，减少重复代码
        '& .menu': {
          fontSize: '16px',
          fontWeight: 500,
          color: 'rgba(255,255,255,0.64)',
          textDecoration: 'none',
          '&:hover': {
            cursor: 'pointer',
          },

          '&.h5': {
            width: '100%',
            lineHeight: '40px',
            background: '#171A1F',
            color: 'white',
          },
          '&.sub': {
            color: 'rgba(255,255,255,0.65)',
            fontWeight: 400,
          },
          '& .active-menu': {
            color: '#fff',
          },
        },
        '& .active-menu': {
          color: '#fff',
        },
      }}
    >
      {/* 移动端才显示“连接钱包”按钮（桌面端独立放在 Header 右侧） */}
      {!matches && (
        <Box
          sx={{
            mb: '24px',
          }}
        >
          <ConnectWallet />
        </Box>
      )}
      <IndexerMenu onClick={onClick} />
      {menu.map((item) => {
        // 首页 '/' 必须完全相等才高亮；其他路由用 startsWith（子路由也让父高亮）
        const isActive = item.pathname == '/' ? item.pathname == pathname : pathname.startsWith(item.pathname);
        return (
          <Link
            href={item.pathname}
            key={item.name}
            className={matches ? (isActive ? 'menu active-menu' : 'menu') : 'h5 menu'}
            style={{ position: 'relative' }}
            onClick={onClick}
          >
            {item.name}
            {item.isNew && (
              <Typography
                sx={{
                  p: '0 6px',
                  background: '#80ec9f',
                  color: '#000',
                  position: { xs: 'unset', sm: 'absolute' },
                  right: '-25px',
                  top: '-10px',
                  borderRadius: '30px',
                  fontSize: '12px',
                  fontWeight: 600,
                }}
              >
                New
              </Typography>
            )}
          </Link>
        );
      })}
      {!matches && (
        <Link href={'/owner'} className={'h5 menu'} style={{ position: 'relative' }} onClick={onClick}>
          My Ethscriptions
        </Link>
      )}

      {!matches && (
        <Link href={'/asset'} className={'h5 menu'} style={{ position: 'relative' }} onClick={onClick}>
          My Assets
        </Link>
      )}

      <MoreMenu onClick={onClick} />
      {!matches && (
        <Box mt={'14px'} width={'100%'}>
          <MediaList
            sx={{
              justifyContent: 'flex-start',
              p: 0,
              width: '100%',
            }}
            color="rgba(255,255,255,0.45)"
          />
        </Box>
      )}
    </Box>
  );
};

export default NavigationAPP;
