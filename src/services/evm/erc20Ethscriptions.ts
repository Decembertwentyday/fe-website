// ============================================================================
// 【services/evm/erc20Ethscriptions.ts】ERC20 代币合约交互
// ----------------------------------------------------------------------------
// 作用：与以太坊上的 ERC20 代币化铭文合约 (ERC20Ethscriptions) 通信。
// 包括诸如 mint (获取某个特定币) 或是拿到在某一个特定合约环境下的获取上限等操作。
// ============================================================================
import { ethers } from 'ethers';
import { getERC20EthscriptionsContract, getERC20SFactoryContract } from './contracts';

export const ethscribe = async ({
  singer,
  address,
}: {
  singer: ethers.providers.JsonRpcSigner;
  address: string;
}): Promise<ethers.ContractReceipt> => {
  if (!singer?.provider) throw Error('not singer');

  const contract = await getERC20EthscriptionsContract(address, singer);

  const transactionResponse = await contract.mint();

  const transaction = await transactionResponse.wait();

  return transaction;
};

export const getInscribeCount = async ({
  provider,
  contractAddress,
  userAddress,
}: {
  provider: ethers.providers.JsonRpcProvider | ethers.providers.FallbackProvider;
  contractAddress: string;
  userAddress: string;
}) => {
  const contract = await getERC20EthscriptionsContract(contractAddress, provider);
  const count = await contract.inscribeCount(userAddress);
  return count;
};
export const getMintedCount = async ({
  provider,
  contractAddress,
}: {
  provider: ethers.providers.JsonRpcProvider | ethers.providers.FallbackProvider;
  contractAddress: string;
}) => {
  const contract = await getERC20EthscriptionsContract(contractAddress, provider);
  const currentCount = await contract.ethscriptionIndex();
  return currentCount.toNumber();
};
export const getlLastInscribeBlock = async ({
  provider,
  contractAddress,
  userAddress,
}: {
  provider: ethers.providers.JsonRpcProvider | ethers.providers.FallbackProvider;
  contractAddress: string;
  userAddress: string;
}) => {
  const contract = await getERC20EthscriptionsContract(contractAddress, provider);
  const currentCount = await contract.lastInscribeBlock(userAddress);
  return currentCount.toNumber();
};
