// ============================================================================
// 【VaultList】金库铭文列表（无限滚动）
// ----------------------------------------------------------------------------
// 职责：
//   展示当前用户在指定集合中存入金库的所有铭文，支持无限滚动加载。
//   每张铭文卡片底部附有 EthscriptionBoxFooter（赎回操作按钮）。
//
// 数据来源：
//   services.vault.getVaultList(filterRequest) → GetVaultListData
//
// 三个 useEffect 的分工：
//   1. 监听 filterRequest 变化 → 发起请求（集合非空时才请求）
//   2. 监听 collectionName（URL 参数）→ 更新 filterRequest.collection
//   3. 监听 address（钱包地址）→ 更新 filterRequest.owner
//
// handleOnChangeEthscription：本地状态更新（不重新请求）
//   - op='update'：铭文卡片状态变更时（如赎回中），本地替换对应 item
//   - op='remove'：铭文赎回完成后，本地从列表移除（避免重新拉取整个列表）
//
// 分页方式：无限滚动（InfiniteScroll）
//   - page.index=1 时清空列表重新加载
//   - page.index>1 时 concat 追加数据
//   - hasMore = total > 当前条目数
// ============================================================================

'use client';

import { useState, useEffect } from 'react';
import { Box, IconButton, Typography } from '@mui/material';
import { useImmer } from 'use-immer';
import InfiniteScroll from 'react-infinite-scroll-component';
import { useSearchParams } from 'next/navigation';

import services from '@/services';
import EthscriptionBoxFooter from './EthscriptionBoxFooter';
import { categoryType } from '@/services/marketpalce/types';
import RefreshSVG from '@/assets/icons/refresh.svg';
import { GetVaultListData, GetVaultListItem, GetVaultListRequest } from '@/services/vault/types';
import EthscriptionBox from '@/containers/EthscriptionBox';
import { useAccount } from 'wagmi';

// 每页加载条数（无限滚动的每次请求量）
const PAGE_START_INIT = 20;

interface IVaultList {
  category: categoryType; // 铭文类别（nft/domain 等）
}

const VaultList: React.FC<IVaultList> = ({ category }) => {
  // 从 URL 参数读取集合名称（如 ?collectionName=FacetPunks）
  const searchParams = useSearchParams();
  const { address } = useAccount(); // 当前钱包地址（owner）
  const collectionName = searchParams?.get('collectionName')?.toString().trim() ?? '';

  const [isLoading, setIsLoading] = useState<boolean>(false);

  // filterRequest：请求参数（category + collection + owner + 分页）
  const [filterRequest, setFilterRequest] = useImmer<GetVaultListRequest>({
    category,
    collection: collectionName,
    owner: address as string,
    'page.size': PAGE_START_INIT,
    'page.index': 1,
  });

  // list：金库铭文列表数据（无限滚动累积）
  const [list, setList] = useImmer<GetVaultListData>({
    ethscriptions: [],
    page: {
      size: PAGE_START_INIT,
      index: 1,
      total: '0',
    },
  });

  // 核心请求函数
  async function getMarketList() {
    if (isLoading) return; // 防并发

    // 第 1 页时清空列表（刷新操作）
    if (filterRequest['page.index'] == 1) {
      setList((state) => {
        state.ethscriptions = []; // valtio/immer：直接赋值空数组
      });
    }
    setIsLoading(true);

    const response = await services.vault.getVaultList(filterRequest);

    if (response?.code === 200) {
      if (filterRequest['page.index'] === 1) {
        setList(() => response.data); // 第 1 页：整体替换
      } else {
        setList((state) => {
          // 后续页：追加到末尾（无限滚动核心逻辑）
          state.ethscriptions = state.ethscriptions.concat(response.data.ethscriptions);
          state.page = response.data.page;
        });
      }
    }

    setIsLoading(false);
  }

  // 本地状态更新（铭文操作后更新本地列表，不重新拉取整个列表）
  // op='update'：替换某条记录（如赎回中 → 赎回完成前的中间态）
  // op='remove'：删除某条记录（如赎回完成，从列表移除）
  async function handleOnChangeEthscription(
    op: 'update' | 'remove',
    action: string,
    ethscriptionItem: GetVaultListItem,
  ) {
    if (op == 'update') {
      // 找到匹配的铭文（按 ethscriptionId + category + collectionName 三重匹配）
      const _ethscriptions = list.ethscriptions.map((item) => {
        if (
          item.order.ethscriptionId == ethscriptionItem.order.ethscriptionId &&
          item.order.category == ethscriptionItem.order.category &&
          item.order.collectionName == ethscriptionItem.order.collectionName
        ) {
          return ethscriptionItem; // 替换为新状态
        } else {
          return item;
        }
      });
      setList({ ...list, ethscriptions: _ethscriptions });
      return;
    }
    if (op == 'remove') {
      // 过滤掉已赎回的铭文
      const _ethscriptions = list.ethscriptions.filter((item) => {
        if (
          item.order.ethscriptionId == ethscriptionItem.order.ethscriptionId &&
          item.order.category == ethscriptionItem.order.category &&
          item.order.collectionName == ethscriptionItem.order.collectionName
        ) {
          return false; // 排除
        } else {
          return true;
        }
      });
      setList({ ...list, ethscriptions: _ethscriptions });
      return;
    }
  }

  // Effect #1：filterRequest 变化 → 发起请求（collection 非空时才请求）
  useEffect(() => {
    if (filterRequest.collection != '') {
      getMarketList();
    }
  }, [filterRequest]);

  // Effect #2：URL 参数 collectionName 变化 → 更新 filterRequest.collection
  useEffect(() => {
    setFilterRequest((state) => {
      state.collection = collectionName;
    });
  }, [collectionName]);

  // Effect #3：钱包地址变化（连接/断开钱包）→ 更新 filterRequest.owner
  useEffect(() => {
    if (address) {
      setFilterRequest((state) => {
        state.owner = address;
      });
    }
  }, [address]);

  // isHasMore：是否还有更多数据（用于控制无限滚动的 hasMore 属性）
  const isHasMore = Number(list.page.total) > list.ethscriptions.length;

  return (
    <Box>
      {/* 顶部工具栏：显示总数 + 刷新按钮 */}
      <Box
        sx={{
          mb: '16px',
          gap: '24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: { xs: 'start', sm: 'center' },
          flexDirection: { xs: 'column', sm: 'row' },
        }}
      >
        <Box sx={{ gap: '8px', display: 'flex', alignItems: 'center' }}>
          <Typography sx={{ fontSize: '14px' }}>{`Result: ${list.page.total}`}</Typography>
          {/* 刷新按钮：如果当前已在第 1 页直接重新请求，否则先重置页码（触发 Effect #1）*/}
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
      </Box>

      {/* 无限滚动容器 */}
      <InfiniteScroll
        style={{ marginBottom: '80px' }}
        dataLength={list.ethscriptions.length} // 已加载条目数
        next={() => {
          // 滚动到底时，page.index+1 → 触发 Effect #1 加载下一页
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
        {/* 网格布局：自动填充列，最小 209px 宽 */}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(209px, 1fr))',
            justifyContent: 'space-between',
            gridGap: '24px',
          }}
        >
          {/* 遍历渲染每张铭文卡片（EthscriptionBox + 底部赎回操作栏）*/}
          {list.ethscriptions.map((item, index) => {
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

export default VaultList;
