// ============================================================================
// 【EthscriptionBox/Erc20View.tsx】Token/ERC-20 类铭文卡片视图
// ----------------------------------------------------------------------------
// 展示 token（erc-20）类铭文。布局从上到下：
//   1. 标题行：tick 符号（荧光黄）或 EthscriptionLabel + verified 勾
//   2. 标签行：协议名（p）+ 操作类型（op）+ tokenId（仅 mint 时显示）
//   3. 数量 + 单价（unitPriceUsd，如有则显示 $xx/tick）
//   4. slotCheckBox：绝对定位右下角
//
// 关键逻辑：
//   content 格式为 'data:,{"p":"erc-20","op":"mint","tick":"ordi","amt":"1000"}'，
//   去掉 'data:,' 前缀后 JSON.parse 得到 parsedContent。
//   isTransfer=true 时背景变深蓝色（#0D131D）区分转账操作。
// ============================================================================

'use client';

import { Fragment } from 'react';
import { Box, Typography } from '@mui/material';

import SwooshGreenSVG from '@/assets/images/swoosh-icon-green.svg';
import { GetEthscriptionsItem } from '@/services/marketpalce/types';
import EthscriptionLabel from '@/components/EthscriptionLabel';
import getTruncate from '@/utils/getTruncate';
import Link from 'next/link';

interface IErc20View {
  ethscription: GetEthscriptionsItem;
  slotCheckBox?: React.ReactNode;
}

const Erc20View: React.FC<IErc20View> = ({ ethscription, slotCheckBox = null }) => {
  // content 原始值：'data:,{"p":"erc-20","op":"mint",...}'
  const content = ethscription.order.content.replace('data:,', '');
  const parsedContent = JSON.parse(content); // 解析铭文 JSON 内容

  const isTransfer = parsedContent?.op == 'transfer'; // 转账操作：背景变深蓝

  return (
    <Box sx={{ p: '16px', backgroundColor: isTransfer ? '#0D131D' : 'transparent', position: 'relative' }}>
      <Link
        href={`/market/${ethscription.order.category}?category=${ethscription.order.category}&collectionName=${ethscription.order.collectionName}`}
        style={{
          textDecoration: 'none',
        }}
      >
        <Box
          mb="8px"
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: '24px',
            justifyContent: 'space-between',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            {ethscription.order.category == 'token' ? (
              <Box sx={{ color: '#E5FF65', fontSize: '16px', fontWeight: '500' }}>{parsedContent.tick}</Box>
            ) : (
              <EthscriptionLabel
                collectionName={ethscription.order.collectionName}
                category={ethscription.order.category}
                icon={ethscription.order.content}
              />
            )}
          </Box>
          {ethscription.order.isVerified && <SwooshGreenSVG />}
        </Box>
        {ethscription.order.category == 'token' && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: '6px', mb: '18px' }}>
            <Typography
              sx={{
                fontSize: '12px',
                p: '0 4px',
                boxSizing: 'border-box',
                borderRadius: '3px',
                border: '1px solid rgba(255, 255, 255, 0.20)',
                color: 'rgba(255, 255, 255, 0.45)',
              }}
            >
              {parsedContent.p}
            </Typography>
            <Typography
              sx={{
                fontSize: '12px',
                p: '0 4px',
                boxSizing: 'border-box',
                borderRadius: '3px',
                border: '1px solid rgba(255, 255, 255, 0.20)',
                color: 'rgba(255, 255, 255, 0.45)',
              }}
            >
              {parsedContent.op}
            </Typography>
            {parsedContent.op == 'mint' && (
              <Typography
                sx={{
                  fontSize: '12px',
                  p: '0 4px',
                  boxSizing: 'border-box',
                  borderRadius: '3px',
                  border: '1px solid rgba(255, 255, 255, 0.20)',
                  color: 'rgba(255, 255, 255, 0.45)',
                }}
              >{`#${ethscription.order.tokenId}`}</Typography>
            )}
          </Box>
        )}
      </Link>

      <Box sx={{ display: 'flex', flexDirection: 'column', width: '100%', alignItems: 'center', gap: '16px' }}>
        <Typography>{parsedContent.amt}</Typography>
        <Box
          sx={{
            color: '#E5FF65',
            fontSize: '16px',
            fontWeight: '500',
            lineHeight: '16px',
            display: 'flex',
            alignItems: 'center',
            height: '25px',
          }}
        >
          {ethscription.order.unitPriceUsd.trim() != '' && (
            <Fragment>
              {`$${getTruncate(ethscription.order.unitPriceUsd.trim(), 8)}`}
              <Typography sx={{ color: 'rgba(255, 255, 255, 0.45)' }}>{`/${parsedContent.tick}`}</Typography>
            </Fragment>
          )}
        </Box>
      </Box>

      {slotCheckBox && (
        <Box sx={{ justifySelf: 'flex-end', position: 'absolute', bottom: '13px', right: '10px' }}>{slotCheckBox}</Box>
      )}
    </Box>
  );
};

export default Erc20View;
