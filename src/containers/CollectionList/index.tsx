/**
 * ============================================================
 * 文件说明：集合列表容器组件（市场首页的核心组件）
 *
 * 功能：展示市场上所有铭文集合的统计列表，是市场页的"门面"
 *
 * 展示内容：
 *   - 顶部标题（如 "Trending Tokens"）
 *   - 搜索框（按集合名称过滤）
 *   - 数据表格（集合名/地板价/24h交易量/持有者数等）
 *   - 分页器
 *
 * 数据流：
 *   url参数(category) → useSearchParams 读取
 *      ↓
 *   filterRequest 状态（用 useImmer 管理）
 *      ↓
 *   useDebounce 防抖 300ms
 *      ↓
 *   useEffect 监听 filterRequestDebounce 变化
 *      ↓
 *   调用 services.marketplace.getCollectionList API
 *      ↓
 *   把数据存到 collectionList 状态
 *      ↓
 *   传递给 TableData 子组件渲染
 *
 * 关键技术点：
 *   - useImmer：用 immer 风格的 setState（可以直接 state.xxx = yyy）
 *   - useDebounce：防抖，避免用户快速输入时频繁请求 API
 *   - useSearchParams：读取 URL 查询参数（如 ?category=token）
 *   - useRef：直接操作 DOM 输入框，获取实时输入值
 * ============================================================
 */

import { Fragment, useEffect, useRef, useState } from 'react';
// ↑ Fragment：React 的空标签 <></>，避免多余 DOM 嵌套
// useState：管理简单状态
// useEffect：处理副作用（数据请求等）
// useRef：获取 DOM 元素引用

import { Box, Divider, IconButton, InputBase, Typography } from '@mui/material';
// ↑ MUI 组件：盒子、分隔线、图标按钮、原生输入框、文字
import { useImmer } from 'use-immer';
// ↑ 增强版 useState：可以像修改普通对象一样修改不可变状态
// 例：setFilterRequest(state => { state.category = 'token' })

import { useSearchParams } from 'next/navigation';
// ↑ Next.js 提供的 Hook，读取当前 URL 的查询参数（?key=value）

import { useDebounce } from 'usehooks-ts';
// ↑ 防抖 Hook：值变化后等待 N 毫秒才返回新值
// 用途：用户连续输入时，不会每次按键都触发 API 请求

import SearchSVG from '@/assets/images/search-icon16.svg';
// ↑ SVG 图标作为 React 组件导入（Next.js 配置了 SVG loader）

import services from '@/services';
// ↑ 所有服务的入口（services.marketplace、services.ethscriptions 等）

import { GetCollectionListData, GetCollectionListRequest, categoryType } from '@/services/marketpalce/types';
// ↑ TypeScript 类型定义

import TableData from './TableData';
// ↑ 同目录下的子组件：负责渲染数据表格

import { GridPaginationModel } from '@mui/x-data-grid';
// ↑ MUI 数据网格的分页模型类型

import { CATEGORY_KEY_ENUM } from '@/constants';
// ↑ 类别枚举（用于把 'token' 映射为显示文本 'Tokens'）

const PAGE_START_INIT = 50;
// ↑ 每页显示数量常量：50 条
// 写成常量好处：以后修改只需要改这一处

