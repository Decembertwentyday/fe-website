// ============================================================================
// 【services/evm/etchMarket.ts】EtchMarket 基础市场聚合与交互
// ----------------------------------------------------------------------------
// 作用：负责 EtchMarket 主力买卖操作的合约和签名调用逻辑。
// 主要涉及：
// 1. SignatureWithOrder：基于 EIP-712 生成结构化订单签名 (为了实现无 Gas 挂单)
// 2. batchListEthscriptions / _ListingEthscriptions：打包多签/单签名上传后端
// 3. buy：使用自己的地址和支付一定的 ETH 在链上调用合购来完成购买。
// 4. transferMultipleEthscriptions：利用 Facet Payload 编码和 L1 交易来实现转移。
// ============================================================================
import { ethers } from 'ethers';
import { signTypedData } from '@wagmi/core';
import lodash from 'lodash-es';
import { getEtchMarketContract } from './contracts';
import services from '..';
import { TypedDataUtils } from 'ethers-eip712';
import { GetEthscriptionsItem, GetOrderNonceData, ListingBulkRequest, ListingRequest } from '../marketpalce/types';
import { BatchOrder, OrderTypes } from '@/typechain-types/contracts/EtchMarket';
import dayjs, { Dayjs } from 'dayjs';
import { IBulkEthscriptionsItem } from '@/stores/BulkListingStore';
import MerkleTree from 'merkletreejs';
import { keccak256, stringToHex } from 'viem';
import { completedSize, fillArray, getTreeHeight } from '@/utils';
import { DEFAULT_ORDER } from '@/constants';
import BigNumber from 'bignumber.js';

export const SignatureWithOrder = async (chainId: number, marketAddress: string, order: any) => {
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
      EthscriptionOrder: [
        {
          name: 'signer',
          type: 'address',
        },
        {
          name: 'creator',
          type: 'address',
        },
        {
          name: 'ethscriptionId',
          type: 'bytes32',
        },
        {
          name: 'quantity',
          type: 'uint256',
        },
        {
          name: 'currency',
          type: 'address',
        },
        {
          name: 'price',
          type: 'uint256',
        },
        {
          name: 'nonce',
          type: 'uint256',
        },
        {
          name: 'startTime',
          type: 'uint64',
        },
        {
          name: 'endTime',
          type: 'uint64',
        },
        {
          name: 'protocolFeeDiscounted',
          type: 'uint16',
        },
        {
          name: 'creatorFee',
          type: 'uint16',
        },
        {
          name: 'params',
          type: 'bytes',
        },
      ],
    },
    primaryType: 'EthscriptionOrder',
    domain: {
      name: 'EtchMarket',
      version: '1',
      chainId,
      verifyingContract: marketAddress,
    },
    message: order,
  };

  const digest = TypedDataUtils.encodeDigest(typedData);
  const digestHex = ethers.utils.hexlify(digest);
  const signature = await signTypedData(typedData as any);

  return { signature, digestHex };
};

function OrderHash(chainId: number, marketAddress: string, order: typeof DEFAULT_ORDER) {
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
      EthscriptionOrder: [
        {
          name: 'signer',
          type: 'address',
        },
        {
          name: 'creator',
          type: 'address',
        },
        {
          name: 'ethscriptionId',
          type: 'bytes32',
        },
        {
          name: 'quantity',
          type: 'uint256',
        },
        {
          name: 'currency',
          type: 'address',
        },
        {
          name: 'price',
          type: 'uint256',
        },
        {
          name: 'nonce',
          type: 'uint256',
        },
        {
          name: 'startTime',
          type: 'uint64',
        },
        {
          name: 'endTime',
          type: 'uint64',
        },
        {
          name: 'protocolFeeDiscounted',
          type: 'uint16',
        },
        {
          name: 'creatorFee',
          type: 'uint16',
        },
        {
          name: 'params',
          type: 'bytes',
        },
      ],
    },
    primaryType: 'EthscriptionOrder',
    domain: {
      name: 'EtchMarket',
      version: '1',
      chainId: chainId,
      verifyingContract: marketAddress,
    },
    message: order,
  };

  const digest = TypedDataUtils.encodeDigest(typedData);
  const typeHash = TypedDataUtils.hashStruct(typedData, 'EthscriptionOrder', order);

  return {
    digest: ethers.utils.hexlify(digest),
    typeHash: ethers.utils.hexlify(typeHash),
  };
}

