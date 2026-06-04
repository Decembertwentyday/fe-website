/**
 * ==============================================================
 * 文件：src/app/page.tsx
 * 作用：网站根路由（/）的入口页面
 *
 * 为什么这么简单（只有 3 行）？
 *   这是 Next.js App Router 的「薄页面」设计模式：
 *   - page.tsx 只负责「路由 → 组件」的映射，不写业务逻辑
 *   - 真正的首页 UI 和逻辑都在 src/app/home/index.tsx 里
 *
 * 路由关系：
 *   用户访问 https://etch.market/
 *     → Next.js 渲染 src/app/layout.tsx（根布局，含 Header）
 *     → 再渲染 src/app/page.tsx（本文件）
 *     → 本文件 re-export Home 组件
 *     → 最终展示首页（搜索框 + 最新铭文列表）
 *
 * 更好的思路（可选）：
 *   也可以直接把 home/index.tsx 的内容写在这里，
 *   但分离 home/ 目录便于以后首页变复杂时（A/B 测试、多版本首页）独立维护。
 * ==============================================================
 */

import Home from './home';

export default Home;
