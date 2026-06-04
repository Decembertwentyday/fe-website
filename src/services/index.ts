/**
 * ==============================================================
 * 文件：src/services/index.ts
 * 作用：整个项目的「服务层总入口」（Service Facade 门面模式）
 *
 * 什么是服务层？
 *   前端与后端 API 之间的「翻译官」：
 *   - UI 组件不直接写 axios.get('/api/xxx')
 *   - 而是调用 services.ethscriptions.getAssetList(...)
 *   - 好处：URL 变更、参数格式变化只改服务层，UI 不用动
 *
 * 为什么用 Class + 单例，而不是一堆独立函数？
 *   1. 依赖注入：每个 Service 构造函数接收同一个 ApiClient
 *      → 认证 token、baseURL、超时配置只需在 etchClient 里配一次
 *   2. 命名空间清晰：services.marketplace.xxx vs services.did.xxx
 *   3. 便于测试：Mock 时可以只替换 ApiClient 实例
 *
 * 两个 HTTP 客户端的区别：
 *   - etchClient  → EtchMarket 主后端（铭文、市场、DID、Launchpad 等）
 *   - facetClient → Facet L2 链后端（Swap/DEX 相关，独立 API 域名）
 *
 * 使用方式（全项目统一）：
 *   import services from '@/services';
 *   const list = await services.ethscriptions.getRecentList({ page: 1 });
 *
 * evmService 为什么单独 export？
 *   EVM 层是直接调智能合约（ethers.js），不走 REST API，
 *   职责不同，所以用命名空间 export * as evmService 单独暴露。
 * ==============================================================
 */

import EthscriptionsService from './ethscriptions';
import MarketplaceService from './marketpalce';
import LaunchpadService from './launchpad';
import DidService from './did';
import DomainService from './domain';
import VaultService from './vault';
import FacetService from './facet';
import etchClient from './network/etchClient';
import facetClient from './network/facetClient';

/**
 * Services 聚合类：持有所有业务 Service 实例
 * 每个 Service 对应后端的一个业务域（Domain）
 */
class Services {
  ethscriptions: EthscriptionsService; // 铭文索引：列表、详情、铸造、转账
  marketplace: MarketplaceService; // 交易市场：挂单、购买、集合
  launchpad: LaunchpadService; // 发射台：新项目首发、白名单 mint
  vault: VaultService; // 金库：质押、赎回
  did: DidService; // 去中心化身份：SIWE 登录、OG Pass 查询
  domain: DomainService; // 域名铭文：.eth 风格域名分类
  facet: FacetService; // Facet DEX：Swap 交易对、余额、模拟报价

  constructor() {
    // 依赖注入：把配置好的 axios 实例传给各 Service
    // etchClient 已在 etchClient.ts 里配置了 baseURL、token 拦截器等
    this.ethscriptions = new EthscriptionsService(etchClient);
    this.marketplace = new MarketplaceService(etchClient);
    this.launchpad = new LaunchpadService(etchClient);
    this.vault = new VaultService(etchClient);
    this.did = new DidService(etchClient);
    this.domain = new DomainService(etchClient);
    // Facet 使用独立的 facetClient（不同的 baseURL，指向 Facet L2 API）
    this.facet = new FacetService(facetClient);
  }
}

// 导出单例：全项目 import services 拿到的是同一个实例
// 为什么单例？避免重复创建 axios 实例、重复注册拦截器
export default new Services();

// EVM 合约交互层（ethers.js 直接调链上合约，不走 REST）
export * as evmService from './evm';
