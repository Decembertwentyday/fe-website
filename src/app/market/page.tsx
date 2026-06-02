/**
 * ============================================================
 * 文件说明：市场页面（/market 路由的入口）
 *
 * 这个文件是 Next.js App Router 的页面文件。
 * 当用户访问 https://etch.market/market 时，Next.js 自动渲染这个组件。
 *
 * 文件非常简单（只有10行核心代码），符合"页面层应尽量轻"的设计原则：
 *   - 不写业务逻辑
 *   - 只负责组合容器组件
 *   - 真正的逻辑都在 CollectionList 容器组件里
 *
 * 子路由：
 *   /market           → 当前文件（集合列表）
 *   /market/nft       → app/market/nft/  （NFT 集合详情）
 *   /market/token     → app/market/token/（代币集合详情）
 *   /market/domain    → app/market/domain/（域名集合详情）
 *
 * 上层 Layout：
 *   app/market/layout.tsx  →  会包裹这个 page，提供市场专用的导航/侧边栏
 * ============================================================
 */

'use client';
// ↑ Next.js App Router 关键指令：标记为"客户端组件"
// 原因：CollectionList 内部使用了 useState、useEffect、useSearchParams 等只能在浏览器运行的 Hook

import CollectionList from '@/containers/CollectionList';
// ↑ 集合列表容器组件（核心业务组件，包含数据请求和表格渲染）
// @ 是 src/ 目录的路径别名（在 tsconfig.json 中配置）

import { Box } from '@mui/material';
// ↑ MUI 的盒子组件（等价于 <div>，但支持 sx 属性写样式）

const Marketplace = () => {
  return (
    <Box>
      <CollectionList />
      {/* ↑ 渲染集合列表组件，全部业务逻辑由它内部处理 */}
    </Box>
  );
};

export default Marketplace;
// ↑ Next.js 要求页面文件必须 default export 一个 React 组件
