# EtchMarket 项目 · 傻瓜式学习路线 & 面试掌握指南

> **写给谁**：前端/Web3 小白，想把项目「掰开揉碎」搞懂，并写进简历、应对面试  
> **配套文档**：`项目架构-代码解读.md`（3700+ 行深度解读，本路线会告诉你「什么时候去读它的哪一节」）

---

## ⚡ 你只有 16 小时？直接看这里（2 天全职冲刺版）

> **时间**：2 天 × 8 小时 = **16 小时**  
> **目标**：不能「掌握全部代码」，但要能 **讲清架构 + 跟完一条购买链路 + 过基础面试**  
> **原则**：只读 P0 文件，其余模块 **知道名字 + 干什么** 即可

### 16 小时能达成 vs 不能达成

| ✅ 16 小时能做到 | ❌ 16 小时做不到（别强求） |
|-----------------|---------------------------|
| 说清项目做什么、技术栈、分层 | 每个 Confirm*.tsx 逐行看懂 |
| 跟完「市场列表 → 挂单 → 购买」 | Swap / Launchpad / Bridge 全精通 |
| 口述 SIWE 登录 + token 拦截器 | Merkle 白名单 mint 细节 |
| 画一张数据流图 + 购买流程图 | typechain-types 全部文件 |
| 简历写 1 段 + 答 8 道面试题 | 独立开发新功能 |

---

### 📅 第 1 天（8 小时）— 骨架 + 服务层 + 市场入口

| 时段 | 时长 | 做什么 | 读哪些文件 |
|------|------|--------|-----------|
| **① 跑起来 + 巡礼** | 0.5h | `npm install && npm run dev`，浏览器点 `/` `/market` `/owner` `/swap` | — |
| **② 建立概念** | 1h | **只读** `项目架构-代码解读.md` 第一、三、四、七节（跳过代码逐行） | 文档 §1 §3 §4 §7 |
| **③ 配置 & 代理** | 1h | 搞懂 API 怎么不跨域 | `next.config.js` → `src/constants/config.ts` |
| **④ 应用骨架** | 1.5h | 搞懂「页面怎么渲染出来」 | `layout.tsx` → `providers.tsx` → `page.tsx` → `home/index.tsx` |
| **⑤ 钱包 & 登录** | 1.5h | **面试必问**，精读 | `ConnectButtonLocal/index.tsx` → `authenticationAdapter.ts` → `GlobalStore.ts` → `etchClient.ts` |
| **⑥ 服务层** | 1h | 搞懂 API 唯一入口 | `services/index.ts` → `ApiClient.ts` → `ethscriptions/index.ts`（浏览方法名即可） |
| **⑦ 市场列表** | 1.5h | 跟第一条业务链 | `market/page.tsx` → `CollectionList/index.tsx` → `services/marketpalce/index.ts` |
| **⑧ 第 1 天复盘** | 0.5h | 默写：5 条架构原则 + SIWE 四步 | 见下文「Day1 自测」 |

**Day 1 结束前必须能答：**
1. `/api/xxx` 请求最终发到哪？（next.config rewrites）
2. Provider 嵌套顺序是什么？
3. 登录 token 存在哪、怎么带到请求里？
4. `app/market/page.tsx` 为什么只有几行？

---

### 📅 第 2 天（8 小时）— 购买链路 + 链上 + 面试

| 时段 | 时长 | 做什么 | 读哪些文件 |
|------|------|--------|-----------|
| **⑨ 集合详情 & 挂单** | 1.5h | 继续跟购买链 | `market/nft/page.tsx` → `ListedList/index.tsx` → `EthscriptionBox/index.tsx`（**只看结构，不深挖三种 View**） |
| **⑩ 购物车** | 1.5h | valtio 持久化是亮点 | `CartStore.ts` → `CartDrawer/index.tsx` → `CartList.tsx`（Settlement 扫一眼） |
| **⑪ 购买 & 链上** | 2h | **第二重点** | `ListedList/ConfirmBuy.tsx` → `services/evm/etchMarket.ts` → `constants/abis.ts`（**只读 EtchMarket 相关段落**） |
| **⑫ 个人中心扫一眼** | 1h | 简历可写「了解 Owner 模块」 | `owner/page.tsx` → `MyEthscriptions/index.tsx`（**只看列表怎么调 API**） |
| **⑬ 画两张图** | 1h | 纸笔 / Excalidraw | ① 三层架构图 ② 购买全流程图 |
| **⑭ 简历 + 话术** | 0.5h | 定稿 | 本文 **第三节 + 第十二节** |
| **⑮ 模拟面试** | 0.5h | 自问自答 8 题 | 本文 **第一节表格 + 第十三节** |

**Day 2 结束前必须能答：**
1. 从点击 Buy 到上链，前端做了哪几步？
2. CartStore 为什么用 splice 不用 `= []`？
3. services 和 evmService 分工是什么？
4. 用 1 分钟介绍这个项目（背话术模板 1）

---

### 🚫 16 小时版直接跳过（别 guilt）

```
staking/  vault/  launchpad/  bridge/  bulk/
所有 TableData.tsx  typechain-types/
LaunchpadDialog  WhitelistMint  Merkle
Swap/Facet 全套（只知道 /swap 是 DEX 即可）
erc20sDeploy  每个 Confirm*.tsx 的细节
项目架构-代码解读.md 第八节以后的逐行代码（用时查字典）
```

