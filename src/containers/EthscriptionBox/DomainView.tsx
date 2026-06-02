// ============================================================================
// 【EthscriptionBox/DomainView.tsx】Domain 类铭文卡片视图
// ----------------------------------------------------------------------------
// 展示域名（domain）类铭文。布局：
//   1. 顶部：trait 标签（域名规则类型，如 'Common'/'NonASCIIRules'）
//      + verified 图标（非 ASCII 域名用警告图标 ⚠️ 替代 swoosh，带 Tooltip 提示）
//   2. 中间：域名文字（content），空格替换为 ⌷ 占位符（避免不可见字符混淆）
//   3. slotCheckBox：绝对定位右下角
//
// 安全细节：
//   非 ASCII 域名（如含中文、特殊符号）外观可能与 ASCII 字符相似（视觉攻击），
//   所以对 Common/NonASCIIRules trait 显示 ⚠️ 而非绿色 verified 勾，提醒用户注意。
// ============================================================================

'use client';

import { Box, Tooltip, Typography } from '@mui/material';
import Image from 'next/image';

import SwooshGreenSVG from '@/assets/images/swoosh-icon-green.svg';
import WarnPNG from '@/assets/images/warn.png';

import { GetEthscriptionsItem } from '@/services/marketpalce/types';
import Link from 'next/link';

interface INftView {
  ethscription: GetEthscriptionsItem;
  slotCheckBox?: React.ReactNode;
}

const NftView: React.FC<INftView> = ({ ethscription, slotCheckBox = null }) => {
  let { content } = ethscription.order;
  if (content.includes('data')) {
    content = content.replace('data:,', '');
  }

  return (
    <Box sx={{ p: '16px', position: 'relative' }}>
      <Link
        href={`/market/${ethscription.order.category}?category=${ethscription.order.category}&collectionName=${ethscription.order.collectionName}`}
        style={{
          textDecoration: 'none',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
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
            {ethscription.order.trait}
          </Typography>
          {ethscription.order.isVerified && ['Common', 'NonASCIIRules'].includes(ethscription.order.trait) ? (
            <Tooltip
              componentsProps={{
                tooltip: {
                  sx: {
                    bgcolor: '#313439',
                    color: 'rgba(255, 255, 255, 0.65)',
                  },
                },
                arrow: {
                  sx: {
                    color: '#313439',
                  },
                },
              }}
              placement="top"
              arrow
              title="⚠️ ATTENTION: This name contains non-ASCII characters as shown above. Please be aware that there are characters that look identical or very similar to English letters."
            >
              <Image src={WarnPNG} alt="warn-icon" style={{ width: '16px', height: '16px', cursor: 'pointer' }} />
            </Tooltip>
          ) : (
            <SwooshGreenSVG />
          )}
        </Box>
        <Box
          sx={{
            flex: '1 1',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100px',
            color: '#E5FF65',
            fontSize: '16px',
            fontWeight: 500,
          }}
        >
          {content.replace(/\s/g, '⌷')}
        </Box>
      </Link>
      {slotCheckBox && (
        <Box sx={{ justifySelf: 'flex-end', position: 'absolute', bottom: '13px', right: '10px' }}>{slotCheckBox}</Box>
      )}
    </Box>
  );
};

export default NftView;
