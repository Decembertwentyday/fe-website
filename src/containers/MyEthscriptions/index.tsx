// ============================================================================
// 【MyEthscriptions/index.tsx】我的铭文容器组件（资产页核心）
// ----------------------------------------------------------------------------
// 作用：展示用户当前钱包地址下拥有的所有铭文（资产列表）
// 特点：
//   1. 使用 InfiniteScroll（无限滚动）加载数据
//   2. 支持过滤：按系列（Collection）、按状态（在售/未售）、按类型（Token/NFT/Domain）
//   3. 支持批量操作模式（BulkListingStore）- 如果开启，点击铭文卡片即为选中，而不是查看详情
//   4. 包含拆分操作（ConfirmSplit）、刷新余额、搜索 tokenId 等功能
// ============================================================================

'use client';

import { useState, useEffect, Fragment, useRef } from 'react';
import { Box, Button, IconButton, InputAdornment, InputBase, Typography, useMediaQuery } from '@mui/material';
import BigNumber from 'bignumber.js';
import { useImmer } from 'use-immer';
import { useAccount } from 'wagmi';
import { useSnapshot } from 'valtio';
import InfiniteScroll from 'react-infinite-scroll-component';

import services from '@/services';
import EthscriptionBox from '@/containers/EthscriptionBox';
import EthscriptionBoxFooter from './EthscriptionBoxFooter';
import * as EthscriptionsStore from '@/stores/EthscriptionsStore';
import * as BulkListingStore from '@/stores/BulkListingStore';
import {
  GetCollectionOwnerListItem,
  GetEthscriptionsItem,
  GetMyEthscriptionsRequest,
} from '@/services/marketpalce/types';
import FilterSelect from '@/components/FilterSelect';
import EthscriptionCollectionOwner from '../EthscriptionCollectionOwner';
import NotWalletConnect from '@/components/NotWalletConnect';
import { DEFAULT_COLLECTION_OWNNER_ITEM } from '@/constants';
import FilterSelectDomainCategory from '../FilterSelectDomainCategory';
import { GetVaultBalanceData } from '@/services/vault/types';
import ConfirmSplit from './ConfirmSplit';
import RefreshSVG from '@/assets/icons/refresh.svg';
import { IEthscriptionsStore } from '@/stores/EthscriptionsStore';
import { NumericFormat } from 'react-number-format';

const PAGE_START_INIT = 50;

