// ============================================================================
// 【services/evm/etchMarketSweep.ts】购物车扫货聚合交易合约 (Sweep) 交互
// ----------------------------------------------------------------------------
// 作用：从购物车中选中多笔跨卖家的铭文订单，利用此智能合约进行批量购买 (Batch Buy / Sweep)。
// 该合约的运作机制：用户支付 ETH，由 Sweep 合约集中拆账再调到核心市场合约进行批量转移结算。
// ============================================================================
import { ethers } from 'ethers';
import { getEtchMarketSweepContract } from './contracts';
import { GetOrderByCartData } from '../marketpalce/types';
import { BatchOrder, OrderTypes } from '@/typechain-types/contracts/EtchMarket';
import { INTERNAL_Snapshot } from 'valtio';

export const batchBuyEthscription = async ({
  singer,
  ethscriptionSweep,
  sellPrice,
}: {
  singer: ethers.providers.JsonRpcSigner;
  ethscriptionSweep: INTERNAL_Snapshot<GetOrderByCartData>;
  sellPrice: string;
}): Promise<ethers.ContractReceipt> => {
  if (!singer?.provider) throw Error('not singer');

  const contract = await getEtchMarketSweepContract(ethscriptionSweep.sweepAddress, singer);

  const orderList: BatchOrder.EthscriptionOrderStruct[] = ethscriptionSweep.orders
    .map((item) => item.order)
    .filter((item) => item && item.orderHash.trim() !== '')
    .map((item) => {
      return {
        ...item,
        ethscriptionIds: [item.ethscriptionId],
        quantities: [item.quantity],
        r: item.signature.slice(0, 66),
        s: '0x' + item.signature.slice(66, 130),
        v: parseInt(item.signature.slice(130, 132), 16),
      };
    });

  const merkleTree = ethscriptionSweep.orders
    .map((item) => item.order)
    .filter((item) => item && item.orderHash.trim() !== '')
    .map((item) => {
      return {
        root:
          item.merkleRoot.trim() == ''
            ? '0x0000000000000000000000000000000000000000000000000000000000000000'
            : item.merkleRoot,
        proof: item.merkleProof,
      };
    }) as BatchOrder.MerkleTreeStruct[];

  // const tx = await sweep.([newOrder], [merkleTree], {value: sellPrice})
  // const transactionResponse = await contract.batchBuy(orderList, { value: sellPrice });
  const transactionResponse = await contract.bulkBuy(orderList, merkleTree, { value: sellPrice });

  const transaction = await transactionResponse.wait();

  return transaction;
};