### 📌 16 小时版简历怎么写（诚实版）

```text
EtchMarket — Web3 铭文交易平台（学习/阅读源码）
• 通读 Next.js 14 App Router 分层架构（app/containers/services/stores）
• 深入理解市场模块：集合列表 → 挂单展示 → 购物车 → 合约购买 完整链路
• 掌握 SIWE 钱包登录、axios 拦截器鉴权、valtio 购物车 localStorage 持久化
• 了解 wagmi + RainbowKit + ethers.js 链上交互分层
```

**面试时说**：「时间有限我重点研究了 **市场模块和 Web3 登录**，其他模块如 Swap、Launchpad 我了解路由和业务定位，细节还在深入。」

---

### ✅ 16 小时总 Checklist（打印打勾）

**Day 1**
- [ ] 项目跑通，4 个路由点过
- [ ] 文档 §1 §3 §4 §7 读完
- [ ] next.config + layout + providers
- [ ] SIWE + GlobalStore + etchClient
- [ ] services 入口 + 市场 CollectionList

**Day 2**
- [ ] ListedList + CartStore + ConfirmBuy
- [ ] etchMarket.ts 购买流程
- [ ] owner 扫一眼
- [ ] 两张流程图画完
- [ ] 简历段落 + 8 道面试题自答

---

> 👇 下方是 **完整版（3~4 周）** 路线，有时间再按阶段慢慢啃。

---

> **完整版预计周期**：全职约 **3~4 周**；业余约 **6~8 周**（每天 2~3 小时）  
> **完整版使用方法**：严格按步骤编号执行，每步打勾，不要跳步


## 目录

