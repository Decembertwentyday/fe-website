// ============================================================================
// 【EthscriptionCollectionOwner/Context.tsx】用户级别集合维度 Context
// ----------------------------------------------------------------------------
// 主要为子组件间传递用户的此项过滤请求 Request 及响应。
// ============================================================================
import {
  GetCollectionOwnerListData,
  GetCollectionOwnerListItem,
  GetCollectionOwnerListRequest,
} from '@/services/marketpalce/types';
import { createContext, useContext } from 'react';
import { Updater } from 'use-immer';

export interface IEthscriptionCollectionOwnerContext {
  onSelect: (val: GetCollectionOwnerListItem) => Promise<void>;
  collectionItem: GetCollectionOwnerListItem | null;
  setCollectionItem: (val: GetCollectionOwnerListItem) => void;
  collectionList: GetCollectionOwnerListData | null;
  isLoading: boolean;
  setFilterRequest: Updater<GetCollectionOwnerListRequest>;
}

export const EthscriptionCollectionOwnerContext = createContext<IEthscriptionCollectionOwnerContext>({
  onSelect: async () => {},
  collectionItem: null,
  setCollectionItem: () => {},
  collectionList: null,
  isLoading: false,
  setFilterRequest: () => {},
});

export const useEthscriptionCollectionOwnerContext = () => useContext(EthscriptionCollectionOwnerContext);
