// ============================================================================
// 【containers/Erc20TokenList/index.tsx】ERC-20s 铭文列表容器
// ----------------------------------------------------------------------------
// 职责：
//   展示所有 ERC-20s 规范的铭文 Token 列表，含状态筛选 Tab + 搜索框 + 分页表格。
//   注意：这是 ERC-20s（erc--20 带双横线协议）的列表，
//   与 containers/TokenList 是同类但对应不同协议的两个容器。
//
// 与 containers/TokenList/index.tsx 的核心区别：
//   - API 请求：getErc20sList（ERC-20s 专属接口）vs getErc20（ERC-20 接口）
//   - 数据类型：GetErc20sListData vs GetErc20Data
//   - 部署按钮：DeployERC20s vs DeployERC20（部署不同协议的铭文）
//   - 默认状态：'All'（全部）vs 'InProgress'（进行中）
//   - 宽度：无固定 1160px，仅 xs:100%（全宽自适应）
//
// StatusList：4 种过滤状态
//   All（全部）、New（新发布）、InProgress（铸造中）、Completed（已完成）
//
// filterRequest：通过 useImmer 管理请求参数（状态+关键词+分页）
//   变化时 useEffect 自动触发 getErc20List()
//
// 搜索框逻辑：
//   - 回车（Enter）：取 inputRef.current.value 设置 tokenQuery + 重置页码为 1
//   - 清空输入（onInput）：内容为空时自动清除 tokenQuery
//   - 点击搜索图标：与回车逻辑相同
//   - 移动端/桌面端分别渲染搜索框（isMobile 判断）
// ============================================================================

import { Fragment, useEffect, useRef, useState } from 'react';
import {
  Box,
  Button,
  ButtonGroup,
  ButtonProps,
  Divider,
  IconButton,
  InputBase,
  Paper,
  Typography,
  useMediaQuery,
} from '@mui/material';
import { GridPaginationModel } from '@mui/x-data-grid';
import { useImmer } from 'use-immer';
import TableData from './TableData';

import SearchSVG from '@/assets/images/search-icon16.svg';
import { GetErc20ListRequest, GetErc20sListData } from '@/services/ethscriptions/types';
import services from '@/services';
import TabButton from '@/components/TabButton';
import DeployERC20s from '../Erc20sDeploy';

// 状态筛选 Tab 配置（All/New/InProgress/Completed）
const StatusList = [
  {
    label: 'All',
    value: 'All',
  },
  {
    label: 'New',
    value: 'New',
  },
  {
    label: 'In-progress',
    value: 'InProgress',
  },
  {
    label: 'Completed',
    value: 'Completed',
  },
];

// 每页初始条数（DataGrid 分页大小）
const PAGE_START_INIT = 20;

