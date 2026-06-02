// ============================================================================
// 【TokenList】ERC-20 Token 铭文全量列表
// ----------------------------------------------------------------------------
// 职责：
//   展示平台上所有 ERC-20 铭文 Token，支持状态过滤（All/New/InProgress/Completed）
//   和关键词搜索（tick 名称），底层数据用 MUI DataGrid 表格展示（含分页）。
//
// 关键设计：useRef 读取搜索框值（不用 state）
//   搜索框使用 inputRef = useRef() 直接绑定 DOM 元素。
//   读取值时用 inputRef.current?.value，而不是 useState + onChange 实时跟踪。
//   原因：用户每次按键都触发 state 更新会导致整个组件重渲染（影响性能）。
//   只在用户按 Enter 键或点击搜索按钮时才读取值并更新 filterRequest，
//   这样减少了不必要的重渲染次数。
//   特例：当用户清空输入框时（onInput 检测到 value 为空），
//   立即重置 tokenQuery 以恢复全量列表。
//
// StatusList：状态过滤器
//   All / New / InProgress / Completed
//   默认值 InProgress（进行中的铭文，即还可以 mint 的）
//
// 响应式布局（isMobile = max-width:750px）：
//   - 桌面端：标题左边 / DeployERC20 按钮右上角 / 搜索框在过滤栏右侧
//   - 移动端：DeployERC20 和搜索框都在 isMobile 专属行（紧凑布局）
//
// 分页：MUI DataGrid + GridPaginationModel（onPageChange → 更新 page.index/size）
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
import { GetErc20ListData, GetErc20ListRequest } from '@/services/ethscriptions/types';
import services from '@/services';
import TabButton from '@/components/TabButton';
import DeployERC20 from '../Deploy';

// 状态过滤选项列表（All/New/InProgress/Completed）
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
    value: 'InProgress', // 进行中（还可以 mint）
  },
  {
    label: 'Completed',
    value: 'Completed', // 已全部铸造完毕
  },
];

// 每页默认显示 20 条（DataGrid 表格分页）
const PAGE_START_INIT = 20;

const TokenList = () => {
  // inputRef：直接引用搜索框 DOM，读取值时不走 state（减少重渲染）
  const inputRef = useRef<HTMLInputElement>();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  // isMobile：是否是移动端（< 750px），用于切换布局
  const isMobile = useMediaQuery('(max-width:750px)');
  // filterRequest：请求参数（状态过滤 + 关键词 + 分页）
  const [filterRequest, setFilterRequest] = useImmer<GetErc20ListRequest>({
    status: 'InProgress', // 默认展示进行中的
    tokenQuery: '',
    'page.size': PAGE_START_INIT,
    'page.index': 1,
  });
  const [erc20List, setErc20List] = useState<GetErc20ListData>({
    ethscriptions: [],
    page: {
      size: PAGE_START_INIT,
      index: 1,
      total: '0',
    },
  });

  // filterRequest 变化 → 立即触发请求（无防抖，状态切换/翻页立即响应）
  useEffect(() => {
    getErc20List();
  }, [filterRequest]);

  async function getErc20List() {
    if (isLoading) return; // 防并发
    setErc20List({ ...erc20List, ethscriptions: [] }); // 请求前清空旧数据（避免闪烁）
    setIsLoading(true);
    const response = await services.ethscriptions.getErc20(filterRequest);

    if (response?.code === 200) {
      setErc20List(response.data);
    }
    setIsLoading(false);
  }

  return (
    <Box
      sx={{
        width: { xs: '100%', sm: '1160px' },
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
      {/* 顶部标题行：桌面端标题在左，DeployERC20 按钮在右 */}
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
            whiteSpace: 'nowrap',
            fontSize: '18px',
            fontWeight: 500,
            letterSpacing: '1px',
          }}
        >
          The full list of token ethscriptions
        </Typography>
        {/* 桌面端：部署按钮在标题右侧 */}
        {!isMobile && <DeployERC20 />}
      </Box>
      {/* 移动端专属行：DeployERC20 在左 + 搜索框在右（紧凑布局）*/}
      {isMobile && (
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: '20px', width: '100%' }}>
          <DeployERC20 />
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
              placeholder={erc20List.ethscriptions?.[0]?.tick ?? ''} // 占位符用第一条 tick 名
              inputRef={inputRef} // 绑定 DOM ref（不走 state）
              onKeyUp={(event) => {
                // 回车键：读取当前输入框值并提交搜索
                const coin_name = inputRef.current?.value?.trim();
                if (event.key === 'Enter' && coin_name) {
                  setFilterRequest((state) => {
                    state.tokenQuery = coin_name;
                    state['page.index'] = 1; // 搜索时重置到第 1 页
                  });
                }
              }}
              onInput={() => {
                // 用户清空输入框时，自动重置关键词（恢复全量列表）
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
                      // 点击搜索图标按钮：读取 ref 值并提交
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
        </Box>
      )}
      {/* 过滤栏：状态 Tab 在左，桌面端搜索框在右 */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: isMobile ? 'center' : 'space-between',
          flexDirection: isMobile ? 'column' : 'row',
          alignItems: 'center',
          mb: '40px',
        }}
      >
        {/* 状态过滤 Tab 按钮组 */}
        <ButtonGroup
          sx={{
            '& .MuiButtonGroup-grouped:not(:last-of-type)': {
              borderRight: 'none', // 去掉按钮之间的分割线
            },
          }}
          variant="contained"
        >
          {StatusList.map((v) => (
            <TabButton
              key={v.value}
              onClick={() => {
                // 点击状态 Tab → 更新 status 过滤，立即触发 useEffect 请求
                setFilterRequest((state) => {
                  state['status'] = v.value;
                });
              }}
              active={filterRequest.status === v.value}
            >
              {v.label}
            </TabButton>
          ))}
        </ButtonGroup>
        {/* 桌面端：搜索框在状态过滤右侧 */}
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
      {/* 表格：MUI DataGrid，翻页时通过 onPageChange 更新 filterRequest */}
      <TableData
        isLoading={isLoading}
        data={erc20List}
        pageSize={PAGE_START_INIT}
        onPageChange={async (model: GridPaginationModel) => {
          setFilterRequest((state) => {
            state['page.index'] = model.page; // 页码（从 0 开始）
            state['page.size'] = model.pageSize; // 每页条数
          });
        }}
      />
    </Box>
  );
};

export default TokenList;
