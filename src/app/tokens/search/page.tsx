// ============================================================================
// 【app/tokens/search/page.tsx】Token 铭文地址查询页（路由：/tokens/search?address=...）
// ----------------------------------------------------------------------------
// 职责：
//   通过钱包地址查询该地址持有的所有铭文（ERC-20 token）。
//   顶部是搜索框（可重新搜索），下方是集合过滤器 + 结果列表（无限滚动）。
//
// URL 参数读取：
//   address   = 钱包地址（必须，否则不发请求）
//   collection = 集合名过滤（可选）
//   category   = 类别过滤（可选，目前只启用 token，nft/domain 注释掉了）
//
// 数据流：
//   URL address/collection 变化 → useEffect → getOwnerList(1)
//   滚动到底 → ResultArea.loadMore → getOwnerList(ownerList.page.index + 1)
//
// 分页：无限滚动（pageIndex 递增，concat 追加）
//   pageIndex=1 时整体替换（setOwnerList(() => response.data)）
//   pageIndex>1 时 concat 追加（immer 写法）
//
// EthscriptionCollectionOwner：集合过滤下拉选择器
//   选中某个集合 → 更新 URL 参数 → 触发 useEffect 重新请求
//   setCollectionItem 同步更新选中状态（受控组件 value）
//   注意：domain/nft 的过滤器被注释掉了，目前只显示 token 类型的过滤
//
// 空结果处理：
//   接口返回 total=0 且 ethscriptions 为空时，弹出自定义 toast 提示"No Result Found!"
// ============================================================================

'use client';

import { useEffect, useState } from 'react';
import { Box, Typography } from '@mui/material';
import toast from 'react-hot-toast';
import WarnSVG from '@/assets/icons/warn32.svg';

import ResultArea from './ResultArea';
import services from '@/services';
import { GetOwnerData, GetOwnerRequest } from '@/services/ethscriptions/types';
import { useImmer } from 'use-immer';
import { useSearchParams, useRouter } from 'next/navigation';
import SearchInput from '@/components/SearchInput';
import EthscriptionCollectionOwner from '@/containers/EthscriptionCollectionOwner';
import { GetCollectionOwnerListItem, categoryType } from '@/services/marketpalce/types';
import { DEFAULT_COLLECTION_OWNNER_ITEM } from '@/constants';

// 默认空列表（初始状态和清空时使用）
const defaultList = {
  ethscriptions: [],
  page: {
    size: 0,
    index: 0,
    total: '0',
  },
};