const TokenList = () => {
  const inputRef = useRef<HTMLInputElement>();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  // 是否移动端（宽度 < 750px），用于控制搜索框和按钮的布局
  const isMobile = useMediaQuery('(max-width:750px)');
  // 请求参数（状态/搜索词/分页），用 useImmer 便于嵌套更新
  const [filterRequest, setFilterRequest] = useImmer<GetErc20ListRequest>({
    status: 'All', // 默认"全部"（与 TokenList 默认 InProgress 不同）
    tokenQuery: '',
    'page.size': PAGE_START_INIT,
    'page.index': 1,
  });
  // 列表数据（DataGrid 渲染用）
  const [erc20List, setErc20List] = useState<GetErc20sListData>({
    ethscriptions: [],
    page: {
      size: PAGE_START_INIT,
      index: 1,
      total: '0',
    },
  });

  // filterRequest 变化（切换 Tab/搜索/换页）→ 重新请求
  useEffect(() => {
    getErc20List();
  }, [filterRequest]);

  // 请求 ERC-20s 铭文列表（调用 getErc20sList，注意区别于 getErc20）
  async function getErc20List() {
    if (isLoading) return; // 防止并发重复请求
    setErc20List({ ...erc20List, ethscriptions: [] }); // 清空旧数据（避免旧数据闪烁）
    setIsLoading(true);
    const response = await services.ethscriptions.getErc20sList(filterRequest);

    if (response?.code === 200) {
      setErc20List(response.data);
    }
    setIsLoading(false);
  }

  return (
    <Box
      sx={{
        width: { xs: '100%' }, // 全宽自适应（不像 TokenList 固定 1160px）
        margin: '0 auto',
        mt: '60px',
        mb: '40px',
        borderRadius: '12px',
        border: '1px solid #2F343E',
        padding: '40px',
        boxSizing: 'border-box',
        background: '#202229',
      }}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: isMobile ? 'center' : 'space-between',
          marginBottom: isMobile ? '20px' : '40px',
        }}
      >
        <Typography
          sx={{
            color: '#E6FF65',
            fontSize: isMobile ? '16px' : '18px',
            whiteSpace: 'nowrap',
            fontWeight: 500,
            letterSpacing: '1px',
          }}
        >
          The full list of token ethscriptions
        </Typography>
        {/* 桌面端：部署 ERC-20s 按钮（右上角）*/}
        {!isMobile && <DeployERC20s />}
      </Box>
      {/* 移动端：部署按钮 + 搜索框放同一行 */}
      {isMobile && (
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: '20px', width: '100%' }}>
          <DeployERC20s />
          <Box
            sx={{
              p: '2px 4px',
              display: 'flex',
              alignItems: 'center',
              width: 160,
              height: 36,
              borderRadius: '6px',
              border: '1px solid #2F343E',
              background: '#202229',
            }}
          >
            <InputBase
              sx={{ ml: 1, flex: 1, fontSize: '14px' }}
              placeholder={erc20List.ethscriptions?.[0]?.tick ?? ''} // 占位符用第一条 tick
              inputRef={inputRef}
              onKeyUp={(event) => {
                const coin_name = inputRef.current?.value?.trim();
                if (event.key === 'Enter' && coin_name) {
                  setFilterRequest((state) => {
                    state.tokenQuery = coin_name; // 回车搜索
                    state['page.index'] = 1; // 重置到第 1 页
                  });
                }
              }}
              onInput={() => {
                const coin_name = inputRef.current?.value.trim();
                if (coin_name === '') {
                  setFilterRequest((state) => {
                    state.tokenQuery = ''; // 清空时自动清除搜索词
                    state['page.index'] = 1;
                  });
                }
              }}
              endAdornment={
                <Fragment>
                  <Divider sx={{ height: 36, m: 0.5 }} orientation="vertical" />
                  <IconButton
                    color="primary"
                    sx={{ p: '10px' }}
                    onClick={() => {
                      const coin_name = inputRef.current?.value?.trim();
                      if (coin_name) {
                        setFilterRequest((state) => {
                          state.tokenQuery = coin_name; // 点击搜索图标
                          state['page.index'] = 1;
                        });
                      }
                    }}
                  >
                    <SearchSVG />
                  </IconButton>
                </Fragment>
              }
            />
          </Box>
        </Box>
      )}
      <Box
        sx={{
          display: 'flex',
          justifyContent: isMobile ? 'center' : 'space-between',
          flexDirection: isMobile ? 'column' : 'row',
          alignItems: 'center',
          mb: '40px',
        }}
      >
        {/* 状态筛选 Tab 按钮组（All/New/In-progress/Completed）*/}
        <ButtonGroup
          sx={{
            '& .MuiButtonGroup-grouped:not(:last-of-type)': {
              borderRight: 'none',
            },
          }}
          variant="contained"
        >
          {StatusList.map((v) => (
            <TabButton
              key={v.value}
              onClick={() => {
                setFilterRequest((state) => {
                  state['status'] = v.value; // 切换状态 → 触发重新请求
                });
              }}
              active={filterRequest.status === v.value} // 高亮当前选中项
            >
              {v.label}
            </TabButton>
          ))}
        </ButtonGroup>
        {/* 桌面端搜索框（与 Tab 排一行，右侧对齐）*/}
        {!isMobile && (
          <Box
            sx={{
              p: '2px 4px',
              display: 'flex',
              alignItems: 'center',
              width: 200,
              height: 36,
              borderRadius: '6px',
              border: '1px solid #2F343E',
              background: '#202229',
            }}
          >
            <InputBase
              sx={{ ml: 1, flex: 1, fontSize: '14px' }}
              placeholder={erc20List.ethscriptions?.[0]?.tick ?? ''}
              inputRef={inputRef}
              onKeyUp={(event) => {
                const coin_name = inputRef.current?.value?.trim();
                if (event.key === 'Enter' && coin_name) {
                  setFilterRequest((state) => {
                    state.tokenQuery = coin_name;
                    state['page.index'] = 1;
                  });
                }
              }}
              onInput={() => {
                const coin_name = inputRef.current?.value.trim();
                if (coin_name === '') {
                  setFilterRequest((state) => {
                    state.tokenQuery = '';
                    state['page.index'] = 1;
                  });
                }
              }}
              endAdornment={
                <Fragment>
                  <Divider sx={{ height: 36, m: 0.5 }} orientation="vertical" />
                  <IconButton
                    color="primary"
                    sx={{ p: '10px' }}
                    onClick={() => {
                      const coin_name = inputRef.current?.value?.trim();
                      if (coin_name) {
                        setFilterRequest((state) => {
                          state.tokenQuery = coin_name;
                          state['page.index'] = 1;
                        });
                      }
                    }}
                  >
                    <SearchSVG />
                  </IconButton>
                </Fragment>
              }
            />
          </Box>
        )}
      </Box>
      {/* DataGrid 表格（分页由 onPageChange 回调控制）*/}
      <TableData
        isLoading={isLoading}
        data={erc20List}
        pageSize={PAGE_START_INIT}
        onPageChange={async (model: GridPaginationModel) => {
          setFilterRequest((state) => {
            state['page.index'] = model.page; // 更新页码
            state['page.size'] = model.pageSize; // 更新每页大小
          });
        }}
      />
    </Box>
  );
};

export default TokenList;