function BatchOrderHash(chainId: number, marketAddress: string, orders: (typeof DEFAULT_ORDER)[], height: number) {
  let _order: any = orders;

  while (_order.length > 2) {
    _order = lodash.chunk(_order, 2);
  }

  const orderTree = {
    tree: _order,
  };

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
      EthscriptionOrder: [
        {
          name: 'signer',
          type: 'address',
        },
        {
          name: 'creator',
          type: 'address',
        },
        {
          name: 'ethscriptionId',
          type: 'bytes32',
        },
        {
          name: 'quantity',
          type: 'uint256',
        },
        {
          name: 'currency',
          type: 'address',
        },
        {
          name: 'price',
          type: 'uint256',
        },
        {
          name: 'nonce',
          type: 'uint256',
        },
        {
          name: 'startTime',
          type: 'uint64',
        },
        {
          name: 'endTime',
          type: 'uint64',
        },
        {
          name: 'protocolFeeDiscounted',
          type: 'uint16',
        },
        {
          name: 'creatorFee',
          type: 'uint16',
        },
        {
          name: 'params',
          type: 'bytes',
        },
      ],
      BatchOrder: [
        {
          name: 'tree',
          type: `EthscriptionOrder${`[2]`.repeat(height)}`,
        },
      ],
    },
    primaryType: 'BatchOrder',
    domain: {
      name: 'EtchMarket',
      version: '1',
      chainId: chainId,
      verifyingContract: marketAddress,
    },
    message: orderTree,
  };

  // const typeData = TypedDataUtils.encodeData(typedData, 'BatchOrder', orderTree);
  // console.log('typeData: ', ethers.utils.hexlify(typeData));

  // const digest = TypedDataUtils.encodeDigest(typedData);

  // console.log(digest);
  // return ethers.utils.hexlify(digest);

  return typedData;
}

export const SignatureWithOrderBulk = async (
  chainId: number,
  marketAddress: string,
  order: (typeof DEFAULT_ORDER)[],
) => {
  const digestList: (typeof DEFAULT_ORDER & { typeHash: string })[] = order.map((item: any) => {
    return { ...item, typeHash: OrderHash(chainId, marketAddress, item).typeHash };
  });

  let merkleTree = new MerkleTree(
    digestList.map((item) => item.typeHash),
    keccak256,
    {
      hashLeaves: false,
      sort: false,
    },
  );

  const merkleRoot = merkleTree.getHexRoot();

  const proof = digestList
    .filter((item) => item.ethscriptionId !== DEFAULT_ORDER.ethscriptionId)
    .map((item) => {
      const xxx = merkleTree.getPositionalHexProof(item.typeHash);
      console.log(item.typeHash, xxx);
      return xxx;
    });

  console.log('proof:', proof.length);
  console.log('proof:', proof, 'merkleRoot:', merkleRoot);
  // console.log('verify proof:', merkleTree.verify(proof[0], digestList[0].typeHash, merkleRoot));

  const height = getTreeHeight(digestList.length);

  const signTypeData = BatchOrderHash(chainId, marketAddress, order, height);
  // const digest = TypedDataUtils.encodeDigest(signTypeData);

  const signature = await signTypedData(signTypeData as any);

  return { signature, proof, merkleRoot, digestList };
};

