// ============================================================================
// 【MyAssets/index.tsx】我的资产全局汇总容器
// ----------------------------------------------------------------------------
// 作用：展示用户钱包地址内拥有的代币余额汇总列表（以太坊原生ETH，Facet的ERC20，L1的特定同质化铭文等）。
// 包含一个账户信息（总资产折合美元估计）板块与详细的表格清单。
// ============================================================================
import { Fragment, useEffect, useState } from 'react';
import AssetsInfo from './AssetsInfo';
import AssetList from './AssetList';
import { useAccount } from 'wagmi';
import { useImmer } from 'use-immer';
import services from '@/services';
import { AssetItem } from '@/services/ethscriptions/types';

const MyAssets = () => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { address } = useAccount();

  const [filterRequest, setFilterRequest] = useImmer<{ owner: string }>({
    owner: address as string,
  });

  const [assetList, setAssetList] = useState<AssetItem[]>();

  useEffect(() => {
    if (address) {
      setFilterRequest((state) => {
        state.owner = address;
      });
    }
  }, [address]);

  useEffect(() => {
    getErc20List();
  }, [filterRequest]);

  async function getErc20List() {
    if (isLoading) return;
    setAssetList([]);
    setIsLoading(true);
    const response = await services.ethscriptions.getAssetList(filterRequest);
    setAssetList(response);
    setIsLoading(false);
  }
  return (
    <Fragment>
      <AssetsInfo assetList={assetList ?? []} />
      <AssetList isLoading={isLoading} data={assetList ?? []} />
    </Fragment>
  );
};

export default MyAssets;