const SearchArea = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  // 从 URL 读取三个查询参数
  const address = searchParams?.get('address')?.toString().trim();
  const collection = searchParams?.get('collection')?.toString().trim() || '';
  const category = (searchParams?.get('category')?.toString().trim() as categoryType) || '';

  const [ownerList, setOwnerList] = useImmer<GetOwnerData>(defaultList);
  // collectionItem：集合过滤器的当前选中项（受控组件）
  const [collectionItem, setCollectionItem] = useState<GetCollectionOwnerListItem>({
    ...DEFAULT_COLLECTION_OWNNER_ITEM,
    collectionName: collection,
    category: category,
  });

  // 核心请求函数（pageIndex=1 时替换，>1 时追加）
  async function getOwnerList(pageIndex: number) {
    let params: GetOwnerRequest = {
      category: category ?? '',
      address: address ?? '',
      'page.size': 30,
      'page.index': pageIndex ?? 1,
      collection: collection || '',
    };

    const response = await services.ethscriptions.getOwner(params);
    if (response?.code == 200) {
      // 空结果：弹出自定义 Toast 提示（使用 react-hot-toast 的 custom 方法）
      if (response.data.ethscriptions.length === 0 && Number(response.data.page.total) === 0) {
        toast.custom(
          <Box
            sx={{
              width: '380px',
              display: 'flex',
              alignItems: 'center',
              padding: '16px',
              border: '1px solid #2F343E',
              borderRadius: '8px',
              background: '#202229',
            }}
          >
            <WarnSVG style={{ marginRight: '12px' }} />
            <Typography sx={{ color: '#FFF' }}>No Result Found!</Typography>
          </Box>,
        );
      }
      if (pageIndex === 1) {
        setOwnerList(() => response.data); // 第 1 页：整体替换
      } else {
        setOwnerList((state) => {
          // 后续页：追加（无限滚动）
          state.ethscriptions = state.ethscriptions.concat(response.data.ethscriptions);
          state.page = response.data.page;
        });
      }
    }
  }

  // URL 参数变化（address/collection）→ 重新请求第 1 页
  useEffect(() => {
    if (address) {
      getOwnerList(1);
    }
  }, [address, collection]);
  return (
    <Box sx={{ minHeight: 'calc(100vh - 203.5px)' }}>
      {/* 说明标题 */}
      <Typography
        sx={{
          color: '#E6FF65',
          textAlign: 'center',
          fontSize: '20px',
          fontWeight: '600',
          letterSpacing: '1px',
        }}
        gutterBottom
      >
        Check out token ethscriptions balance of the address.
      </Typography>
      {/* 搜索框（带默认值，用于重新搜索其他地址）*/}
      <Box sx={{ display: 'flex', justifyContent: 'center', m: '24px 0 16px 0' }}>
        <SearchInput
          defaultValue={address} // 从 URL 读取，回显到输入框
          onClear={() => {
            setOwnerList(defaultList); // 清空列表
            router.replace('/tokens/search'); // 跳回无参搜索页
          }}
          onClick={(value) => {
            // 点击搜索：直接跳转（URL 变化 → useEffect 触发）
            router.replace(`/tokens/search?address=${value}`);
          }}
          onEnter={(value) => {
            // 回车：先立即请求（快速响应）再同步 URL
            getOwnerList(1);
            router.replace(`/tokens/search?address=${value}`);
          }}
        />
      </Box>
      <Typography
        sx={{
          color: 'rgba(255, 255, 255, 0.8)',
          textAlign: 'center',
          fontSize: '14px',
          lineHeight: '16px',
          letterSpacing: '1px',
        }}
        gutterBottom
      >
        Recognize all operations including DEPLOY, MINT and TRANSFER.
      </Typography>
      <Box
        sx={{
          p: { xs: '40px 10px', sm: '40px 172px' },
        }}
      >
        <Box sx={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
          {/* 集合过滤器：选中后将 collection 参数写入 URL，触发 useEffect 过滤 */}
          <EthscriptionCollectionOwner
            category="token"
            address={address || ''}
            onSelect={async (item) => {
              const path = `/tokens/search?address=${address}&category=token&collection=${item.collectionName}`;
              router.replace(path);
              setCollectionItem(item); // 同步选中状态（受控）
            }}
            value={collectionItem}
          />
          {/* domain / nft 过滤器（目前注释掉，只保留 token 类别）*/}
          {/* <EthscriptionCollectionOwner
            category="domain"
            address={address || ''}
            onSelect={async (item) => {
              const path = `/tokens/search?address=${address}&category=domain&collection=${item.collectionName}`;
              router.replace(path);
              setCollectionItem(item);
            }}
            value={collectionItem}
          />
          <EthscriptionCollectionOwner
            category="nft"
            address={address || ''}
            onSelect={async (item) => {
              const path = `/tokens/search?address=${address}&category=nft&collection=${item.collectionName}`;
              router.replace(path);
              setCollectionItem(item);
            }}
            value={collectionItem}
          /> */}
        </Box>
        <Box sx={{ height: '28px' }} />
        {/* 结果列表（无限滚动），loadMore 调用 getOwnerList 加载下一页 */}
        <ResultArea
          loadMore={async () => {
            await getOwnerList(ownerList.page.index + 1);
          }}
          data={ownerList}
        />
      </Box>
    </Box>
  );
};

export default SearchArea;