export const signEthscriptionOrder = async ({
  singer,
  ethscription,
  sellPrice,
  chainId,
  quantity,
  expiration,
  orderNonceData,
}: {
  singer: ethers.providers.JsonRpcSigner;
  ethscription: GetEthscriptionsItem;
  sellPrice: string;
  chainId: number;
  quantity: string;
  expiration: string;
  orderNonceData: GetOrderNonceData;
}): Promise<boolean> => {
  if (!singer?.provider) throw Error('not singer');

  const address = await singer.getAddress();

  const order = {
    signer: address,
    creator: orderNonceData.creatorData.creatorAddress,
    quantity,
    ethscriptionId: ethscription.order.ethscriptionId,
    currency: ethscription.payment.address,
    price: sellPrice,
    nonce: orderNonceData.nonce,
    startTime: Number(orderNonceData.startTime),
    endTime: dayjs.unix(Number(orderNonceData.startTime)).add(Number(expiration), 'millisecond').unix(),
    protocolFeeDiscounted: orderNonceData.protocolData.protocolFeeBps,
    creatorFee: orderNonceData.creatorData.creatorFeeBps,
    params: '0x',
  };

  const orderSig = await SignatureWithOrder(chainId, orderNonceData.protocolData.protocolAddress, order);

  const requestOrder: ListingRequest['order'] = {
    ...order,
    chainName: ethscription.payment.chainName,
    orderHash: orderSig.digestHex,
    signature: orderSig.signature,
  };

  const listing = await services.marketplace.addListing({
    category: ethscription.order.category,
    collectionName: ethscription.order.collectionName,
    protocolAddress: orderNonceData.protocolData.protocolAddress,
    order: requestOrder,
  });

  if (listing?.code !== 200) return false;

  return true;
};

export const signEthscriptionOrderBulk = async ({
  singer,
  ethscription,
  chainId,
  expiration,
  orderNonceData,
}: {
  singer: ethers.providers.JsonRpcSigner;
  ethscription: IBulkEthscriptionsItem[];
  chainId: number;
  expiration: string;
  orderNonceData: GetOrderNonceData;
}): Promise<boolean> => {
  if (!singer?.provider) throw Error('not singer');

  const address = await singer.getAddress();

  const order = ethscription.map((item, index) => {
    return {
      signer: address,
      ethscriptionId: item.order.ethscriptionId,
      creator: orderNonceData.creatorData.creatorAddress,
      currency: item.payment.address,
      price: ethers.utils.parseUnits(item.order.price, item.payment.decimal).toString(),
      nonce: BigNumber(orderNonceData.nonce).plus(index).toString(),
      quantity: item.order.quantity,
      startTime: Number(orderNonceData.startTime),
      endTime: dayjs.unix(Number(orderNonceData.startTime)).add(Number(expiration), 'millisecond').unix(),
      protocolFeeDiscounted: orderNonceData.protocolData.protocolFeeBps,
      creatorFee: orderNonceData.creatorData.creatorFeeBps,
      params: '0x',
    };
  });

  const orderTree = fillArray(order, completedSize(getTreeHeight(order.length)), DEFAULT_ORDER);

  const orderSig = await SignatureWithOrderBulk(chainId, orderNonceData.protocolData.protocolAddress, orderTree);

  console.log('orderSig', orderSig);

  const requestOrder: ListingBulkRequest['orders'] = ethscription.map((item, index) => {
    return {
      ...item,
      chainName: item.payment.chainName,
      category: item.order.category,
      collectionName: item.order.collectionName,
      ethscriptionNumber: item.order.ethscriptionNumber,
      orderHash: orderSig.digestList.find((digestItem) => digestItem.ethscriptionId == item.order.ethscriptionId)
        ?.typeHash!,
      signer: address,
      ethscriptionId: item.order.ethscriptionId,
      creator: orderNonceData.creatorData.creatorAddress,
      currency: item.payment.address,
      price: ethers.utils.parseUnits(item.order.price, item.payment.decimal).toString(),
      nonce: BigNumber(orderNonceData.nonce).plus(index).toString(),
      quantity: item.order.quantity,
      startTime: Number(orderNonceData.startTime),
      endTime: dayjs.unix(Number(orderNonceData.startTime)).add(Number(expiration), 'millisecond').unix(),
      protocolFeeDiscounted: orderNonceData.protocolData.protocolFeeBps,
      creatorFee: orderNonceData.creatorData.creatorFeeBps,
      params: '0x',

      signature: orderSig.signature,
      merkleRoot: orderSig.merkleRoot,
      merkleProof: orderSig.proof[index].map((item) => ({
        position: String(item[0]),
        value: String(item[1]),
      })),

      trustedSignature: '',
      bundleIndex: '0',
      bundleItems: [],
    };
  });

  const listing = await services.marketplace.addListingBulk({
    protocolAddress: orderNonceData.protocolData.protocolAddress,
    orders: requestOrder,
  });

  if (listing?.code !== 200) return false;

  return true;
};

