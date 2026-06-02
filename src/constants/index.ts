import { GetCollectionOwnerListItem, categoryType } from '@/services/marketpalce/types';
import { mainnet, goerli } from 'wagmi/chains';
import { invert } from 'lodash-es';

export const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';

export const DEFAULT_ORDER = {
  signer: ZERO_ADDRESS,
  creator: ZERO_ADDRESS,
  ethscriptionId: '0x0000000000000000000000000000000000000000000000000000000000000000',
  quantity: '0',
  currency: ZERO_ADDRESS,
  price: '0',
  nonce: '0',
  startTime: 0,
  endTime: 0,
  protocolFeeDiscounted: 0,
  creatorFee: 0,
  params: '0x',
};

interface IURL_CONFIG {
  [number: number]: {
    etherscription: string;
    etherScanUrl: string;
    collectionUrl: string;
  };
}

export const URL_CONFIG: IURL_CONFIG = {
  [goerli.id]: {
    etherscription: 'https://goerli.ethscriptions.com/',
    etherScanUrl: 'https://goerli.etherscan.io/',
    collectionUrl: 'https://goerli.etch.market/market/',
  },
  [mainnet.id]: {
    etherscription: 'https://ethscriptions.com',
    etherScanUrl: 'https://etherscan.io/',
    collectionUrl: 'https://www.etch.market/market',
  },
};

export const DEFAULT_COLLECTION_OWNNER_ITEM: GetCollectionOwnerListItem = {
  category: 'token',
  collectionName: 'erc-20 eths',
  isBlue: false,
  floorPrice: 0,
  verified: 2,
  verifiedAmt: 2000,
  unverified: 52,
  unverifiedAmt: 52000,
  totalQuantity: 54,
  totalAmt: 54000,
  value: 0,
  icon: '',
  iconContentType: '',
};

export type CategoryKeyType = 'Tokens' | 'Domains' | 'Collections';

export const CATEGORY_KEY_ENUM: { [key in categoryType]?: CategoryKeyType } = {
  token: 'Tokens',
  domain: 'Domains',
  nft: 'Collections',
};

export const CATEGORY_VALUE_ENUM = invert(CATEGORY_KEY_ENUM) as {
  [key in CategoryKeyType]: categoryType;
};

export const TOKEN_ICONS: { [key in string]: string } = {
  'erc-20 eths': 'https://etchmarket.s3.amazonaws.com/eths.png',
};

export const mimeTypeImagePre = 'image/';
