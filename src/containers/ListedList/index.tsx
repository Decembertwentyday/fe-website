// ============================================================================
// 【ListedList/index.tsx】市场已挂单铭文列表容器
// ----------------------------------------------------------------------------
// 作用：负责承载和展示某个交易集合（或按类别）中的所有目前在售物品。
// 逻辑流程：
// 1. 无限下拉滚动（react-infinite-scroll-component）动态加载。
// 2. 具备价格区间、属性、排序过滤器，变动后重新拉取首屏。
// 3. 将单张数据赋予 EthscriptionBox 并提供挂单所需底部操作栏 (ConfirmBuy, Cart)。
// ============================================================================

'use client';

import { useState, useEffect, useRef, Fragment } from 'react';
import { Box, Button, IconButton, InputAdornment, InputBase, Typography, useMediaQuery } from '@mui/material';
import { useImmer } from 'use-immer';
import InfiniteScroll from 'react-infinite-scroll-component';
import { useSearchParams } from 'next/navigation';

import services from '@/services';
import EthscriptionBox from '@/containers/EthscriptionBox';
import EthscriptionBoxFooter from './EthscriptionBoxFooter';
import { GetEthscriptionsItem, GetMarketListedRequest, categoryType } from '@/services/marketpalce/types';
import FilterSelect from '@/components/FilterSelect';
import RefreshSVG from '@/assets/icons/refresh.svg';
import FilterSelectDomainCategory from '../FilterSelectDomainCategory';
import SearchInput from '@/components/SearchInput';
import * as EthscriptionsStore from '@/stores/EthscriptionsStore';
import * as CartStore from '@/stores/CartStore';
import FilterSVG from '@/assets/icons/h5_filter.svg';
import { useSnapshot } from 'valtio';
import FilterSelectNftCategory from '../FilterSelectNftCategory';
import BigNumber from 'bignumber.js';
import { NumericFormat } from 'react-number-format';

const PAGE_START_INIT = 50;

interface IListedList {
  category: categoryType;
}

