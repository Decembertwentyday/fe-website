// ============================================================================
// 【/search 路由页面】搜索结果页入口
// ----------------------------------------------------------------------------
// 做什么：
//   这是一个超薄的入口文件（"薄页面"模式），下面只组合一个容器组件 SearchEthsResults。
//
// 为什么要这样分层：
//   Next.js App Router 要求每个路由对应一个 page.tsx。
//   但具体页面逻辑放在可复用的容器组件里，这样如果将来搜索框移到别处，
//   SearchEthsResults 组件就可以直接复用。
//
// 薄页面 / 厚容器模式：
//   page.tsx  = 路由入口，只负责组合（薄）
//   containers/ = 实际逻辑和 UI（厚）
// ============================================================================

'use client';
import SearchEthsResults from '@/containers/SearchEthsResults';
import { Box } from '@mui/material';

const Search = () => {
  return (
    <Box>
      {/* 将所有搜索逻辑委托给 SearchEthsResults 容器组件 */}
      <SearchEthsResults />
    </Box>
  );
};

export default Search;
