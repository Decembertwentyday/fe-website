// ============================================================================
// 【services/evm/etchMarketVault.ts】Vault（资产金库）智能合约操作
// ----------------------------------------------------------------------------
// 作用：对将 ERC20 或特有铭文存放进官方金库 (比如 Facet Dex 金库 / 质押池) 等逻辑的合约调用。
// 主要涉及：stakeEthscription（存入资产，转移给被质押合约）和金库存取相关的签名交互。
// ============================================================================
import { ethers } from 'ethers';
import { TypedDataUtils } from 'ethers-eip712';
import { signTypedData } from '@wagmi/core';
import { v4 } from 'uuid';

import { getEtchMarketVaultContract } from './contracts';
import { GetEthscriptionsItem } from '../marketpalce/types';
import { GetVaultWidthdrawData } from '../vault/types';

export const stakeEthscription = async ({
  singer,
  to,
  ethscription,
}: {
  singer: ethers.providers.JsonRpcSigner;
  to: string;
  ethscription: GetEthscriptionsItem;
}) => {
  const tx: ethers.utils.Deferrable<ethers.providers.TransactionRequest> = {
    to,
    data: ethscription.order.ethscriptionId,
  };

  const transactionResponse = await singer.sendTransaction(tx);
  const transaction = await transactionResponse.wait();

  return transaction;
};

export const signatureWithOrder = async (
  chainId: number,
  vaultAddress: string,
  recipient: string,
  ethscriptionId: string,
) => {
  const orderId = v4();
  const typedData = {
    types: {
      EIP712Domain: [
        {
          name: 'name',
          type: 'string',
        },
        {
          name: 'version',
          type: 'string',
        },
        {
          name: 'chainId',
          type: 'uint256',
        },
        {
          name: 'verifyingContract',
          type: 'address',
        },
      ],
      WithdrawEthscription: [
        {
          name: 'ethscriptionId',
          type: 'bytes32',
        },
        {
          name: 'recipient',
          type: 'address',
        },
        {
          name: 'orderId',
          type: 'bytes',
        },
      ],
    },
    primaryType: 'WithdrawEthscription',
    domain: {
      name: 'EtchEthscriptionVault',
      version: '1',
      chainId: chainId,
      verifyingContract: vaultAddress,
    },
    message: {
      ethscriptionId: ethscriptionId,
      recipient: recipient,
      orderId: '0x' + Buffer.from(orderId).toString('hex'),
    },
  };

  const digest = TypedDataUtils.encodeDigest(typedData);
  const digestHex = ethers.utils.hexlify(digest);
  const signature = await signTypedData(typedData as any);

  return { signature, digestHex, orderId };
};

export const withdrawEthscriptionSign = async ({
  singer,
  orderInfo,
}: {
  singer: ethers.providers.JsonRpcSigner;
  orderInfo: GetVaultWidthdrawData;
}): Promise<ethers.ContractReceipt> => {
  const contract = getEtchMarketVaultContract(orderInfo.vaultAddress, singer);

  const transactionResponse = await contract.withdrawEthscription(
    orderInfo.ethscriptionId,
    '0x' + Buffer.from(orderInfo.orderId).toString('hex'),
    orderInfo.signature,
    orderInfo.trustedSignature,
  );

  const transaction = await transactionResponse.wait();

  return transaction;
};