0. [**⚡ 16 小时冲刺版（2 天全职）**](#-你只有-16-小时直接看这里2-天全职冲刺版)

1. [开始前：你要达成什么目标](#一开始前你要达成什么目标)
2. [学习前准备清单（Day 0）](#二学习前准备清单day-0)
3. [项目一句话 & 简历怎么写](#三项目一句话--简历怎么写)
4. [必须先记住的 5 条架构原则](#四必须先记住的-5-条架构原则)
5. [总路线图（4 个阶段）](#五总路线图4-个阶段)
6. [第一阶段：跑起来 + 建立全局地图（Day 1~3）](#六第一阶段跑起来--建立全局地图day-13)
7. [第二阶段：读懂应用骨架（Day 4~7）](#七第二阶段读懂应用骨架day-47)
8. [第三阶段：跟一条完整业务链路（Day 8~14）](#八第三阶段跟一条完整业务链路day-814)
9. [第四阶段：按模块逐个攻克（Day 15~28）](#九第四阶段按模块逐个攻克day-1528)
10. [第五阶段：Web3 链上层 + 面试冲刺（Day 29~35）](#十第五阶段web3-链上层--面试冲刺day-2935)
11. [全项目文件阅读索引（按优先级）](#十一全项目文件阅读索引按优先级)
12. [每步自测题 & 面试话术模板](#十二每步自测题--面试话术模板)
13. [常见面试题速答](#十三常见面试题速答)
14. [学习工具 & 调试技巧](#十四学习工具--调试技巧)
15. [进度总 Checklist](#十五进度总-checklist)

---

## 一、开始前：你要达成什么目标

学完本路线，你应该能回答下面 **8 个问题**（这也是面试官最常问的）：

| # | 问题 | 学完应能答 |
|---|------|-----------|
| 1 | 这个项目是做什么的？ | Ethscriptions 索引 + 交易市场 + DEX + Launchpad + 跨链桥 |
| 2 | 技术栈是什么？为什么选这些？ | Next.js 14 + React 18 + TS + MUI + wagmi/RainbowKit + valtio + axios |
| 3 | 项目分层怎么设计的？ | app（路由）→ containers（业务）→ components（展示）→ services（API）→ stores（状态） |
| 4 | 用户连接钱包后发生了什么？ | wagmi 连接 → SIWE 签名登录 → token 存 localStorage → 拦截器带 Bearer |
| 5 | 数据从后端到页面怎么流动？ | services → etchClient → next.config 代理 → 后端 API → 组件 setState 渲染 |
| 6 | 购买 NFT/铭文的核心流程？ | 读挂单 API → 用户确认 → evmService 调合约 buy → 钱包签名 → 上链 |
| 7 | 你负责/理解了哪些模块？ | 按你实际读的模块诚实回答（见第三节简历模板） |
| 8 | 遇到过什么难点？怎么解决的？ | 准备 1~2 个真实例子（见第十二节话术） |

---

## 二、学习前准备清单（Day 0）

### 2.1 环境跑通（必须完成）

```bash
# 在项目根目录 D:\project\fe-website-1
npm install
npm run dev
```

浏览器打开 **http://localhost:3000**，确认能正常访问。

> 如果安装失败：检查 Node 版本（建议 18+），不要跳过这一步。

### 2.2 前置知识（不懂可以先补，边学边查）

| 优先级 | 知识点 | 学到什么程度就够 |
|--------|--------|------------------|
| ★★★ | JavaScript ES6+ | 会箭头函数、解构、async/await、Promise |
| ★★★ | React 基础 | 会 useState、useEffect、组件 props |
| ★★★ | TypeScript 基础 | 会看 interface、类型注解、泛型 `<T>` |
| ★★☆ | Next.js App Router | 知道 `app/` 文件夹 = 路由，`layout.tsx` = 布局 |
| ★★☆ | HTTP 基础 | 知道 GET/POST、URL 参数、JSON 响应 |
| ★☆☆ | 区块链概念 | 知道钱包地址、交易、Gas、智能合约是什么 |
| ★☆☆ | Web3 登录 | 知道「签名 = 证明身份」，不需要先精通密码学 |

### 2.3 两份文档怎么配合

```
EtchMarket-学习路线-傻瓜式.md  ← 你现在看的：告诉你「按什么顺序学、每步做什么」
项目架构-代码解读.md            ← 字典/教科书：告诉你「每个文件每一行什么意思」
```

**规则**：
- 本路线让你 **打开某个文件** 时，去 `项目架构-代码解读.md` 找对应章节深读
- 文件顶部如果已有 `/** 文件：xxx 作用：xxx */` 注释，先读注释再读代码

### 2.4 学习时的 4 个习惯（很重要）

1. **边看边画**：用纸或 Excalidraw 画「用户点击 → 哪个组件 → 调哪个 service → 返回什么」
2. **边看边点**：代码里每个路由，浏览器里访问一次（如 `/market`、`/swap`）
3. **边看边搜**：在 VS Code 里 `Ctrl+Click` 跳转 import，跟完一条调用链
4. **每步打勾**：不要贪多，一天完成 1~2 个 Step 就够

---

## 三、项目一句话 & 简历怎么写

### 3.1 项目一句话（电梯演讲）

> **EtchMarket** 是基于 Next.js 14 的 Web3 铭文（Ethscriptions）综合平台，集成铭文索引浏览、NFT/Token/Domain 交易市场、Facet L2 DEX 代币兑换、Launchpad 首发、跨链桥和 SIWE 钱包登录，采用三层架构（页面/容器/服务）+ valtio 全局状态 + wagmi/RainbowKit 链上交互。

### 3.2 简历项目描述模板（可直接改）

```text
EtchMarket — Web3 铭文交易综合平台                                    202x.x - 202x.x
技术栈：Next.js 14 · React 18 · TypeScript · MUI · wagmi · RainbowKit · valtio · ethers.js

• 参与/学习基于 App Router 的多模块 DApp 前端，覆盖市场、Swap、Launchpad、跨链桥等 10+ 业务路由
• 理解并实现（或阅读）REST API 服务层封装（axios + 统一 ApiClient），通过 Next.js rewrites 解决跨域
• 掌握 Web3 登录流程（SIWE + RainbowKit Authentication），JWT 持久化与请求拦截器注入
• 熟悉链上交互分层：typechain 生成合约类型 + evmService 封装 buy/list/mint 等合约方法
• 理解 valtio 全局状态（购物车、批量挂单、Swap 交易对）与 use-immer 局部状态的配合使用
```

> **诚实原则**：没写过的功能写「阅读并理解 xxx 模块实现」，不要写「独立开发整个项目」。

### 3.3 你可以重点吹的「技术亮点」（面试加分）

1. **Next.js API 代理**：`next.config.js` rewrites 解决浏览器 CORS
2. **SIWE 无密码登录**：`authenticationAdapter.ts` 四步流程
3. **valtio subscribe 持久化**：CartStore 购物车自动存 localStorage
4. **薄页面 + 厚容器**：`app/market/page.tsx` 只有 10 行，逻辑在 containers
5. **双 HTTP 客户端**：etchClient（主后端）+ facetClient（Facet L2 DEX）
6. **wagmi v1 + ethers v5 桥接**：`useEthersSigner` / `useEthersProvider` 适配层

---

## 四、必须先记住的 5 条架构原则

读任何文件前，先把这 5 条刻进脑子：

```
原则 1：app/ 目录 = 路由，page.tsx 要尽量薄，只组合 containers
原则 2：containers/ = 业务大脑（请求数据、处理状态、调链）
原则 3：components/ = 纯 UI（只收 props，不关心数据从哪来）
原则 4：services/ = 所有后端 API 的唯一入口（不要组件里直接 axios）
原则 5：stores/ = 跨页面共享状态（登录、购物车、Swap 选币）
```

**数据流口诀**：

```
用户操作 → container 事件 → services.xxx → etchClient → /api 代理 → 后端
                ↓
         需要链上写操作 → evmService → ethers Signer → 钱包弹窗 → 上链
```

---

## 五、总路线图（4 个阶段）

```
┌─────────────────────────────────────────────────────────────────┐
│  第一阶段 Day 1-3    跑项目 + 点一遍所有页面 + 读文档第一~三节      │
├─────────────────────────────────────────────────────────────────┤
│  第二阶段 Day 4-7    骨架：layout → providers → Header → Store   │
├─────────────────────────────────────────────────────────────────┤
│  第三阶段 Day 8-14   跟完「市场购买」完整链路（最重要）              │
├─────────────────────────────────────────────────────────────────┤
│  第四阶段 Day 15-28  按模块逐个学：Swap/Owner/Launchpad/Bridge…   │
├─────────────────────────────────────────────────────────────────┤
│  第五阶段 Day 29-35  链上层 evm + abis + 面试题模拟               │
└─────────────────────────────────────────────────────────────────┘
```

---

## 六、第一阶段：跑起来 + 建立全局地图（Day 1~3）

> **目标**：知道项目有哪些页面、每个页面干什么，不深入代码。

### Step 1.1 浏览器巡礼（2 小时）

依次访问并 **截图/记笔记**：这个页面有什么功能、你点了什么按钮。

| 路由 | 功能 | 对应代码入口 |
|------|------|-------------|
| `/` | 首页 Explorer、搜索 | `src/app/page.tsx` → `home/index.tsx` |
| `/market` | 市场集合列表 | `src/app/market/page.tsx` |
| `/market/nft?collection=xxx` | NFT 集合详情 | `src/app/market/nft/page.tsx` |
| `/owner` | 我的铭文 | `src/app/owner/page.tsx` |
| `/asset` | 我的资产 | `src/app/asset/page.tsx` |
| `/swap` | 代币兑换 | `src/app/swap/page.tsx` |
| `/launchpad` | 发射台 | `src/app/launchpad/page.tsx` |
| `/bridge` | 跨链桥 | `src/app/bridge/page.tsx` |
| `/staking` | 质押 | `src/app/staking/page.tsx` |
| `/transactions` | 最新交易 | `src/app/transactions/page.tsx` |
| `/search` | 全局搜索 | `src/app/search/page.tsx` |
| `/ethscriptions` | 最新铭文 | `src/app/ethscriptions/page.tsx` |
| `/tokens` | Token 铭文 | `src/app/tokens/page.tsx` |
| `/bulk` | 批量操作 | `src/app/bulk/page.tsx` |

### Step 1.2 读文档建立概念（3 小时）

打开 `项目架构-代码解读.md`，按顺序读：

- [ ] **第一节**：项目是什么
- [ ] **第二节**：技术栈（表格过一遍，不懂的库先标记）
- [ ] **第三节**：架构图 + 数据流向 + 三层设计
- [ ] **第四节**：目录结构（对照 VS Code 左侧文件树）
- [ ] **第七节**：Web3 名词解释（Ethscription、OG Pass、Facet、Vault）

### Step 1.3 读配置文件（2 小时）

| 顺序 | 文件 | 学什么 | 对应解读文档 |
|------|------|--------|-------------|
| 1 | `package.json` | 依赖有哪些、npm scripts | 文档第二节 |
| 2 | `next.config.js` | rewrites 代理、SVG、Sentry | 文档 8.2 节 |
| 3 | `src/constants/config.ts` | 主网/测试网切换、API 地址 | 文档 8.1 节 |
| 4 | `tsconfig.json` | `@/` 路径别名指向 `src/` | — |

**Step 1.3 自测**：
- `/api/xxx` 请求实际发到哪里？
- 为什么生产环境要 removeConsole？

### 第一阶段 Checklist

- [ ] 项目本地跑通
- [ ] 14 个主要路由都点过
- [ ] 文档第一、二、三、四、七节读完
- [ ] 能画出三层架构（app / containers / services）
- [ ] 能说出 5 个核心业务模块名字

---

## 七、第二阶段：读懂应用骨架（Day 4~7）

> **目标**：理解「任何页面是怎么被渲染出来的」——从 layout 到 Header 到 page。

### Step 2.1 应用入口链（Day 4，4 小时）

**按这个顺序读，不要跳：**

```
1. src/app/layout.tsx          ← 根布局：html/body/Header/children
2. src/app/providers.tsx       ← 全局 Provider 嵌套（重点！）
3. src/app/providersMiddleware.tsx  ← 连接钱包后查 OG Pass
4. src/app/page.tsx            ← 首页路由映射
5. src/app/home/index.tsx      ← 首页内容
6. src/app/home/HomeLayout.tsx ← 首页专属布局
```

**读 providers.tsx 时必须搞懂这张图：**

```
QueryClientProvider          ← react-query 缓存
  └── ThemeProvider          ← MUI 主题
        └── WagmiConfig      ← Web3 连接
              └── RainbowKitAuthenticationProvider  ← SIWE 登录
                    └── RainbowKitProvider          ← 钱包 UI
                          └── {children}            ← 所有页面
```

**对应文档**：8.3 节、8.4 节

**Step 2.1 自测**：
- `'use client'` 是什么意思？哪些文件必须有？
- 为什么 RainbowKit 样式要在 layout 里 import？
- `{children}` 在访问 `/market` 时渲染的是什么？

### Step 2.2 导航与登录（Day 5，4 小时）

| 顺序 | 文件 | 学什么 |
|------|------|--------|
| 1 | `src/containers/Header.tsx` | 响应式导航、搜索框、购物车入口 |
| 2 | `src/containers/NavigationAPP.tsx` | 菜单数据、路由高亮 |
| 3 | `src/containers/ConnectWallet.tsx` | 钱包入口薄包装 |
| 4 | `src/containers/ConnectButtonLocal/index.tsx` | RainbowKit Custom 按钮 |
| 5 | `src/containers/ConnectButtonLocal/AccountMenu.tsx` | 账户下拉菜单 |
| 6 | `src/app/authenticationAdapter.ts` | **SIWE 四步登录（核心）** |
| 7 | `src/stores/GlobalStore.ts` | 登录状态、token 存取 |

**动手实验**：
1. 连接 MetaMask 测试网钱包
2. 打开 DevTools → Application → LocalStorage，看 token 存在哪
3. 打开 DevTools → Network，过滤 `/api`，看登录请求

**对应文档**：第六节 6.1/6.2、第十节 10.1、8.5 节

**Step 2.2 自测**：
- SIWE 四步分别是什么？
- 为什么需要 nonce（防重放攻击）？
- token 存在哪里？刷新页面怎么恢复登录？

### Step 2.3 服务层基础（Day 6，4 小时）

| 顺序 | 文件 | 学什么 |
|------|------|--------|
| 1 | `src/services/index.ts` | 服务门面、双 client |
| 2 | `src/services/network/ApiClient.ts` | axios 封装、泛型 |
| 3 | `src/services/network/etchClient.ts` | baseURL、token 拦截器 |
| 4 | `src/services/network/facetClient.ts` | Facet 独立后端 |
| 5 | `src/services/getQueryParams.ts` | 对象 → URL 参数 |
| 6 | `src/services/types.ts` | IResponse、BasePage |

**对应文档**：8.6 节、第十节 10.4 节

**Step 2.3 自测**：
- 为什么组件不直接 `axios.get` 而要 `services.xxx`？
- etchClient 拦截器做了什么？
- `IResponse<T>` 的 code/message/data 分别是什么？

### Step 2.4 Hooks + 主题 + Footer（Day 7，3 小时）

| 文件 | 学什么 |
|------|--------|
| `src/hooks/useEthersProvider.tsx` | 只读链上数据 |
| `src/hooks/useEthersSigner.tsx` | 签名发交易 |
| `src/constants/theme.ts` | MUI 主题色 |
| `src/containers/Footer.tsx` | 页脚 |

**对应文档**：第十节 10.3 节、11.2 节

### 第二阶段 Checklist

- [ ] 能不看代码说出 layout → providers → page 的嵌套关系
- [ ] 能口述 SIWE 登录流程
- [ ] 能解释 services/index.ts 里每个 Service 的职责
- [ ] 能解释 useEthersProvider vs useEthersSigner

---

## 八、第三阶段：跟一条完整业务链路（Day 8~14）

> **目标**：这是整个学习过程中 **最重要的一 week**！  
> 跟完「市场浏览 → 查看挂单 → 加入购物车 → 购买」全流程，你就掌握了项目 60% 的写法。

### Step 3.1 市场列表（Day 8~9）

**阅读顺序：**

```
src/app/market/page.tsx                    ← 10 行薄页面
src/app/market/layout.tsx                  ← CategoryTag + Footer
src/containers/CollectionList/index.tsx    ← 集合列表逻辑
src/containers/CollectionList/TableData.tsx ← DataGrid 表格
src/services/marketpalce/index.ts          ← getCollectionList 等 API
src/services/marketpalce/types.ts          ← 请求/响应类型
```

**跟踪练习**：
1. 打开 `/market`，DevTools Network 找 collection 相关 API
2. 在 `CollectionList` 里找到对应的 `services.marketplace.xxx` 调用
3. 看返回 JSON 怎么被 setState 传给 TableData

**对应文档**：11.3 节

### Step 3.2 集合详情 + 挂单列表（Day 10~11）

```
src/app/market/nft/page.tsx          ← Tabs: Listed / Orders / Holders
src/containers/ListedList/index.tsx  ← 挂单列表
src/containers/OrderList/index.tsx   ← 订单历史
src/containers/CollectionDetail.tsx  ← 集合信息头
src/containers/EthscriptionBox/      ← 铭文卡片（重点子目录）
  ├── index.tsx
  ├── EthscriptionBoxContext.tsx
  ├── EthscriptionView.tsx
  ├── NftView.tsx / Erc20View.tsx / DomainView.tsx
```

**理解 EthscriptionBox 设计**：
- 一个盒子组件，根据 category 渲染三种视图（NFT/Token/Domain）
- Context 传递 ethscription 数据，避免 props 层层传递

**对应文档**：17.6~17.8 节

### Step 3.3 购物车 + 购买（Day 12~13）

```
src/stores/CartStore.ts              ← 购物车状态 + localStorage 持久化
src/containers/CartDrawer/index.tsx  ← 购物车抽屉
src/containers/CartDrawer/CartList.tsx
src/containers/CartDrawer/CartSettlement.tsx  ← 结算
src/containers/ListedList/ConfirmBuy.tsx      ← 单个购买确认
src/constants/abis.ts                ← EtchMarket 合约 ABI（先浏览结构）
src/services/evm/etchMarket.ts       ← buy 链上方法
src/services/evm/etchMarketSweep.ts  ← 批量扫货
```

**跟踪练习**：
1. 在市场页把商品加入购物车
2. 看 CartStore 的 orderIds 怎么变化
3. 刷新页面，购物车是否还在（localStorage）
4. 读 buy 流程：ConfirmBuy → evmService → 钱包弹窗

**对应文档**：第十节 10.2 节、11.1 节、11.3 节、第十二节

### Step 3.4 画一张全流程图（Day 14）

用纸或工具画出：

```
/market → CollectionList → API 列表
    ↓ 点击集合
/market/nft → ListedList → API 挂单
    ↓ 点击 Buy / Add to Cart
CartStore / ConfirmBuy → evmService.etchMarket.buy → MetaMask → 上链
    ↓
toast 提示 → 刷新列表
```

**第三阶段 Checklist**

- [ ] 能独立从 page.tsx 跟到 services API 调用
- [ ] 能解释 EthscriptionBox 三种视图的区别
- [ ] 能解释 CartStore 持久化原理（subscribe + splice）
- [ ] 能口述购买流程的「前端 + 链上」两侧步骤
- [ ] 完成一张市场购买全流程图

---

## 九、第四阶段：按模块逐个攻克（Day 15~28）

> 每个模块按固定 **四步法** 学习：  
> **① app/xxx/page.tsx → ② containers/ → ③ services/ → ④ stores/（如有）**

### 模块 A：首页 & 搜索（Day 15~16）

| 文件 | 说明 |
|------|------|
| `src/app/home/index.tsx` | 首页搜索 + 最新动态 |
| `src/components/SearchInput.tsx` | 搜索框组件 |
| `src/app/search/page.tsx` | 搜索结果页 |
| `src/containers/SearchEthsResults/index.tsx` | 搜索结果容器 |

**文档**：12.4 节、10.5 节

---

### 模块 B：个人中心 My Ethscriptions（Day 17~19）⭐ 简历高频

| 文件 | 说明 |
|------|------|
| `src/app/owner/page.tsx` | 个人铭文主页 |
| `src/containers/MyEthscriptions/index.tsx` | 铭文列表 |
| `src/containers/MyEthscriptions/ConfirmListing.tsx` | 挂单 |
| `src/containers/MyEthscriptions/ConfirmTransfer.tsx` | 转账 |
| `src/containers/MyEthscriptions/BulkOperation.tsx` | 批量操作（PC） |
| `src/stores/BulkListingStore.ts` | 批量挂单状态 |

**重点搞懂**：挂单 = 调合约 createOrder + 后端索引；Bulk 批量 = 多个 order 一次提交

**文档**：第十九章 19.1 节

---

### 模块 C：Swap DEX（Day 20~21）

| 文件 | 说明 |
|------|------|
| `src/app/swap/page.tsx` | Swap 页 |
| `src/containers/Swap/SwapContainer/index.tsx` | 兑换主容器 |
| `src/services/facet/index.ts` | getPairs / getSimulate |
| `src/stores/FacetSwapStore.ts` | token0/token1 选币状态 |
| `src/utils/getFacetTokenInfo.ts` | 从 pairs 提取余额 |

**文档**：第十三节、第十四节

---

### 模块 D：Launchpad 发射台（Day 22~23）

| 文件 | 说明 |
|------|------|
| `src/app/launchpad/page.tsx` | 发射台大厅 |
| `src/app/launchpad/ListArea.tsx` | 项目列表 |
| `src/containers/LaunchpadDialog.tsx/index.tsx` | 铸造弹窗 |
| `src/containers/LaunchpadDialog.tsx/WhitelistMint.tsx` | 白名单 Merkle Proof |
| `src/services/launchpad/index.ts` | Launchpad API |
| `src/services/evm/etchLaunchpad.ts` | 链上 mint |

**文档**：第二十章 20.2 节

---

### 模块 E：Bridge 跨链桥（Day 24）

| 文件 | 说明 |
|------|------|
| `src/app/bridge/page.tsx` | 桥接页 |
| `src/containers/Bridge/Deposit.tsx` | 存款/提款交互 |
| `src/containers/Bridge/LineChat.tsx` | 说明/图表 |

**文档**：第十四节 14.x 节

---

### 模块 F：Staking 质押 + Vault 金库（Day 25~26）

| 文件 | 说明 |
|------|------|
| `src/app/staking/page.tsx` | 质押列表 |
| `src/containers/StakingOverview.tsx` | 质押概览 |
| `src/services/vault/index.ts` | 金库 API |
| `src/containers/VaultList/index.tsx` | 金库铭文列表 |
| `src/services/evm/etchMarketVault.ts` | 链上质押/赎回 |

**文档**：第十五节、第十六节 16.1 节

---

### 模块 G：Token 铭文 & 交易大盘（Day 27~28）

| 文件 | 说明 |
|------|------|
| `src/app/tokens/page.tsx` | Token 主页 |
| `src/app/tokens/info/page.tsx` | Token 详情 |
| `src/app/transactions/page.tsx` | 全站交易 |
| `src/containers/TransactionOverview.tsx` | 统计卡片 |
| `src/containers/TransactionList/index.tsx` | 交易列表 |
| `src/containers/Erc20sDeploy.tsx` | 部署 ERC-20 铭文 |

**文档**：第十六节、第十七节、8.x transactions 相关

---

## 十、第五阶段：Web3 链上层 + 面试冲刺（Day 29~35）

### Step 5.1 链上交互层（Day 29~31）

**必读：**

```
src/constants/abis.ts           ← 6 个合约 ABI 是干什么的（先读文档 11.1 节表格）
src/services/evm/index.ts       ← 导出入口
src/services/evm/contracts.ts   ← 合约地址 + 实例工厂
src/services/evm/etchMarket.ts
src/services/evm/etchMarketSweep.ts
src/services/evm/etchLaunchpad.ts
src/services/evm/erc20sDeploy.ts
src/typechain-types/            ← 自动生成，了解即可，不要手改
```

**理解 typechain 工作流**：
```
合约 Solidity → 编译 ABI → typechain 生成 TS 类型 → __factory.connect(address, signer)
```

### Step 5.2 工具层扫读（Day 32）

```
src/utils/getTruncate.ts       ← 大数格式化
src/utils/numberFormatUnit.ts  ← K/M/B 缩写
src/utils/getTimeAgoString.ts  ← 时间 ago
src/utils/useCopy.ts           ← 复制 Hook
src/utils/index.ts             ← Data URL 解析（铭文内容）
src/constants/index.ts         ← 零地址、分类枚举
src/wallets/gateWallet/index.ts ← 自定义 Gate 钱包
```

**文档**：第十八章

### Step 5.3 模拟面试（Day 33~35）

见 [第十三节 常见面试题速答](#十三常见面试题速答)，每天自问自答 5 题，录音回听。

---

## 十一、全项目文件阅读索引（按优先级）

### P0 — 必须精读（面试必问）

| 文件 | 优先级 |
|------|--------|
| `next.config.js` | P0 |
| `src/app/layout.tsx` | P0 |
| `src/app/providers.tsx` | P0 |
| `src/app/authenticationAdapter.ts` | P0 |
| `src/services/index.ts` | P0 |
| `src/services/network/etchClient.ts` | P0 |
| `src/stores/GlobalStore.ts` | P0 |
| `src/stores/CartStore.ts` | P0 |
| `src/containers/Header.tsx` | P0 |
| `src/containers/CollectionList/index.tsx` | P0 |
| `src/services/evm/etchMarket.ts` | P0 |

### P1 — 重要（模块深入）

| 模块 | 核心文件 |
|------|----------|
| 市场 | `ListedList`、`EthscriptionBox/*`、`marketpalce/index.ts` |
| 个人中心 | `MyEthscriptions/*`、`BulkListingStore.ts` |
| Swap | `SwapContainer`、`facet/index.ts`、`FacetSwapStore.ts` |
| Launchpad | `LaunchpadDialog.tsx/*`、`etchLaunchpad.ts` |
| 登录 | `ConnectButtonLocal/*`、`did/index.ts` |

### P2 — 了解即可

| 类型 | 说明 |
|------|------|
| `typechain-types/**` | 自动生成，会随合约更新 |
| `TableData.tsx` 系列 | 大多是 DataGrid 列定义，模式重复 |
| `Confirm*.tsx` 系列 | 模式类似：弹窗 → 调 evmService → toast |

### P3 — 可跳过（除非面试问到）

- `sentry.*.config.ts` — 运维向
- `messages/` — 国际化文案
- `Dockerfile` / `Makefile` — 部署向

---

## 十二、每步自测题 & 面试话术模板

### 话术模板 1：介绍项目

> 「EtchMarket 是一个 Web3 铭文综合平台，我参与学习/开发的是前端部分，基于 **Next.js 14 App Router**，用 **TypeScript + MUI** 做 UI。项目采用 **三层架构**：app 负责路由，containers 负责业务逻辑，services 封装 REST API。Web3 部分用 **wagmi + RainbowKit** 连接钱包，**SIWE** 实现无密码登录，链上交易通过 **ethers.js + typechain** 生成的合约类型调用。我重点理解了 **市场模块** 从列表到购买的完整链路，以及 **valtio** 购物车持久化的实现。」

### 话术模板 2：说一个技术难点

> 「项目中 wagmi v1 底层用 viem，但合约层代码是 ethers v5 写的，所以封装了 **useEthersSigner** 做适配转换。我理解这个 Hook 的作用是把 viem 的 WalletClient 转成 ethers Signer，这样 typechain 生成的 `__factory.connect` 就能直接使用。」

### 话术模板 3：说一个设计亮点

> 「购物车用 **valtio** 管理状态，通过 **subscribe** 监听 orderIds 变化自动写入 localStorage。这里有个细节：清空购物车要用 **splice** 而不是 `= []`，因为 subscribe 监听的是数组引用，直接赋值新数组会丢失订阅。」

---

## 十三、常见面试题速答

### Q1：为什么用 Next.js 而不是 CRA？

**答**：需要 SEO（搜索引擎收录铭文/market 页面）、文件路由、API 代理解决跨域、standalone 输出方便 Docker 部署。

### Q2：Client Component 和 Server Component 区别？

**答**：Server Component 在服务端渲染，不能用 useState/useEffect/浏览器 API；带 `'use client'` 的组件在浏览器运行。本项目大量用 Client Component 因为 Web3（钱包、签名）只能在浏览器执行。

### Q3：valtio 和 Redux 比有什么优点？

**答**：API 更简单，`proxy()` 创建状态后直接修改字段即可，不需要 action/reducer/dispatch。配合 `useSnapshot` 做细粒度响应式更新。适合中等复杂度 DApp。

### Q4：react-query 在这个项目里干什么？

**答**：在 providers 里注入 QueryClientProvider，部分列表数据可用 react-query 做缓存、重试、loading 状态。与 valtio 分工：valtio 管客户端持久状态，react-query 管服务端数据缓存。

### Q5：API 请求怎么带登录 token？

**答**：SIWE 验证成功后 token 存 localStorage，etchClient 的 axios 请求拦截器读取 token 加到 Authorization: Bearer header。

### Q6：购买 NFT 时前端做了什么？

**答**：1) 从 API 获取挂单 order 数据；2) 用户确认价格；3) 用 useEthersSigner 获取 signer；4) 调 etchMarket 合约 buy 方法，传入 order 和 signature；5) 用户在钱包确认交易；6) 等待 receipt；7) toast 提示并刷新列表。

### Q7：BigNumber 为什么必须用库？

**答**：以太坊代币精度 18 位小数，JS Number 超过 2^53 会丢失精度，金额计算必须用 bignumber.js。

### Q8：项目的错误监控怎么做？

**答**：集成 Sentry（@sentry/nextjs），生产环境 withSentryConfig 包装 next.config，tunnelRoute 防广告拦截，构建时上传 source map。

---

## 十四、学习工具 & 调试技巧

### 14.1 必装浏览器扩展

| 工具 | 用途 |
|------|------|
| React Developer Tools | 看组件树、Provider 嵌套 |
| MetaMask | 连接测试网钱包 |
| Redux DevTools（可选） | 部分 valtio 版本可调试 |

### 14.2 DevTools 常用操作

```
Network 面板 → 过滤 /api     → 看 API 请求/响应 JSON 结构
Application → LocalStorage   → 看 token、sweepOrderIds
Console → 临时 console.log   → 打印组件里的 state
```

### 14.3 VS Code 技巧

```
Ctrl + Click import    → 跳转到定义
Shift + F12            → 查谁引用了这个函数
Ctrl + P → 文件名       → 快速打开文件
```

### 14.4 推荐学习节奏

| 时间段 | 做什么 |
|--------|--------|
| 第 1 小时 | 读代码 + 看文档对应章节 |
| 第 2 小时 | 浏览器点功能 + DevTools 跟 Network |
| 第 3 小时 | 画流程图 + 写自测答案 + 用自己的话复述 |

---

## 十五、进度总 Checklist

### 阶段一（Day 1~3）

- [ ] 本地跑通
- [ ] 14 个路由巡礼
- [ ] 架构文档第一~四、七节
- [ ] next.config + config.ts

### 阶段二（Day 4~7）

- [ ] layout → providers → page 链
- [ ] SIWE 登录流程
- [ ] services 层基础
- [ ] Header + GlobalStore

### 阶段三（Day 8~14）⭐

- [ ] 市场列表链路
- [ ] EthscriptionBox
- [ ] 购物车 + 购买
- [ ] 全流程图

### 阶段四（Day 15~28）

- [ ] 模块 A 首页搜索
- [ ] 模块 B 个人中心
- [ ] 模块 C Swap
- [ ] 模块 D Launchpad
- [ ] 模块 E Bridge
- [ ] 模块 F Staking/Vault
- [ ] 模块 G Token/Transactions

### 阶段五（Day 29~35）

- [ ] abis + evm 层
- [ ] utils 工具层
- [ ] 13 道面试题自答
- [ ] 简历项目描述定稿
- [ ] 模拟面试 3 轮

---

## 附录 A：`项目架构-代码解读.md` 章节对照表

| 你学到哪一步 | 去读文档哪一节 |
|-------------|---------------|
| Day 1 概念 | 第一~四节、第七节 |
| Day 4 骨架 | 第五节、8.1~8.4 节 |
| Day 5 登录 | 第六节 6.1/6.2、8.5 节 |
| Day 6 服务层 | 8.6 节、第十节 10.4 |
| Day 8 市场 | 第十一节 11.3 |
| Day 12 购物车 | 第十节 10.2、第十二节 |
| Day 17 个人中心 | 第十九章 |
| Day 20 Swap | 第十三~十四节 |
| Day 22 Launchpad | 第二十章 |
| Day 25 Staking | 第十五~十六节 |
| Day 27 Token | 第十七节 |
| Day 32 工具组件 | 第十八节 |

---

## 附录 B：学完后你可以做的「巩固练习」（选做）

1. **改一个 UI**：把 Connect Wallet 按钮颜色改成蓝色，走一遍改代码 → 刷新验证
2. **加一个 console**：在 CollectionList 请求成功后打印数据，理解 JSON 结构
3. **读一条 git log**：如果有提交历史，看前辈怎么命名 commit
4. **写一篇学习笔记**：用自己的话 500 字描述市场购买流程
5. **Mock 面试**：让朋友问你第十三节的 8 道题

---

> **最后一句**：这个项目大，但 **80% 的代码是同一套模式的重复**（薄 page + 厚 container + services API + 可选 evm 链上调用）。  
> 第三阶段跟完市场购买链路后，后面每个模块都会越来越快。  
> 不要追求「每一行都看懂」，先搞懂 **骨架 + 一条完整链路 + 你简历上写的模块**，就足够面试了。

---

_文档版本：2026-06 · 配套 EtchMarket fe-website-1 仓库_  
_与 `项目架构-代码解读.md` 配合使用效果更佳_