const CollectionList = () => {
  const searchParams = useSearchParams();
  // ↑ 获取 URL 查询参数对象（read-only）

  const category = (searchParams.get('category') as categoryType) || 'token';
  // ↑ 读取 ?category=xxx 参数
  // 没有就默认 'token'
  // "as categoryType" 是类型断言：告诉 TS 这个字符串符合 categoryType 类型

  const inputRef = useRef<HTMLInputElement>();
  // ↑ 创建一个 ref，用于引用搜索输入框的 DOM 元素
  // 后续通过 inputRef.current.value 直接读取输入框的值
  // 为什么不用 useState？因为这里只在按下回车时才需要读取值，不需要每次输入都重新渲染

  const [isLoading, setIsLoading] = useState<boolean>(false);
  // ↑ 加载状态：控制表格的 loading 动画

  const [filterRequest, setFilterRequest] = useImmer<GetCollectionListRequest>({
    // ↑ 过滤条件（请求参数），用 useImmer 管理
    category, // ← 当前类别
    tokenQuery: '', // ← 搜索关键词
    'page.size': PAGE_START_INIT, // ← 每页数量
    'page.index': 1, // ← 当前页码
  });

  const filterRequestDebounce = useDebounce(filterRequest, 300);
  // ↑ 防抖：filterRequest 变化后等 300ms 才更新 filterRequestDebounce
  // 用途：搜索时用户连续输入，只在停止输入 300ms 后才发请求

  const [collectionList, setCollectionList] = useState<GetCollectionListData>({
    // ↑ 集合列表数据（从 API 获取）
    collections: [],
    page: {
      size: PAGE_START_INIT,
      index: 1,
      total: '0',
    },
  });

  async function getCollectionList() {
    // ↑ 调用 API 获取集合列表
    if (isLoading) return;
    // ↑ 防止重复请求：如果正在加载，直接返回

    setIsLoading(true);
    setCollectionList({ ...collectionList, collections: [] });
    // ↑ 立即清空旧数据：避免旧数据闪现，提升用户体验

    const response = await services.marketplace.getCollectionList(filterRequestDebounce);
    // ↑ 调用市场服务的接口，传入防抖后的过滤条件

    if (response?.code === 200) {
      // ↑ 后端约定：code=200 表示成功
      setCollectionList(response.data);
    }
    setIsLoading(false);
    // ↑ 无论成功失败都关闭 loading 状态
  }

  useEffect(() => {
    getCollectionList();
  }, [filterRequestDebounce]);
  // ↑ 监听 filterRequestDebounce 变化，自动调用 API
  // 第一次渲染时也会调用（初始化加载）
  // 注意：依赖项是防抖后的值，所以不会因为快速输入而频繁请求

  useEffect(() => {
    if (category) {
      setFilterRequest((state) => {
        // ↑ useImmer 的 setter：可以直接修改属性，不需要返回新对象
        state.category = category;
        state['page.index'] = 1;
        // ↑ 切换类别时重置页码为 1（避免在第 5 页切换后又看到第 5 页）
      });
    }
  }, [category]);
  // ↑ 监听 URL 中的 category 参数变化，自动更新过滤条件

  return (
    <Box
      sx={{
        // ↑ MUI 的样式属性，等价于内联 CSS（但支持响应式断点等高级特性）
        borderRadius: '12px',
        border: '1px solid #2F343E',
        padding: '24px',
        boxSizing: 'border-box',
        background: '#202229',
      }}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          // ↑ Flex 布局：标题靠左，搜索框靠右
          marginBottom: '16px',
        }}
      >
        <Typography
          sx={{
            color: '#E6FF65',
            fontSize: '18px',
            fontWeight: 500,
            letterSpacing: '1px',
            textTransform: 'capitalize',
            // ↑ 首字母大写（CSS 自动转换）
          }}
        >
          Trending {CATEGORY_KEY_ENUM[category]}
          {/* ↑ 动态文本：Trending Tokens / Trending NFTs 等 */}
        </Typography>
        <Box
          sx={{
            p: '2px 4px',
            display: 'flex',
            alignItems: 'center',
            width: 260,
            height: 36,
            borderRadius: '6px',
            border: '1px solid #2F343E',
            background: '#202229',
          }}
        >
          <InputBase
            sx={{ ml: 1, flex: 1, fontSize: '14px' }}
            placeholder={collectionList.collections?.[0]?.collectionName ?? ''}
            // ↑ 占位符显示第一个集合名（动态提示用户可以搜什么）
            // ?. 可选链：安全访问，避免数组为空时报错
            // ?? '' 空值合并：如果 undefined 就显示空字符串
            inputRef={inputRef}
            // ↑ 把 useRef 创建的 ref 绑定到这个输入框
            onKeyUp={(event) => {
              // ↑ 按键松开时触发
              const coin_name = inputRef.current?.value?.trim();
              // ↑ trim() 去除前后空格
              if (event.key === 'Enter' && coin_name) {
                // ↑ 按下回车且输入非空：触发搜索
                setFilterRequest((state) => {
                  state.tokenQuery = coin_name;
                  state['page.index'] = 1;
                  // ↑ 搜索时重置页码为 1
                });
              }
            }}
            onInput={() => {
              // ↑ 输入内容变化时触发
              const coin_name = inputRef.current?.value.trim();
              if (coin_name === '') {
                // ↑ 用户清空输入框时：自动重置搜索条件，显示全部
                setFilterRequest((state) => {
                  state.tokenQuery = '';
                  state['page.index'] = 1;
                });
              }
            }}
            endAdornment={
              // ↑ 输入框尾部装饰（这里放搜索按钮）
              <Fragment>
                <Divider sx={{ height: 36, m: 0.5 }} orientation="vertical" />
                {/* ↑ 垂直分隔线，把输入区和按钮分开 */}
                <IconButton
                  color="primary"
                  sx={{ p: '10px' }}
                  onClick={() => {
                    // ↑ 点击搜索按钮：与按回车键的逻辑相同
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
      <TableData
        // ↑ 把数据传给子组件渲染表格
        category={category}
        isLoading={isLoading}
        data={collectionList}
        pageSize={PAGE_START_INIT}
        onPageChange={async (model: GridPaginationModel) => {
          // ↑ 分页变化时的回调（子组件触发）
          setFilterRequest((state) => {
            state['page.index'] = model.page;
            state['page.size'] = model.pageSize;
            // ↑ 更新页码和每页数量，会自动触发 useEffect 重新请求
          });
        }}
      />
    </Box>
  );
};

export default CollectionList;