export const editSignEthscriptionOrder = async ({
  singer,
  ethscription,
  sellPrice,
  chainId,
  quantity,
  expiration,
  orderNonceData,
}: {
  singer: ethers.providers.JsonRpcSigner;
  ethscription: GetEthscriptionsItem;
  sellPrice: string;
  chainId: number;
  quantity: string;
  expiration: string;
  orderNonceData: GetOrderNonceData;
}): Promise<boolean> => {
  if (!singer?.provider) throw Error('not singer');

  const address = await singer.getAddress();

  const order = {
    signer: address,
    creator: orderNonceData.creatorData.creatorAddress,
    quantity,
    ethscriptionId: ethscription.order.ethscriptionId,
    currency: ethscription.payment.address,
    price: sellPrice,
    nonce: ethscription.order.nonce,
    startTime: Number(orderNonceData.startTime),
    endTime: dayjs.unix(Number(orderNonceData.startTime)).add(Number(expiration), 'millisecond').unix(),
    protocolFeeDiscounted: orderNonceData.protocolData.protocolFeeBps,
    creatorFee: orderNonceData.creatorData.creatorFeeBps,
    params: '0x',
  };

  const orderSig = await SignatureWithOrder(chainId, orderNonceData.protocolData.protocolAddress, order);

  const requestOrder: ListingRequest['order'] = {
    ...order,
    chainName: ethscription.payment.chainName,
    orderHash: orderSig.digestHex,
    signature: orderSig.signature,
  };

  const listing = await services.marketplace.editListing({
    category: ethscription.order.category,
    collectionName: ethscription.order.collectionName,
    protocolAddress: orderNonceData.protocolData.protocolAddress,
    order: requestOrder,
  });

  if (listing?.code !== 200) return false;

  return true;
};

export const buyEthscription = async ({
  singer,
  ethscription,
}: {
  singer: ethers.providers.JsonRpcSigner;
  ethscription: GetEthscriptionsItem;
}): Promise<ethers.ContractReceipt> => {
  const orderIdResponse = await services.marketplace.getOrderID(ethscription.order.orderId);

  if (orderIdResponse?.code !== 200) throw new Error('not orderId');

  const { signature, orderHash, chainName, merkleRoot, merkleProof, ethscriptionId, quantity, ...orderProps } =
    orderIdResponse.data.order;

  const order: BatchOrder.EthscriptionOrderStruct = {
    ...orderProps,
    ethscriptionIds: [ethscriptionId],
    quantities: [quantity],
    r: signature.slice(0, 66),
    s: '0x' + signature.slice(66, 130),
    v: parseInt(signature.slice(130, 132), 16),
  };

  const merkleTree: BatchOrder.MerkleTreeStruct = {
    root: merkleRoot.trim() == '' ? '0x0000000000000000000000000000000000000000000000000000000000000000' : merkleRoot,
    proof: merkleProof,
  };

  const contract = getEtchMarketContract(ethscription.order.protocolAddress, singer);
  const recipient = await singer.getAddress();

  const transactionResponse = await contract.executeOrderWithMerkle(order, merkleTree, recipient, {
    value: order.price,
  });

  const transaction = await transactionResponse.wait();

  return transaction;
};

