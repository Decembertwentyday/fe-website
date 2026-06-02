// ============================================================================
// 【services/evm/erc20sDeploy.ts】ERC20 Launchpad 的一键发币工厂
// ----------------------------------------------------------------------------
// 作用：前端用户点击部署 (Deploy) 代币时，调用的工厂合约，负责直接新建并配置特定集合。
// ============================================================================
import { ethers } from 'ethers';
import { getERC20SFactoryContract } from './contracts';

export const deploy = async ({
  singer,
  address,
  params,
}: {
  singer: ethers.providers.JsonRpcSigner;
  address: string;
  params: any;
}): Promise<ethers.ContractReceipt> => {
  if (!singer?.provider) throw Error('not singer');

  const contract = await getERC20SFactoryContract(address, singer);

  const transactionResponse = await contract.deploy(
    params.name,
    params.symbol,
    params.total_supply,
    params.limit_per_mint,
    params.wallet_limit,
    params.start_time,
    params.mint_interval,
    params.royalties_receiver,
    params.royalties,
    params.controller,
  );

  const transaction = await transactionResponse.wait();

  return transaction;
};
