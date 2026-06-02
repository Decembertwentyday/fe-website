/**
 * ==============================================================
 * 文件：src/app/layout.tsx
 * 作用：Next.js 应用的根布局（Root Layout）
 *
 * 什么是根布局？
 *   在 Next.js 的 App Router 架构中，layout.tsx 是"持久的外壳"。
 *   当用户在不同页面间导航时，layout.tsx 不会被销毁和重建，
 *   只有 {children}（页面内容部分）会切换。
 *   类比：就像电视机（layout）和节目频道（children）的关系，
 *   换频道（切页面）时，电视机本身不动。
 *
 * 这个文件的职责：
 *   1. 定义 HTML 的基本骨架（<html><body>）
 *   2. 设置全局 SEO 元数据（标题、描述、关键词）
 *   3. 注入全局 CSS 样式
 *   4. 渲染全局组件（Header、Providers、Analytics）
 *   5. 把页面内容（children）包裹在 ProvidersMiddleware 里
 * ==============================================================
 */

import { Analytics } from '@vercel/analytics/react';
// ↑ Vercel 提供的访问统计组件
// 功能：自动收集页面浏览量、来源渠道等数据
// 特点：零配置，只要引入就能用；数据在 Vercel 控制台查看
// 注意：这不是 Google Analytics，是 Vercel 自家的轻量分析工具

import { Metadata } from 'next';
// ↑ Next.js 提供的 Metadata 类型定义
// 用于 TypeScript 类型检查，确保 generateMetadata 返回正确的字段

import '@rainbow-me/rainbowkit/styles.css';
// ↑ ★ 重要：必须在这里引入 RainbowKit 的样式
// 如果不引入，连接钱包弹窗会没有样式（样式崩坏）
// 放在根 layout 里确保所有页面都加载了这个样式

import '@/assets/styles/index.css';
// ↑ 项目自定义的全局样式文件
// @ 是路径别名，等同于 src/assets/styles/index.css
// （路径别名在 tsconfig.json 中的 "paths" 字段配置）

import { Providers } from './providers';
// ↑ 导入全局 Provider 组件
// 它把钱包连接、主题、Toast 等能力注入到整个应用

import Header from '@/containers/Header';
// ↑ 顶部导航栏组件
// 放在 layout 里，所有页面都会有这个 Header

import '@/assets/global.css';
// ↑ 另一个全局 CSS（两个全局 CSS 文件可能是历史遗留分工）

import { ProvidersMiddleware } from './providersMiddleware';
// ↑ 用户信息加载器（监听钱包连接，获取 OG Pass 资格等）

// ─────────────────────────────────────────────────────────────
// SEO 元数据配置
// Next.js 会自动把这些信息注入到 <head> 标签里
// ─────────────────────────────────────────────────────────────
export async function generateMetadata() {
  // ↑ async 函数：Next.js 支持异步生成元数据（可以从数据库/API 获取动态标题）
  // 这里是静态的，不需要异步，但用 async 是为了符合 Next.js 的接口规范
  return {
    title: 'EtchMarket',
    // ↑ 浏览器标签页标题（显示在浏览器 Tab 上）
    // 也是搜索引擎结果页的蓝色标题链接

    description: 'EtchMarket, The First Community-driven Ethsciptions Indexer、Marketplace、Dex',
    // ↑ 网站描述（显示在搜索引擎结果页链接下方的灰色简介文字）
    // 对 SEO 有影响，应该包含核心关键词

    keywords: 'ethereum ethscriptions nft marketplace web3 etch defi dex nft did',
    // ↑ 关键词（现代搜索引擎不太依赖这个了，但仍然保留是惯例）
  } as Metadata;
}

// ─────────────────────────────────────────────────────────────
// 根布局组件（核心）
// ─────────────────────────────────────────────────────────────
/**
 * RootLayout：整个应用的根容器
 * @param children - 当前路由对应的页面组件（由 Next.js 自动传入）
 */
export default async function RootLayout({ children }: { children: React.ReactNode }) {
  // ↑ async：这是服务端组件（Server Component），可以在服务器上 await 数据
  // children 的类型是 React.ReactNode（可以是任何 React 能渲染的内容）
  return (
    <html lang="en">
      {/*
      ↑ HTML 根元素
      lang="en" 属性的作用：
      1. 告诉浏览器主要语言（影响朗读软件、自动翻译等）
      2. 帮助搜索引擎了解页面语言
      3. 影响某些 CSS 属性（如 quotes 属性的默认值）
    */}

      <body data-rk>
        {/*
        ↑ body 标签
        data-rk 属性是 RainbowKit 需要的自定义属性
        RainbowKit 的 CSS 选择器是 [data-rk] .xxx，
        这样它的样式不会影响没有 data-rk 属性的其他元素
      */}

        <Providers>
          {/*
          ↑ 全局 Provider 包裹
          包含：QueryClientProvider、ThemeProvider、WagmiConfig、
               RainbowKitAuthenticationProvider、RainbowKitProvider
          作用：向所有子组件注入这些全局能力
          更多细节见 providers.tsx 的注释
        */}

          <Header />
          {/*
            ↑ 顶部导航栏
            放在 Providers 内部，是因为 Header 需要用到：
            - useAccount()（需要 WagmiConfig Provider）
            - useSnapshot()（需要 valtio Store）
            - useRouter()（需要 Next.js 路由 Provider）
          */}

          <ProvidersMiddleware>
            {/*
            ↑ 用户信息中间件
            监听钱包地址变化，自动获取 OG Pass 资格
            放在 Header 之后，确保 Header 先渲染完
          */}

            {children}
            {/*
              ↑ 当前页面的内容
              访问 / 时：这里渲染 src/app/page.tsx 的内容
              访问 /market 时：这里渲染 src/app/market/page.tsx 的内容
              访问 /swap 时：这里渲染 src/app/swap/page.tsx 的内容
              ...以此类推
            */}
          </ProvidersMiddleware>
        </Providers>

        <Analytics />
        {/*
          ↑ Vercel 访问统计
          故意放在 Providers 外面：Analytics 不需要 Web3 上下文，
          而且放外面可以确保即使 Providers 报错，统计也能正常工作
        */}
      </body>
    </html>
  );
}
