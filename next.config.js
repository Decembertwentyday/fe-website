/**
 * ==============================================================
 * 文件：next.config.js
 * 作用：Next.js 框架的全局配置文件（构建、路由、代理、监控）
 *
 * 为什么需要这个文件？
 *   Next.js 默认配置不能满足 Web3 项目的特殊需求：
 *   1. 浏览器跨域限制 → 需要 API 代理（rewrites）
 *   2. SVG 图标当 React 组件用 → 需要 webpack 插件
 *   3. ethers 等库引用 Node 模块 → 浏览器端需要 fallback
 *   4. 线上错误追踪 → 集成 Sentry
 *
 * 阅读建议：
 *   先看 rewrites（理解前端如何访问后端 API）
 *   再看 webpack（理解 SVG 和 Node 模块处理）
 *   最后看 Sentry（理解生产环境监控）
 * ==============================================================
 */

const { withSentryConfig } = require('@sentry/nextjs');
// ↑ Sentry 提供的 Next.js 配置包装函数
// 作用：在构建时自动上传 source map，线上报错能定位到原始源码行号

/** @type {import('next').NextConfig} */
// ↑ JSDoc 类型注释：让 VS Code 对 nextConfig 对象提供智能提示

const nextConfig = {
  env: {},
  // ↑ 可在此注入客户端可访问的环境变量
  // 注意：这里的内容会打包进前端，切勿放私钥、API Secret 等敏感信息

  reactStrictMode: true,
  // ↑ React 严格模式：开发环境下组件会「渲染两次」
  // 为什么开启：帮助发现副作用、过时 API 等潜在问题，是 React 官方推荐做法

  output: 'standalone',
  // ↑ 构建输出为 standalone 模式（自包含的 Node 服务）
  // 优点：Docker 部署时只需复制 .next/standalone，无需在容器内 npm install
  // 本项目 Makefile 里的 make build-production 就是基于这个模式

  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
    // ↑ 生产环境自动删除所有 console.log / console.warn 等
    // 优点：1) 避免调试信息泄露  2) 减小包体积  3) 轻微提升运行时性能
    // 开发环境保留 console，方便调试 SIWE 登录、合约调用等流程
  },

  webpack(config, { isServer }) {
    // ↑ 自定义 webpack 配置（Next.js 默认用 webpack 打包）
    // isServer：true = 服务端打包，false = 客户端（浏览器）打包

    config.module.rules.push({
      test: /\.svg$/i,
      // ↑ 匹配所有 .svg 文件
      use: ['@svgr/webpack'],
      // ↑ 把 SVG 转为 React 组件
      // 用法：import LogoSVG from '@/assets/icons/logo.svg'
      //       <LogoSVG />  ← 像普通组件一样使用，可传 className、color 等
      // 为什么不用 <img src="logo.svg">？
      //   SVG 组件可以用 CSS 控制颜色、大小，且不会被额外 HTTP 请求阻塞
    });

    config.resolve.fallback = { fs: false, net: false, tls: false };
    // ↑ 告诉 webpack：浏览器端不需要 Node.js 内置模块
    // 背景：ethers.js、某些 crypto 库在 Node 环境会 import fs/net/tls
    //       但浏览器里没有这些模块，不设 fallback 会导致构建报错
    // false = 遇到这些 import 时返回空模块，而不是报错

    return config;
  },

  async rewrites() {
    // ↑ URL 重写（反向代理）—— 本项目最核心的配置之一
    //
    // 原理：
    //   浏览器访问  https://etch.market/api/ethscriptions/list
    //   Next.js 服务端收到请求后，转发到  https://www.etch.market/api/ethscriptions/list
    //   浏览器看到的是「同域请求」，不会触发 CORS 跨域拦截
    //
    // 为什么不用 axios 直接请求 www.etch.market？
    //   浏览器的同源策略禁止前端页面跨域发请求（除非后端配 CORS）
    //   通过 Next.js 服务端中转，前端只访问自己的域名，绕过跨域限制
    //
    // 与 config.ts 的关系：
    //   constants/config.ts 里的 API_URL 设为 '/api'（相对路径）
    //   axios 请求 /api/xxx → 被这里的 rewrite 转发到真实后端

    return [
      {
        source: '/api-goerli/:path*',
        // ↑ 测试网（Goerli）专用代理前缀
        destination: 'http://3.233.81.38:3002/:path*',
        // ↑ 转发到 Goerli 测试后端（IP 地址，开发/测试环境用）
      },
      {
        source: '/api/:path*',
        // ↑ 主网 API 代理（最常用）
        destination: 'https://www.etch.market/api/:path*',
        // ↑ 转发到 EtchMarket 生产后端
      },
      {
        source: '/api-release/:path*',
        // ↑ 预发布（pre-release）环境代理
        destination: 'https://api.orbitrum.io/:path*',
        // ↑ 转发到预发后端，UAT 测试时使用
      },
    ];
  },
};

const sentryConfig = withSentryConfig(nextConfig, {
  // ↑ 用 Sentry 包装 nextConfig，构建时自动上传 source map
  silent: true,
  // ↑ 构建时不输出 Sentry 上传日志（保持终端干净）

  org: 'etchmarket',
  project: 'etchmarket-nextjs',
  // ↑ Sentry 组织和项目名（在 sentry.io 控制台查看报错）

  widenClientFileUpload: true,
  // ↑ 上传更完整的 source map → 线上堆栈能精确到源码行

  transpileClientSDK: true,
  // ↑ 转译 Sentry SDK 以兼容旧浏览器（会增加一点包体积）

  tunnelRoute: '/monitoring',
  // ↑ 通过 Next.js 路由隧道发送 Sentry 数据
  // 为什么：部分广告拦截插件会屏蔽 sentry.io 域名，隧道可绕过

  hideSourceMaps: true,
  // ↑ 不在客户端 bundle 中暴露 source map（安全：防止源码泄露）

  disableLogger: true,
  // ↑ 生产环境 tree-shake 掉 Sentry 内部 logger，减小体积

  autoInstrumentServerFunctions: false,
  // ↑ 关闭服务端函数自动埋点（按需开启，减少 Sentry 事件量）
});

// 开发环境不用 Sentry 包装（加快 dev 启动速度，避免无意义的 source map 上传）
// 生产/预发环境才启用 Sentry 监控
module.exports = process.env.NODE_ENV == 'development' ? nextConfig : sentryConfig;
