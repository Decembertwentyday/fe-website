// ============================================================================
// 【services/evm/contracts.ts】EVM 智能合约实例化工具
// ----------------------------------------------------------------------------
// 作用：加载 ABI 和地址，使用 ethers.js 生成对应的 Contract 实例对象。
// 包含了基础校验、原生 ETH 地址常量等，并导出获取各类特定合约的工厂函数。
// ============================================================================
import { Contract, ethers } from 'ethers';
import {
  EtchMarketABI,
  EtchMarketSweepABI,
  EtchMarketVaultABI,
  EtchLaunchpadABI,
  ERC20SFactoryABI,
  ERC20EthscriptionsABI,
} from '@/constants/abis';
import { EtchMarket, EtchMarketSweep, EtchLaunchpad, EtchEthscriptionVault } from '@/typechain-types';
import { ERC20SFactory } from '@/typechain-types-erc20/contracts/ERC20SFactory';
import { ERC20Ethscriptions } from '@/typechain-types-erc20/contracts/ERC20Ethscriptions';

export type SingerOrProvider = ethers.Signer | ethers.providers.Provider;

export const ETH_CURRENCY_ADDRESS = '0x0000000000000000000000000000000000000000';

export function isAddress(value: any): string | false {
  try {
    return ethers.utils.getAddress(value);
  } catch {
    return false;
  }
}

export function getContract<T extends Contract = Contract>(address: string, ABI: any, provider: SingerOrProvider): T {
  if (!isAddress(address)) {
    throw Error(`Invalid 'address' parameter '${address}'.`);
  }

  return new ethers.Contract(address, ABI, provider) as T;
}

export function getEtchMarketContract(address: string, provider: SingerOrProvider) {
  return getContract<EtchMarket>(address, EtchMarketABI, provider);
}

export function getEtchMarketSweepContract(address: string, provider: SingerOrProvider) {
  return getContract<EtchMarketSweep>(address, EtchMarketSweepABI, provider);
}

export function getEtchMarketVaultContract(address: string, provider: SingerOrProvider) {
  return getContract<EtchEthscriptionVault>(address, EtchMarketVaultABI, provider);
}

export function getEtchLaunchpadContract(address: string, provider: SingerOrProvider) {
  return getContract<EtchLaunchpad>(address, EtchLaunchpadABI, provider);
}

export function getERC20SFactoryContract(address: string, provider: SingerOrProvider) {
  return getContract<ERC20SFactory>(address, ERC20SFactoryABI, provider);
}
export function getERC20EthscriptionsContract(address: string, provider: SingerOrProvider) {
  return getContract<ERC20Ethscriptions>(address, ERC20EthscriptionsABI, provider);
}
