import { useEffect } from 'react';
import { Box, Typography, useMediaQuery, Link } from '@mui/material';
import { GetCollectionDetailRequest, ISwapTokenInfoItem } from '@/services/marketpalce/types';
import { useSearchParams } from 'next/navigation';

import services from '@/services';
import MediaList from '@/components/MediaList';
import CollectionBlueSVG from '@/assets/icons/verify.svg';
import getTruncate from '@/utils/getTruncate';
import { numberFormatUnit } from '@/utils/numberFormatUnit';
import BigNumber from 'bignumber.js';
import NftImage from '@/components/NftImage';
import { formatAddress } from '@/utils/addressHelper';
import MarketPlaceChart from './MarketPlaceChart';
import { FACET_CONFIG } from '@/constants/config';
import * as FacetSwapStore from '@/stores/FacetSwapStore';
import * as EthscriptionsStore from '@/stores/EthscriptionsStore';
import { useSnapshot } from 'valtio/react';
import { IEthscriptionsStore } from '@/stores/EthscriptionsStore';
import { useAccount } from 'wagmi';
import { useQuery } from 'react-query';
import { ethers } from 'ethers';

interface ICollectionDetail {
  category: GetCollectionDetailRequest['category'];
}

const CollectionDetail: React.FC<ICollectionDetail> = ({ category }) => {
  const searchParams = useSearchParams();
  const matches = useMediaQuery('(min-width:750px)');
  const account = useAccount();

  const collectionName = searchParams?.get('collectionName')?.toString().trim() ?? '';

  const ethscriptionsStore = useSnapshot(EthscriptionsStore.store) as IEthscriptionsStore;

  const [p, tick] = collectionName.split(' ');

  const collectionDetail = ethscriptionsStore.collectionDetail;

  const { value: owners_value, unit: owners_unit } = numberFormatUnit(collectionDetail?.collections.owners || '0');
  const { value: itemListed_value, unit: itemListed_unit } = numberFormatUnit(
    collectionDetail?.collections.itemListed || '0',
  );
  const { value: totalSupply_value, unit: totalSupply_unit } = numberFormatUnit(
    collectionDetail?.collections.totalSupply || '0',
  );

  const isHasCA = Boolean(collectionDetail?.collections.facetStat.contractAddress);

  async function getDetails() {
    try {
      EthscriptionsStore.setCollectionDetail();
      const response = await services.marketplace.getCollectionDetail({ category, collectionName });
      if (response?.code == 200) {
        EthscriptionsStore.setCollectionDetail(response.data);
      }
    } catch (error) {}
  }
  const routerAddress = collectionDetail?.collections.facetStat.routerAddress;

  useEffect(() => {
    FacetSwapStore.clearToken();
    getDetails();
  }, []);

  useQuery({
    queryKey: ['getPairs', account.address],
    queryFn: () =>
      services.facet.getPairs({
        router: routerAddress!,
        account: account.address as string,
      }),
    enabled: Boolean(routerAddress),
    refetchInterval: 3000,
    onSuccess(data) {
      FacetSwapStore.setPairs(data);
    },
  });

  useQuery({
    queryKey: ['getPairs', account.address],
    queryFn: () =>
      services.facet.getPairs({
        router: routerAddress!,
        account: account.address as string,
      }),
    enabled: Boolean(routerAddress),
    async onSuccess(data) {
      FacetSwapStore.setPairs(data);
      const tokenInfo = await services.marketplace.getSwapTokensInfo({
        tokenAddresses: Object.values(data).map((item) => item.address),
      });
      if (tokenInfo.code == 200) {
        let tokenInfoObj: { [key in string]: ISwapTokenInfoItem } = {};

        tokenInfo.data.tokens.forEach((item) => {
          tokenInfoObj[ethers.utils.getAddress(item.contractAddress)] = item;
        });
        FacetSwapStore.setTokenInfo({ tokens: tokenInfoObj, ethPrice: tokenInfo.data.ethPrice });
      }
    },
  });

  function getTagComponent(label: string, value: React.ReactNode, isLine: boolean) {
    return (
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          position: 'relative',
          marginRight: matches ? '0' : '28px',
          '&:before': isLine
            ? {
                content: '" "',
                display: 'block',
                borderRight: '1px solid rgba(255,255,255,0.2)',
                top: 0,
                bottom: 0,
                right: '-16px',
                margin: 'auto 0',
                height: '12px',
                position: 'absolute',
              }
            : null,
        }}
      >
        <Typography sx={{ color: 'rgba(255,255,255, 0.65)', marginRight: '4px', fontSize: '14px', fontWeight: 500 }}>
          {label}
        </Typography>
        <Typography
          sx={{
            color: 'rgba(255,255,255, 1)',
            fontWeight: 500,
            fontSize: '14px',
            display: 'flex',
            alignItems: 'center',
          }}
        >
          {value}
        </Typography>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        paddingBottom: matches ? '34px' : '20px',
        boxSizing: 'border-box',
        display: 'flex',
        alignItems: matches ? 'center' : 'flex-start',
        flexDirection: matches ? 'row' : 'column',
        justifyContent: 'space-between',
        gap: '10px',
      }}
    >
      {category == 'nft' && collectionDetail?.collections.icon && (
        <Box
          sx={{
            width: '80px',
            height: '80px',
            borderRadius: '8px',
            border: '1px solid #2F343E',
            background: '#202229',
            overflow: 'hidden',
          }}
        >
          <NftImage content={collectionDetail?.collections.icon} />
        </Box>
      )}
      {category == 'token' && collectionDetail?.collections?.icon && (
        <Box
          sx={{
            width: '80px',
            height: '80px',
            borderRadius: '8px',
            border: '1px solid #2F343E',
            background: '#202229',
            overflow: 'hidden',
          }}
        >
          <img
            src={collectionDetail.collections.icon}
            height="100%"
            width="100%"
            style={{
              objectFit: 'contain',
              border: 'none',
              outline: 'none',
            }}
          />
        </Box>
      )}
      <Box
        sx={{
          flex: 1,
          height: category == 'nft' ? '80px' : 'auto',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          gap: '6px',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Typography sx={{ fontSize: '18px', fontWeight: 600 }}>
              {`${category == 'domain' ? '.' : ''}${
                collectionDetail?.collections.collectionName ? `${p} ${tick ? tick : ''}` : '--'
              }`}
            </Typography>
            {collectionDetail?.collections.isBlue && <CollectionBlueSVG />}
            {['nft', 'token'].includes(category) && (
              <MarketPlaceChart category={category} collectionName={collectionName} />
            )}
          </Box>

          {collectionDetail?.socialLinks && <MediaList data={collectionDetail?.socialLinks} />}
        </Box>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: matches ? '33px' : '6px',
            flexWrap: matches ? 'unset' : 'wrap',
          }}
        >
          {getTagComponent('Floor', `${getTruncate(collectionDetail?.collections.floorPrice || '0', 4)} ETH`, true)}
          {getTagComponent(
            'Unit Price',
            `${new BigNumber(collectionDetail?.collections.unitPriceUsd || '0').gt(0) ? '$' : ''} ${getTruncate(
              collectionDetail?.collections.unitPriceUsd || '0',
              6,
            )}`,
            matches,
          )}

          {getTagComponent(
            'Total Vol',
            `${getTruncate(collectionDetail?.collections.totalVolume || '0', 2)} ETH`,
            true,
          )}
          {getTagComponent('Owners', `${owners_value}${owners_unit}`, true)}
          {getTagComponent('Listed', `${itemListed_value}${itemListed_unit}`, true)}
          {getTagComponent('Total Supply', `${totalSupply_value}${totalSupply_unit}`, isHasCA)}
          {isHasCA
            ? getTagComponent(
                'CA',
                <Link
                  href={`${FACET_CONFIG.SCAN_FE_URL}/address/${collectionDetail?.collections.facetStat.contractAddress}`}
                  target="_blank"
                  style={{ color: '#fff' }}
                >
                  {formatAddress(collectionDetail?.collections.facetStat.contractAddress!)}
                </Link>,
                false,
              )
            : ''}
        </Box>
      </Box>
    </Box>
  );
};

export default CollectionDetail;
