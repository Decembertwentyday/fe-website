/**
 * ==============================================================
 * 文件：src/services/evm/index.ts
 * 作用：EVM 智能合约交互层的统一导出入口
 *
 * REST API（services/index.ts） vs EVM 层（本文件）：
 *   - REST：读索引数据、用户资料、列表分页（后端已索引链上数据）
 *   - EVM：写链上交易（购买、挂单、mint、跨链、部署 ERC20 等）
 *
 * 各模块职责：
 *   etchMarket        — 市场合约：createOrder、buy、cancel
 *   etchMarketSweep   — 扫货合约：批量购买 floor 挂单
 *   etchMarketVault   — 金库合约：质押、赎回
 *   contract          — 合约地址与实例工厂（contracts.ts）
 *   etchLaunchpad     — 发射台 mint、白名单验证
 *   erc20sDeploy      — 部署新的 ERC-20 铭文代币
 *   erc20Ethscriptions— ERC-20 铭文协议相关调用
 *
 * 使用方式：
 *   import { evmService } from '@/services';
 *   await evmService.etchMarket.buy(signer, order, ...);
 *
 * 为什么 export * as xxx？
 *   命名空间导入，避免 etchMarket、buy 等名字与其他模块冲突
 * ==============================================================
 */

export * as etchMarket from './etchMarket';
export * as etchMarketSweep from './etchMarketSweep';
export * as etchMarketVault from './etchMarketVault';
export * as contract from './contracts';
export * as etchLaunchpad from './etchLaunchpad';
export * as erc20sDeploy from './erc20sDeploy';
export * as erc20Ethscriptions from './erc20Ethscriptions';