export const cancelMultipleMakerOrders = async ({
  singer,
  ethscription,
}: {
  singer: ethers.providers.JsonRpcSigner;
  ethscription: GetEthscriptionsItem[];
}): Promise<ethers.ContractReceipt> => {
  if (ethscription.length <= 0) throw Error('ethscription no empty');

  const contract = getEtchMarketContract(ethscription[0].order.protocolAddress, singer);

  const nonces = ethscription.map((item) => item.order.nonce);
  const transactionResponse = await contract.cancelMultipleMakerOrders(nonces);

  const transaction = await transactionResponse.wait();

  return transaction;
};

export const transferEthscription = async ({
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

export const transferEthscriptionFacet = async ({
  singer,
  facetAddress,
  payload,
}: {
  singer: ethers.providers.JsonRpcSigner;
  facetAddress: string;
  payload: string;
}) => {
  const tx: ethers.utils.Deferrable<ethers.providers.TransactionRequest> = {
    to: facetAddress,
    data: stringToHex(`data:application/vnd.facet.tx+json;rule=esip6,${payload}`),
  };

  const transactionResponse = await singer.sendTransaction(tx);
  const transaction = await transactionResponse.wait();

  return transaction;
};

export const transferEthscriptionBulk = async ({
  singer,
  to,
  ethscription,
}: {
  singer: ethers.providers.JsonRpcSigner;
  to: string;
  ethscription: IBulkEthscriptionsItem[];
}) => {
  const tx: ethers.utils.Deferrable<ethers.providers.TransactionRequest> = {
    to,
    data:
      '0x' +
      ethscription
        .filter((item) => !item.order.isDeposit)
        .map((item) => item.order.ethscriptionId.slice(2))
        .join(''),
  };

  const transactionResponse = await singer.sendTransaction(tx);
  const transaction = await transactionResponse.wait();
  return transaction;
};

export const withdrawEthscription = async ({
  singer,
  ethscription,
}: {
  singer: ethers.providers.JsonRpcSigner;
  ethscription: GetEthscriptionsItem;
}): Promise<ethers.ContractReceipt> => {
  const withdrawResponse = await services.marketplace.getWithdraw(ethscription.order.ethscriptionId);

  if (withdrawResponse?.code !== 200) throw new Error('not withdrawResponse');

  const contract = getEtchMarketContract(ethscription.order.protocolAddress, singer);

  const { ethscriptionId, expiration, trustedSignature } = withdrawResponse.data;

  const transactionResponse = await contract.withdrawEthscription(ethscriptionId, expiration, trustedSignature);

  const transaction = await transactionResponse.wait();

  return transaction;
};

export const withdrawBulkEthscription = async ({
  singer,
  ethscriptions,
}: {
  singer: ethers.providers.JsonRpcSigner;
  ethscriptions: IBulkEthscriptionsItem[];
}): Promise<ethers.ContractReceipt> => {
  const ethIds = ethscriptions.map((item) => item.order.ethscriptionId);

  const withdrawResponse = await services.marketplace.getWithdrawBulk(ethIds);

  if (withdrawResponse?.code !== 200) throw new Error('not withdrawResponse');

  const contract = getEtchMarketContract(ethscriptions[0].order.protocolAddress, singer);

  const { ethscriptionIds, expiration, trustedSignature } = withdrawResponse.data;

  const transactionResponse = await contract.withdrawMultipleEthscriptions(
    ethscriptionIds,
    expiration,
    trustedSignature,
  );

  const transaction = await transactionResponse.wait();

  return transaction;
};

export const inscribeEthscription = async ({
  singer,
  data,
}: {
  singer: ethers.providers.JsonRpcSigner;
  data: string;
}) => {
  const address = await singer.getAddress();
  const tx = {
    from: address,
    to: address,
    data,
  };
  const transactionResponse = await singer.sendTransaction(tx);
  const transaction = await transactionResponse.wait();

  return transaction;
};

export const deployErc20 = async ({ singer, data }: { singer: ethers.providers.JsonRpcSigner; data: string }) => {
  const address = await singer.getAddress();
  const tx = {
    from: address,
    to: address,
    data,
  };
  const transactionResponse = await singer.sendTransaction(tx);
  const transaction = await transactionResponse.wait();

  return transaction;
};
