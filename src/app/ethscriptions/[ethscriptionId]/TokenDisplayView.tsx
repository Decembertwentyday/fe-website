'use client';

import { useMemo } from 'react';

import { GetEthscriptionAssetItem } from '@/services/marketpalce/types';
import { isValidJSON, splitDatauri } from '@/utils';

import EthsView from '@/components/EthsView';

interface ITokenDisplayView {
  ethscription: GetEthscriptionAssetItem['ethscription'];
}

const TokenDisplayView: React.FC<ITokenDisplayView> = ({ ethscription }) => {
  const HtmlDataUrlPre = 'data:text/html';

  const [data, isJson, isImage, isHtml] = useMemo(() => {
    // html detection priority is the highest, and both  image type and text type may contain it
    if (ethscription.order.content.includes(HtmlDataUrlPre)) {
      return [ethscription.order.content, false, false, true];
    }
    if (ethscription.order.category === 'nft') {
      return [ethscription.order.content, false, true, false];
    }
    if (ethscription.order.category === 'image') {
      return [ethscription.order.content, false, true, false];
    }
    if (ethscription.order.category === 'domain') {
      return [splitDatauri(ethscription.order.content)[1], false, false, false];
    }
    if (ethscription.order.category === 'token') {
      const [pre, tokenData] = splitDatauri(ethscription.order.content);

      if (isValidJSON(tokenData)) {
        const json = JSON.parse(tokenData);
        const isValueType = ['number', 'string'].includes(typeof json);
        return [JSON.stringify(json, null, 2), !isValueType, false, false];
      }
      return [ethscription.order.content, false, false, false];
    }
    const [pre, dataPart] = splitDatauri(ethscription.order.content);

    if (ethscription.order.category === 'text') {
      if (pre.includes('image/')) {
        if (pre.includes('esip6')) {
          let content = ethscription.order.content.replace('esip6=true,', '');
          return [content, false, true, false];
        }
        return [ethscription.order.content, false, true, false];
      }
      if (isValidJSON(dataPart)) {
        const json = JSON.parse(dataPart);
        const isValueType = ['number', 'string'].includes(typeof json);
        return [JSON.stringify(json, null, 2), !isValueType, false, false];
      }
      return [dataPart, false, false, false];
    }

    return ['', false, false, false];
  }, [ethscription]);

  return (
    <EthsView category={isImage ? 'image' : ethscription.order.category} data={data} isHtml={isHtml} isJson={isJson} />
  );
};

export default TokenDisplayView;