const ListedList: React.FC<IListedList> = ({ category }) => {
  const searchParams = useSearchParams();
  const ethscriptionsStore = useSnapshot(EthscriptionsStore.store);
  const collectionName = searchParams?.get('collectionName')?.toString().trim() ?? '';
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const matches = useMediaQuery('(min-width:750px)');
  const sweepRef = useRef<HTMLInputElement>();

  const [filterRequest, setFilterRequest] = useImmer<GetMarketListedRequest>({
    category,
    collection: collectionName,
    show: 'OnlyBuyNow', // 'ShowAll',
    sortBy: 'PriceAsc',
    trait: '',
    searchBy: '',
    'page.size': PAGE_START_INIT,
    'page.index': 1,
  });

  async function getMarketList() {
    if (isLoading) return;

    if (filterRequest['page.index'] == 1) {
      EthscriptionsStore.setListedList({
        ...ethscriptionsStore.listedList,
        ethscriptions: [],
      });
    }
    setIsLoading(true);

    const response = await services.marketplace.getMarketList(filterRequest);

    if (response?.code === 200) {
      if (filterRequest['page.index'] === 1) {
        EthscriptionsStore.setListedList(response.data);
      } else {
        EthscriptionsStore.setListedList({
          ethscriptions: ethscriptionsStore.listedList.ethscriptions.concat(response.data.ethscriptions),
          page: response.data.page,
        });
      }
    }

    setIsLoading(false);
  }

  async function handleOnChangeEthscription(
    op: 'update' | 'remove',
    action: string,
    ethscriptionItem: GetEthscriptionsItem,
  ) {
    if (op == 'update') {
      const _ethscriptions = ethscriptionsStore.listedList.ethscriptions.map((item) => {
        if (
          item.order.ethscriptionId == ethscriptionItem.order.ethscriptionId &&
          item.order.category == ethscriptionItem.order.category &&
          item.order.collectionName == ethscriptionItem.order.collectionName
        ) {
          return ethscriptionItem;
        } else {
          return item;
        }
      });
      EthscriptionsStore.setListedList({
        ...ethscriptionsStore.listedList,
        ethscriptions: _ethscriptions,
      });
      // setList({ ...list, ethscriptions: _ethscriptions });
      return;
    }
    if (op == 'remove') {
      const _ethscriptions = ethscriptionsStore.listedList.ethscriptions.filter((item) => {
        if (
          item.order.ethscriptionId == ethscriptionItem.order.ethscriptionId &&
          item.order.category == ethscriptionItem.order.category &&
          item.order.collectionName == ethscriptionItem.order.collectionName
        ) {
          return false;
        } else {
          return true;
        }
      });
      EthscriptionsStore.setListedList({
        ...ethscriptionsStore.listedList,
        ethscriptions: _ethscriptions,
      });
      // setList({ ...list, ethscriptions: _ethscriptions });
      return;
    }
  }

  useEffect(() => {
    if (filterRequest.collection != '') {
      getMarketList();
    }
  }, [filterRequest]);

  useEffect(() => {
    setFilterRequest((state) => {
      state.collection = collectionName;
    });
  }, [collectionName]);

  const isHasMore =
    Number(ethscriptionsStore.listedList.page.total) > ethscriptionsStore.listedList.ethscriptions.length;

  return (
    <Box>
      <Box
        sx={{
          mb: '16px',
          gap: matches ? '24px' : '12px',
          display: 'flex',
          justifyContent: 'space-between',
          flexWrap: matches ? 'nowrap' : 'wrap',
        }}
      >
        <Box sx={{ gap: '8px', display: 'flex', alignItems: 'center' }}>
          <Typography
            sx={{ fontSize: '14px', width: 'max-content' }}
          >{`Result: ${ethscriptionsStore.listedList.page.total}`}</Typography>
          <IconButton
            onClick={() => {
              if (filterRequest['page.index'] == 1) {
                getMarketList();
              } else {
                setFilterRequest((state) => {
                  state['page.index'] = 1;
                });
              }
            }}
          >
            <RefreshSVG />
          </IconButton>
        </Box>

        <Box
          sx={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            gap: matches ? '40px' : '15px',
            flexWrap: matches ? 'nowrap' : 'wrap',
            justifyContent: matches ? 'flex-end' : 'space-between',
          }}
        >
          {matches && (
            <Fragment>
              <NumericFormat
                inputRef={sweepRef}
                placeholder="0-50"
                customInput={InputBase}
                allowNegative={false}
                decimalScale={0}
                isAllowed={(values) => {
                  return BigNumber(values.value || 0).lte(50);
                }}
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
                          CartStore.clearAllEthsciption();
                          return;
                        }

                        CartStore.clearAllEthsciption();
                        ethscriptionsStore.listedList.ethscriptions
                          .slice(0, Number(sweepRef.current?.value))
                          .forEach((item) => {
                            CartStore.toggleEthscriptionToCart(item.order.orderId);
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
                    Sweep
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
              <SearchInput
                sx={{
                  p: '2px 4px',
                  display: 'flex',
                  alignItems: 'center',
                  width: 210,
                  height: 36,
                  borderRadius: '6px',
                  border: '1px solid #2F343E',
                  backgroundColor: 'transparent',
                }}
                placeholder={category == 'domain' ? 'Search by name' : 'Search by item id'}
                onClear={() => {
                  setFilterRequest((state) => {
                    state.searchBy = '';
                    state['page.index'] = 1;
                  });
                }}
                onClick={(value) => {
                  setFilterRequest((state) => {
                    state.searchBy = value as string;
                    state['page.index'] = 1;
                  });
                }}
                onEnter={(value) => {
                  setFilterRequest((state) => {
                    state.searchBy = value as string;
                    state['page.index'] = 1;
                  });
                }}
              />
            </Fragment>
          )}

          {category == 'domain' && (
            <FilterSelectDomainCategory
              namespace={filterRequest.collection}
              onSelect={(item) => {
                setFilterRequest((state) => {
                  state.trait = item.category;
                  state['page.index'] = 1;
                });
              }}
            />
          )}
          {category === 'nft' && collectionName === 'Ethereum Punks' && (
            <FilterSelectNftCategory
              onSelect={(item) => {
                setFilterRequest((state) => {
                  state.trait = item.category;
                  state['page.index'] = 1;
                });
              }}
            />
          )}
          <FilterSelect
            defaultValue={{
              label: 'Only Buy Now',
              value: 'OnlyBuyNow',
            }}
            selectList={[
              {
                label: 'Show All',
                value: 'ShowAll',
              },
              {
                label: 'Only Buy Now',
                value: 'OnlyBuyNow',
              },
            ]}
            onSelect={(item) => {
              setFilterRequest((state) => {
                state.show = item.value as GetMarketListedRequest['show'];
                state['page.index'] = 1;
              });
            }}
          />
          <FilterSelect
            selectList={[
              {
                label: 'Price: From Low to High',
                value: 'PriceAsc',
              },
              {
                label: 'Price: From High to Low',
                value: 'PriceDesc',
              },
              {
                label: 'Time: From Latest to Earliest',
                value: 'TimeDesc',
              },
              {
                label: 'Time: From Earliest to Latest',
                value: 'TimeAsc',
              },
            ]}
            onSelect={(item) => {
              setFilterRequest((state) => {
                state.sortBy = item.value as GetMarketListedRequest['sortBy'];
                state['page.index'] = 1;
              });
            }}
          />
        </Box>

        {!matches && (
          <Fragment>
            <SearchInput
              sx={{
                p: '2px 4px',
                display: 'flex',
                alignItems: 'center',
                width: '100%',
                height: 36,
                borderRadius: '6px',
                border: '1px solid #2F343E',
                backgroundColor: 'transparent',
              }}
              placeholder={category == 'domain' ? 'Search by name' : 'Search by item id'}
              onClear={() => {
                setFilterRequest((state) => {
                  state.searchBy = '';
                  state['page.index'] = 1;
                });
              }}
              onClick={(value) => {
                setFilterRequest((state) => {
                  state.searchBy = value as string;
                  state['page.index'] = 1;
                });
              }}
              onEnter={(value) => {
                setFilterRequest((state) => {
                  state.searchBy = value as string;
                  state['page.index'] = 1;
                });
              }}
            />
            <NumericFormat
              inputRef={sweepRef}
              placeholder="0-50"
              customInput={InputBase}
              allowNegative={false}
              decimalScale={0}
              isAllowed={(values) => {
                return BigNumber(values.value || 0).lte(50);
              }}
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
                        CartStore.clearAllEthsciption();
                        return;
                      }

                      CartStore.clearAllEthsciption();
                      ethscriptionsStore.listedList.ethscriptions
                        .slice(0, Number(sweepRef.current?.value))
                        .forEach((item) => {
                          CartStore.toggleEthscriptionToCart(item.order.orderId);
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
                  Sweep
                </InputAdornment>
              }
              sx={{
                p: '2px 4px',
                display: 'flex',
                alignItems: 'center',
                width: '100%',
                height: '36px',
                borderRadius: '6px',
                border: '1px solid #2F343E',
                backgroundColor: 'transparent',
                ':focus-within': {
                  border: '1px solid #E5FF65',
                },

                // width: '100%',
                // height: '36px',
                // fontSize: '14px',
                // bgcolor: 'rgba(32, 34, 41, 1)',
                // border: '1px solid rgba(255, 255, 255, 0.20)',
                // borderRadius: '34px',
                '& input': {
                  textAlign: 'right',
                },
              }}
            />
          </Fragment>
        )}
      </Box>

      <InfiniteScroll
        style={{ marginBottom: '80px' }}
        dataLength={ethscriptionsStore.listedList.ethscriptions.length}
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
          {ethscriptionsStore.listedList.ethscriptions.map((item, index) => {
            return (
              <EthscriptionBox
                ethscription={item}
                onChange={handleOnChangeEthscription}
                key={Symbol(`${item.order.ethscriptionId}${index}`).toString()}
                footer={<EthscriptionBoxFooter />}
              />
            );
          })}
        </Box>
      </InfiniteScroll>
    </Box>
  );
};

export default ListedList;