const MyEthscriptions = () => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { address } = useAccount();
  const bulkListingStore = useSnapshot(BulkListingStore.store);
  const ethscriptionsStore = useSnapshot(EthscriptionsStore.store) as IEthscriptionsStore;
  const [collectionItem, setCollectionItem] = useState<GetCollectionOwnerListItem>(DEFAULT_COLLECTION_OWNNER_ITEM);
  const [vaultBalanceData, setVaultBalanceData] = useState<GetVaultBalanceData>();
  const sweepRef = useRef<HTMLInputElement>();

  const matches = useMediaQuery('(min-width:750px)');

  const [filterRequest, setFilterRequest] = useImmer<GetMyEthscriptionsRequest>({
    owner: address as string,
    collection: '',
    show: 'AllEthscription',
    category: 'token',
    trait: '',
    'page.size': PAGE_START_INIT,
    'page.index': 1,
  });

  async function getMyEthscriptions() {
    if (isLoading) return;

    if (filterRequest['page.index'] == 1) {
      EthscriptionsStore.setOwnerList({
        ...ethscriptionsStore.ownerList,
        ethscriptions: [],
      });
    }
    setIsLoading(true);

    const response = await services.marketplace.getMyEthscriptions(filterRequest);

    if (response?.code === 200) {
      if (filterRequest['page.index'] === 1) {
        EthscriptionsStore.setOwnerList(response.data);
      } else {
        EthscriptionsStore.setOwnerList({
          ethscriptions: ethscriptionsStore.ownerList.ethscriptions.concat(response.data.ethscriptions),
          page: response.data.page,
        });
      }

      if (bulkListingStore.selectAll) {
        response.data.ethscriptions.forEach((item) => {
          BulkListingStore.addEthscription({ ...item, floorPrice: '', protocol: '0', royalty: '0' });
        });
      }
    }
    setIsLoading(false);
  }

  useEffect(() => {
    setFilterRequest((state) => {
      state.owner = address as string;
      state['page.index'] = 1;
    });
  }, [address]);

  useEffect(() => {
    if (filterRequest.collection.trim() != '') {
      getMyEthscriptions();
    }
  }, [filterRequest]);

  async function getVaultBalance() {
    if (address) {
      setVaultBalanceData(undefined);
      const response = await services.vault.getVaultBalance({
        address,
        collection: collectionItem.collectionName,
      });

      if (response?.code !== 200) return false;

      setVaultBalanceData(response.data);
    }
  }

  async function getOrderNonce() {
    const response = await services.marketplace.getOrderNonce({
      address: address as string,
      category: collectionItem.category,
      collection: collectionItem.collectionName,
    });

    if (response?.code !== 200) return false;

    BulkListingStore.setOrderNonceData(response.data);
  }

  async function getEthprice() {
    const response = await services.marketplace.getEthPrice();

    if (response?.code !== 200) return false;

    BulkListingStore.setEthPriceData(response.data);
  }

  useEffect(() => {
    getVaultBalance();
  }, [address]);

  useEffect(() => {
    if (collectionItem.category == 'token') {
      getVaultBalance();
    }
  }, [collectionItem.collectionName]);

  useEffect(() => {
    if (address && collectionItem.category && collectionItem.collectionName) {
      getEthprice();
      getOrderNonce();
      BulkListingStore.clearAllEthsciption();
    }
  }, [collectionItem, address]);

  async function handleOnChangeEthscription(
    op: 'update' | 'remove',
    action: string,
    ethscriptionItem: GetEthscriptionsItem,
  ) {
    await getMyEthscriptions();

    // if (['listing', 'edit-listing'].includes(action)) {
    //   await getMyEthscriptions();
    //   console.log(11111);
    //   return;
    // }
    // if (op == 'update') {
    //   const _ethscriptions = list.ethscriptions.map((item) => {
    //     if (
    //       item.order.ethscriptionId == ethscriptionItem.order.ethscriptionId &&
    //       item.order.category == ethscriptionItem.order.category &&
    //       item.order.collectionName == ethscriptionItem.order.collectionName &&
    //       item.order.ethscriptionNumber == ethscriptionItem.order.ethscriptionNumber
    //     ) {
    //       return ethscriptionItem;
    //     } else {
    //       return item;
    //     }
    //   });
    //   setList({ ...list, ethscriptions: _ethscriptions });
    //   return;
    // }
    // if (op == 'remove') {
    //   const _ethscriptions = list.ethscriptions.filter((item) => {
    //     if (
    //       item.order.ethscriptionId == ethscriptionItem.order.ethscriptionId &&
    //       item.order.category == ethscriptionItem.order.category &&
    //       item.order.collectionName == ethscriptionItem.order.collectionName &&
    //       item.order.ethscriptionNumber == ethscriptionItem.order.ethscriptionNumber
    //     ) {
    //       return false;
    //     } else {
    //       return true;
    //     }
    //   });
    //   setList({ ...list, ethscriptions: _ethscriptions });
    //   return;
    // }
  }

  const isHasMore = Number(ethscriptionsStore.ownerList.page.total) > ethscriptionsStore.ownerList.ethscriptions.length;

  return address ? (
    <Box>
      <Box
        sx={{
          display: 'flex',
          gap: '24px',
          alignItems: 'center',
          mb: matches ? '35px' : '20px',
          overflowX: matches ? 'unset' : 'scroll',
        }}
      >
        <EthscriptionCollectionOwner
          category="token"
          address={address || ''}
          value={collectionItem}
          onSelect={async (item) => {
            setCollectionItem(item);
            setFilterRequest((state) => {
              state.category = 'token';
              state.collection = item.collectionName;
              state['page.index'] = 1;
            });
          }}
        />

        <EthscriptionCollectionOwner
          category="domain"
          address={address || ''}
          value={collectionItem}
          onSelect={async (item) => {
            setCollectionItem(item);
            setFilterRequest((state) => {
              state.category = 'domain';
              state.collection = item.collectionName;
              state['page.index'] = 1;
            });
          }}
        />

        <EthscriptionCollectionOwner
          category="nft"
          address={address || ''}
          value={collectionItem}
          onSelect={async (item) => {
            setCollectionItem(item);
            setFilterRequest((state) => {
              state.category = 'nft';
              state.collection = item.collectionName;
              state['page.index'] = 1;
            });
          }}
        />
      </Box>

      <Box
        sx={{
          width: '100%',
          borderBottom: '1px solid rgba(255, 255, 255, 0.10)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          pb: '12px',
          boxSizing: 'border-box',
          mb: '24px',
        }}
      >
        {/* {collectionItem.category == 'token' && (
          <Fragment>
            <Box
              sx={{
                display: 'flex',
                flexDirection: matches ? 'row' : 'column',
                alignItems: matches ? 'center' : 'flex-start',
                justifyContent: 'center',
                gap: '20px',
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Typography sx={{ fontWeight: 500, color: 'rgba(255,255,255,0.65)' }}>Available balance:</Typography>
                <Typography sx={{ color: '#E5FF65', fontWeight: 500 }}>
                  {`${vaultBalanceData?.balances?.available ?? '--'} ${collectionItem.collectionName.split(' ')[1]}`}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Typography sx={{ fontWeight: 500, color: 'rgba(255,255,255,0.65)' }}>Transferable balance:</Typography>
                <Typography sx={{ color: '#E5FF65', fontWeight: 500 }}>
                  {`${vaultBalanceData?.balances?.transferable ?? '--'} ${collectionItem.collectionName.split(' ')[1]}`}
                </Typography>
              </Box>
            </Box>
            <ConfirmSplit
              disabled={new BigNumber(vaultBalanceData?.balances.available || 0).lte(0)}
              collection={collectionItem.collectionName}
              onChange={() => {
                getMyEthscriptions();
                getVaultBalance();
              }}
            />
          </Fragment>
        )} */}
      </Box>

      <Box sx={{ mb: '24px' }}>
        <Box
          sx={{
            mb: matches ? '0' : '12px',
            display: 'flex',
            alignItems: matches ? 'center' : 'flex-start',
            justifyContent: 'space-between',
          }}
        >
          <Box sx={{ gap: '8px', display: 'flex', alignItems: 'center' }}>
            <Typography fontSize="14px">{`Result: ${ethscriptionsStore.ownerList.page.total}`}</Typography>
            <IconButton
              onClick={async () => {
                getVaultBalance();
                if (filterRequest['page.index'] == 1) {
                  getMyEthscriptions();
                } else {
                  setFilterRequest((state) => {
                    state['page.index'] = 1;
                  });
                }
              }}
            >
              <RefreshSVG />
            </IconButton>
            {matches && (
              <NumericFormat
                fullWidth
                inputRef={sweepRef}
                placeholder="0-200"
                customInput={InputBase}
                allowNegative={false}
                decimalScale={0}
                endAdornment={
                  <InputAdornment position="end" sx={{ color: 'rgba(255, 255, 255, 1)', pr: '4px' }}>
                    Items
                    <Button
                      sx={{
                        width: '80px',
                        height: '28px',
                        borderRadius: '46px',
                        bgcolor: 'rgba(229, 255, 101, 1)',
                        color: '#171A1F',
                        fontSize: '14px',
                        textTransform: 'none',
                        ml: '16px',
                        '&:hover': {
                          bgcolor: 'rgba(229, 255, 101, 0.7)',
                        },
                      }}
                      onClick={() => {
                        if (
                          BigNumber(sweepRef.current?.value || 0).isNaN() ||
                          BigNumber(sweepRef.current?.value || 0).lte(0)
                        ) {
                          BulkListingStore.clearAllEthsciption();
                          return;
                        }

                        if (BigNumber(sweepRef.current?.value || 0).gt(200)) {
                          return;
                        }

                        BulkListingStore.clearAllEthsciption();
                        ethscriptionsStore.ownerList.ethscriptions
                          .slice(0, Number(sweepRef.current?.value))
                          .forEach((item) => {
                            BulkListingStore.toggleEthscriptionToCart({
                              ...item,
                              floorPrice: '',
                              protocol: '0',
                              royalty: '0',
                            });
                          });
                      }}
                    >
                      Apply
                    </Button>
                  </InputAdornment>
                }
                startAdornment={
                  <InputAdornment
                    position="start"
                    sx={{ color: 'rgba(255, 255, 255, 1)', paddingLeft: '8px', fontSize: '14px' }}
                  >
                    Select
                  </InputAdornment>
                }
                sx={{
                  maxWidth: '350px',
                  height: '36px',
                  fontSize: '14px',
                  bgcolor: 'rgba(32, 34, 41, 1)',
                  border: '1px solid rgba(255, 255, 255, 0.20)',
                  borderRadius: '34px',
                  '& input': {
                    textAlign: 'right',
                  },
                }}
              />
            )}
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: '40px' }}>
            {collectionItem.category == 'domain' && (
              <FilterSelectDomainCategory
                owner={address}
                namespace={filterRequest.collection}
                onSelect={(item) => {
                  setFilterRequest((state) => {
                    state.trait = item.category;
                    state['page.index'] = 1;
                  });
                }}
              />
            )}
            <FilterSelect
              selectList={[
                {
                  label: 'Show All',
                  value: 'AllEthscription',
                },
                {
                  label: 'On Sale',
                  value: 'OnSale',
                },
                {
                  label: 'Not OnSale',
                  value: 'NotOnSale',
                },
              ]}
              onSelect={(item) => {
                setFilterRequest((state) => {
                  state.show = item.value as GetMyEthscriptionsRequest['show'];
                  state['page.index'] = 1;
                });
              }}
            />
          </Box>
        </Box>
        {!matches && (
          <NumericFormat
            fullWidth
            inputRef={sweepRef}
            placeholder="0-200"
            customInput={InputBase}
            allowNegative={false}
            decimalScale={0}
            endAdornment={
              <InputAdornment position="end" sx={{ color: 'rgba(255, 255, 255, 1)', pr: '4px' }}>
                Items
                <Button
                  sx={{
                    width: '80px',
                    height: '28px',
                    borderRadius: '46px',
                    bgcolor: 'rgba(229, 255, 101, 1)',
                    color: '#171A1F',
                    fontSize: '14px',
                    textTransform: 'none',
                    ml: '16px',
                    '&:hover': {
                      bgcolor: 'rgba(229, 255, 101, 0.7)',
                    },
                  }}
                  onClick={() => {
                    if (
                      BigNumber(sweepRef.current?.value || 0).isNaN() ||
                      BigNumber(sweepRef.current?.value || 0).lte(0)
                    ) {
                      BulkListingStore.clearAllEthsciption();
                      return;
                    }

                    if (BigNumber(sweepRef.current?.value || 0).gt(200)) {
                      return;
                    }

                    BulkListingStore.clearAllEthsciption();
                    ethscriptionsStore.ownerList.ethscriptions
                      .slice(0, Number(sweepRef.current?.value))
                      .forEach((item) => {
                        BulkListingStore.toggleEthscriptionToCart({
                          ...item,
                          floorPrice: '',
                          protocol: '0',
                          royalty: '0',
                        });
                      });
                  }}
                >
                  Apply
                </Button>
              </InputAdornment>
            }
            startAdornment={
              <InputAdornment
                position="start"
                sx={{ color: 'rgba(255, 255, 255, 1)', paddingLeft: '8px', fontSize: '14px' }}
              >
                Select
              </InputAdornment>
            }
            sx={{
              width: '100%',
              height: '36px',
              fontSize: '14px',
              bgcolor: 'rgba(32, 34, 41, 1)',
              border: '1px solid rgba(255, 255, 255, 0.20)',
              borderRadius: '34px',
              '& input': {
                textAlign: 'right',
              },
            }}
          />
        )}
      </Box>

      <InfiniteScroll
        style={{ marginBottom: '80px' }}
        dataLength={ethscriptionsStore.ownerList.ethscriptions.length}
        next={() => {
          setFilterRequest((state) => {
            state['page.index'] = state['page.index'] + 1;
          });
        }}
        hasMore={isHasMore}
        loader={<Box sx={{ textAlign: 'center', padding: '40px 0', fontWeight: 500 }}>Loading...</Box>}
        endMessage={
          <Box sx={{ textAlign: 'center', padding: '40px 0', fontWeight: 500 }}> Yay! You have seen it all</Box>
        }
      >
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(209px, 1fr))',
            justifyContent: 'space-between',
            gridGap: '24px',
          }}
        >
          {ethscriptionsStore.ownerList.ethscriptions.map((item, index) => {
            return (
              <EthscriptionBox
                isMyEtchScription
                ethscription={item}
                onChange={handleOnChangeEthscription}
                key={Symbol(`${item.order.ethscriptionNumber}${index}`).toString()}
                footer={<EthscriptionBoxFooter />}
              />
            );
          })}
        </Box>
      </InfiniteScroll>
    </Box>
  ) : (
    <Box sx={{ display: 'flex', justifyContent: 'center', pt: '180px' }}>
      <NotWalletConnect />
    </Box>
  );
};

export default MyEthscriptions;
