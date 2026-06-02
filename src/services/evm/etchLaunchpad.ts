// ============================================================================
// 【services/evm/etchLaunchpad.ts】Launchpad 发射台合约交互
// ----------------------------------------------------------------------------
// 作用：负责用户参与全新项目的盲盒/公开铸造 (Mint)。
// 包含了获取该发射台合约中阶段进度的信息（比如公售/白名单铸造阶段、价格、限制多少）。
// 也包含了进行真正 mint/buy 发起调用的具体逻辑及其 MerkleTree 白名单验证。
// ============================================================================
import { ethers } from 'ethers';
import { getEtchLaunchpadContract } from './contracts';
import dayjs from 'dayjs';
import BigNumber from 'bignumber.js';
import MerkleTree from 'merkletreejs';

import { GetLaunchpadInfoData as GetLaunchpadInfoDataTemp, GetLaunchpadItem } from '@/services/launchpad/types';

export type GetLaunchpadInfoData = {
  current_index: string;
  MaxAvailable: string;
  publicMintStartAfter: string;
  whitelistMintStartAfter: string;
  publicMintPrice: string;
  whitelistMintPrice: string;
  publicMaxMintPerAddress: string;
  whitelistMaxMintPerAddress: string;
  publicMinted: string;
  whitelistMinted: string;
  isWhitelistMintOpen: boolean;
  isPublicMintOpen: boolean;
  whitelistMaxAvailable: number;
  publicMaxAvailable: number;
  isOpen: boolean;
};

export const getLaunchpadInfo = async ({
  singer,
  launchpadItem,
}: {
  singer: ethers.providers.JsonRpcSigner;
  launchpadItem: GetLaunchpadItem;
}): Promise<GetLaunchpadInfoData> => {
  const contract = getEtchLaunchpadContract(launchpadItem.launchpadContract, singer);
  const address = await singer.getAddress();

  // const [current_index, MaxAvailable] = await Promise.all([
  //   await contract.functions.current_index(), // 当前mint的总数量
  //   1000, // await contract.functions.MaxAvailable(), // 最多可以mint的总数量
  // ]);

  // const [publicMintPrice, publicMaxMintPerAddress, publicMinted, publicMintStartAfter] = await Promise.all([
  //   '80000000000000000', // await contract.functions.publicMintPrice(), // 公开的mint价格
  //   5, // await contract.functions.publicMaxMintPerAddress(), // 公开的mint数量
  //   await contract.functions.publicMinted(address), // 某个钱包地址 公开的mint数量
  //   '1690459200', // await contract.functions.publicMintStartAfter(), // 公开的mint时间
  // ]);

  // const [whitelistMintPrice, whitelistMaxMintPerAddress, whitelistMinted, whitelistMintStartAfter] = await Promise.all([
  //   0, // await contract.functions.whitelistMintPrice(), // 白名单的mint价格
  //   1, // await contract.functions.whitelistMaxMintPerAddress(), // 白名单的mint数量
  //   await contract.functions.whitelistMinted(address), // 某个钱包地址 白名单的mint数量
  //   '1690459200', // await contract.functions.whitelistMintStartAfter(), // 白名单的mint时间
  // ]);

  const [current_index, MaxAvailable] = await Promise.all([
    await contract.functions.current_index(), // 当前mint的总数量
    await contract.functions.MaxAvailable(), // 最多可以mint的总数量
  ]);

  const [publicMintPrice, publicMaxMintPerAddress, publicMinted, publicMintStartAfter] = await Promise.all([
    await contract.functions.publicMintPrice(), // 公开的mint价格
    await contract.functions.publicMaxMintPerAddress(), // 公开的mint数量
    await contract.functions.publicMinted(address), // 某个钱包地址 公开的mint数量
    await contract.functions.publicMintStartAfter(), // 公开的mint时间
  ]);

  const [whitelistMintPrice, whitelistMaxMintPerAddress, whitelistMinted, whitelistMintStartAfter] = await Promise.all([
    await contract.functions.whitelistMintPrice(), // 白名单的mint价格
    await contract.functions.whitelistMaxMintPerAddress(), // 白名单的mint数量
    await contract.functions.whitelistMinted(address), // 某个钱包地址 白名单的mint数量
    await contract.functions.whitelistMintStartAfter(), // 白名单的mint时间
  ]);

  return {
    current_index: current_index.toString(),
    MaxAvailable: MaxAvailable.toString(),
    publicMintStartAfter: publicMintStartAfter.toString(),
    whitelistMintStartAfter: whitelistMintStartAfter.toString(),
    publicMintPrice: publicMintPrice.toString(),
    whitelistMintPrice: whitelistMintPrice.toString(),
    publicMaxMintPerAddress: publicMaxMintPerAddress.toString(),
    whitelistMaxMintPerAddress: whitelistMaxMintPerAddress.toString(),
    publicMinted: publicMinted.toString(),
    whitelistMinted: whitelistMinted.toString(),
    isWhitelistMintOpen: dayjs.unix(Number(whitelistMintStartAfter)).isBefore(dayjs()),
    isPublicMintOpen: dayjs.unix(Number(publicMintStartAfter)).isBefore(dayjs()),
    whitelistMaxAvailable: BigNumber(whitelistMaxMintPerAddress.toString())
      .minus(whitelistMinted.toString())
      .toNumber(),
    publicMaxAvailable: BigNumber(publicMaxMintPerAddress.toString()).minus(publicMinted.toString()).toNumber(),
    isOpen: BigNumber(current_index.toString()).lt(MaxAvailable.toString()),
  };
};

export const publicMint = async ({
  singer,
  launchpadInfo,
  launchpadItem,
  amount,
}: {
  singer: ethers.providers.JsonRpcSigner;
  launchpadInfo: GetLaunchpadInfoData;
  launchpadItem: GetLaunchpadItem;
  amount: number;
}) => {
  const contract = getEtchLaunchpadContract(launchpadItem.launchpadContract, singer);

  const tx = await contract.publicMint(amount, {
    value: BigNumber(launchpadInfo.publicMintPrice).multipliedBy(amount).toString(),
  });
  return await tx.wait();
};

export const whitelistMint = async ({
  singer,
  amount,
  launchpadItem,
  launchpadInfo,
}: {
  singer: ethers.providers.JsonRpcSigner;
  amount: number;
  launchpadItem: GetLaunchpadInfoDataTemp;
  launchpadInfo: GetLaunchpadInfoData;
}) => {
  const contract = getEtchLaunchpadContract(launchpadItem.project.launchpadContract, singer);
  const address = await singer.getAddress();

  const merkleTree = new MerkleTree(launchpadItem.whitelist, ethers.utils.keccak256, {
    hashLeaves: true,
    sortPairs: true,
  });

  const leaf = ethers.utils.keccak256(address);
  const proof = merkleTree.getHexProof(leaf);

  const tx = await contract.whitelistMint(amount, proof, {
    value: BigNumber(launchpadInfo.publicMintPrice).multipliedBy(amount).toString(),
  });
  return await tx.wait();
};
