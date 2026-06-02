// ============================================================================
// 【EthscriptionCollectionOwner/index.tsx】用户钱包内某类别拥有的集合查询过滤组件
// ----------------------------------------------------------------------------
// 作用：渲染为一个下拉选择框 (Popover)，内含用户拥有的集合名称搜索功能和列表。
// 主要是放在 "My Ethscriptions" 界面作为一个过滤维度的左上角控件。支持 token, nft, domain。
// ============================================================================

'use client';

import React, { useEffect, useState } from 'react';
import { Box, Popover } from '@mui/material';

import ArrowDownSVG from '@/assets/icons/arrow_down.svg';
import ArrowUPSVG from '@/assets/icons/arrow_up.svg';
import SearchTokenPanel from './SearchTokenPanel';
import {
  GetCollectionOwnerListData,
  GetCollectionOwnerListItem,
  GetCollectionOwnerListRequest,
  categoryType,
} from '@/services/marketpalce/types';
import {
  EthscriptionCollectionOwnerContext,
  IEthscriptionCollectionOwnerContext,
} from './EthscriptionCollectionContext';
import { useImmer } from 'use-immer';
import { useDebounce } from 'usehooks-ts';
import services from '@/services';
import SearchNFTPanel from './SearchNFTPanel';
import EthscriptionLabel from '@/components/EthscriptionLabel';
import SearchDomainPanel from './SearchDomainPanel';

interface IEthscriptionCollectionOwner {
  category: categoryType;
  onSelect?: IEthscriptionCollectionOwnerContext['onSelect'];
  address: string;
  value: GetCollectionOwnerListItem;
}

const EthscriptionCollectionOwner: React.FC<IEthscriptionCollectionOwner> = ({
  category,
  address,
  value,
  onSelect,
}) => {
  const [anchorEl, setAnchorEl] = useState<HTMLDivElement | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [collectionList, setCollectionList] = useState<GetCollectionOwnerListData>({
    collections: [],
  });
  const [filterRequest, setFilterRequest] = useImmer<GetCollectionOwnerListRequest>({
    category,
    tokenQuery: '',
    address,
  });
  const filterRequestDebounce = useDebounce(filterRequest, 300);

  const handleClick = (event: React.MouseEvent<HTMLDivElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);

  const handleOnSelect = async (item: GetCollectionOwnerListItem) => {
    onSelect?.(item);
    handleClose();
  };

  useEffect(() => {
    setFilterRequest((state) => {
      state.address = address;
    });
  }, [address]);

  useEffect(() => {
    getCollectionList();
  }, [filterRequestDebounce]);

  async function getCollectionList() {
    if (isLoading) return;
    setIsLoading(true);
    const response = await services.marketplace.getCollectionOwnerList(filterRequestDebounce);

    if (response?.code === 200) {
      setCollectionList(response.data);
      category == 'token' && response.data.collections.length > 0 && onSelect?.(response.data.collections?.[0]);
    }
    setIsLoading(false);
  }

  const categoryPanel: { [key in IEthscriptionCollectionOwner['category']]: React.ReactNode } = {
    token: <SearchTokenPanel />,
    nft: <SearchNFTPanel />,
    domain: <SearchDomainPanel />,
    image: null,
    text: null,
  };

  function getCategoryTokenTitle() {
    if (value?.category == 'token' && value?.collectionName != '') {
      return <EthscriptionLabel collectionName={value.collectionName} category={value.category} icon={value.icon} />;
    }
    return 'All Tokens';
  }

  function getCategoryDomainTitle() {
    if (value?.category == 'domain' && value?.collectionName != '') {
      return <EthscriptionLabel collectionName={value.collectionName} category={value.category} icon={value.icon} />;
    }
    return 'Domains';
  }

  function getCategoryNFTTitle() {
    if (value?.category == 'nft' && value?.collectionName != '') {
      return <EthscriptionLabel collectionName={value.collectionName} category={value.category} icon={value.icon} />;
    }
    return 'Collections';
  }

  return (
    <Box>
      <EthscriptionCollectionOwnerContext.Provider
        // value={{
        //   collectionItem: collectionItem || null,
        //   onSelect: handleOnSelect,
        //   setCollectionItem,
        //   collectionList,
        //   isLoading,
        //   setFilterRequest,
        // }}
        value={{
          collectionItem: value || null,
          onSelect: handleOnSelect,
          setCollectionItem: (item) => {
            onSelect?.(item);
          },
          collectionList,
          isLoading,
          setFilterRequest,
        }}
      >
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            cursor: 'pointer',
            p: '0 16px',
            height: '40px',
            borderRadius: '34px',
            border: value?.category === category ? '1px solid #E5FF65' : '1px solid #FFF',
            color: value?.category === category ? '#E5FF65' : '#fff',
            width: 'fit-content',
          }}
          onClick={handleClick}
        >
          {category == 'token' && <Box sx={{ marginRight: '6px' }}>{getCategoryTokenTitle()}</Box>}
          {category == 'domain' && <Box sx={{ marginRight: '6px' }}>{getCategoryDomainTitle()}</Box>}
          {category == 'nft' && <Box sx={{ marginRight: '6px' }}>{getCategoryNFTTitle()}</Box>}

          {open ? (
            <ArrowUPSVG color={value?.category === category ? '#E5FF65' : 'rgba(255,255,255,0.45)'} />
          ) : (
            <ArrowDownSVG color={value?.category === category ? '#E5FF65' : 'rgba(255,255,255,0.45)'} />
          )}
        </Box>
        <Popover
          open={open}
          anchorEl={anchorEl}
          onClose={handleClose}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'left',
          }}
          transformOrigin={{
            vertical: 'top',
            horizontal: 'left',
          }}
          sx={{
            backgroundColor: 'transparent',
            '.MuiPaper-root': {
              background: 'transparent',
            },
          }}
        >
          <Box
            sx={{
              mt: '8px',
              display: 'flex',
              flexDirection: 'column',
              borderRadius: '8px',
              border: '1px solid #474C56',
              background: '#313439',
              p: '16px',
              boxShadow: '0px 0px 4px 0px rgba(19, 33, 82, 0.06), 0px 1px 25px 0px rgba(19, 33, 82, 0.10)',
            }}
          >
            {categoryPanel[category]}
          </Box>
        </Popover>
      </EthscriptionCollectionOwnerContext.Provider>
    </Box>
  );
};

export default EthscriptionCollectionOwner;
