/**
 * ==============================================================
 * 文件：src/app/home/HomeLayout.tsx
 * 作用：首页专用布局容器
 *
 * 与根布局（layout.tsx）的区别：
 *   - layout.tsx：所有页面共用的骨架（Header、Providers 等）
 *   - HomeLayout.tsx：仅首页使用的布局（背景图、页脚）
 *
 * 为什么首页要单独一个 Layout？
 *   首页有独特的视觉效果：全屏背景图（背景固定不随内容滚动）。
 *   其他页面没有这个背景，所以单独抽出来，避免污染全局样式。
 *
 * 组件结构：
 *   HomeLayout
 *   ├── {children}  ← 首页的具体内容（搜索框 + 数据列表）
 *   └── <Footer />  ← 页脚（始终在页面底部）
 * ==============================================================
 */

'use client';
// ↑ 客户端组件（虽然这里只是布局，但 Next.js App Router 要求：
//   如果子组件是客户端组件，父组件也必须是客户端组件）

import Footer from '@/containers/Footer';
// ↑ 底部页脚组件（包含版权信息、社交链接等）

import { Box } from '@mui/material';
// ↑ MUI 通用容器

export default function HomeLayout({ children }: { children: React.ReactNode }) {
  return (
    <Box
      sx={{
        position: 'relative', // 相对定位（为内部绝对定位的元素提供参考）
        minHeight: '100vh', // 最小高度 = 视口高度（确保即使内容少，也占满全屏）
        // ↑ 为什么用 minHeight 而不是 height？
        //   height 固定高度，内容超出时会溢出；
        //   minHeight 最小高度，内容多时可以自然延伸

        background: "url('/images/home_bg.webp')",
        // ↑ 首页独特的背景图
        // url('/images/home_bg.webp')：引用 public/images/ 目录下的图片
        // .webp 是现代图片格式，比 PNG/JPG 文件更小、加载更快

        backgroundAttachment: 'fixed',
        // ↑ 背景图固定（视差效果）
        // 效果：用户滚动页面时，背景图不动，只有内容滚动
        // 视觉效果：产生"内容浮在背景上"的层次感
        // 注意：移动端浏览器对 backgroundAttachment: 'fixed' 支持不好，
        //       可能会有性能问题（这是一个常见的 CSS 陷阱）

        backgroundSize: 'cover',
        // ↑ 背景图覆盖模式：等比例缩放，确保图片覆盖整个容器，不留白边
        // 副作用：图片可能被裁剪（只显示中心部分）

        boxSizing: 'border-box',
        // ↑ 盒模型：padding 和 border 包含在 width/height 内
        // 这是现代 CSS 的标准做法，避免 padding 导致元素撑大

        display: 'flex',
        flexDirection: 'column',
        // ↑ Flexbox 纵向布局：children（内容区）+ Footer（页脚）上下排列
        // 配合内容区的 flex: 1，可以实现 Footer 始终在底部的效果
      }}
    >
      {children}
      {/* ↑ 首页的主要内容（标题、搜索框、数据列表）在这里渲染 */}

      <Footer />
      {/*
        ↑ 页脚始终在内容下方
        布局技巧：
          HomeLayout 是 flex column 布局
          children 的 Box 有 flex: 1（占据剩余空间）
          所以 Footer 会被"推"到最底部
          即使内容很少，Footer 也不会悬在页面中间
      */}
    </Box>
  );
}
