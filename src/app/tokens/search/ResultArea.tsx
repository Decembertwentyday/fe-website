// ============================================================================
// 【app/tokens/search/ResultArea.tsx】地址持有铭文搜索结果展示区
// ----------------------------------------------------------------------------
// 职责：
//   展示地址持有铭文的搜索结果（无限滚动卡片网格）。
//   与 app/tokens/ResultArea.tsx 功能相似，但布局略有不同：
//   - 本文件：自适应填充宽度（minmax(256px, 1fr)），全宽网格
//   - tokens/ResultArea.tsx：固定卡片宽度（306px）+ 12% 左右内边距
//
// Props：
//   data: GetOwnerData — 铭文数据（由父组件 page.tsx 请求后传入）
//   loadMore: () => void — 触发加载下一页（父组件实现：getOwnerList(index+1)）
//
// 卡片结构：
//   - 顶部：EthscriptionLabel（集合名+类别）+ 认证勾（verified）
//   - 分割线
//   - 底部：Number / Amount / Created
//
// 点击卡片：新标签打开 Ethscription 浏览器查看铭文详情
// ============================================================================

'use client';

import { Box, Divider } from '@mui/material';
import InfiniteScroll from 'react-infinite-scroll-component';
import dayjs from 'dayjs';
import { useChainId } from 'wagmi';

import SwooshGreenSVG from '@/assets/images/swoosh-icon-green.svg';
import { GetOwnerData } from '@/services/ethscriptions/types';
import { URL_CONFIG } from '@/constants';
import EthscriptionLabel from '@/components/EthscriptionLabel';

interface IResultArea {
  data: GetOwnerData; // 铭文列表数据（ethscriptions + page）
  loadMore: () => void; // 滚动到底时触发加载下一页
}

const ResultArea: React.FC<IResultArea> = ({ data, loadMore }) => {
  // isHasMore：总数 > 已加载数量 → 还有更多数据
  const isHasMore = Number(data.page.total) > data.ethscriptions.length;
  const chainId = useChainId(); // 当前链 ID（决定外部链接 URL）

  return (
    <InfiniteScroll
      style={{ marginBottom: '80px' }}
      dataLength={data.ethscriptions.length}
      next={loadMore}
      hasMore={isHasMore}
      loader={<Box sx={{ textAlign: 'center', padding: '40px 0', fontWeight: 500 }}>Loading...</Box>}
      endMessage={
        <Box sx={{ textAlign: 'center', padding: '40px 0', fontWeight: 500 }}> Yay! You have seen it all</Box>
      }
    >
      {/* 自适应网格：每列最小 256px，自动填充（比 tokens/ResultArea 的 306px 略小）*/}
      <Box
        sx={{
          width: '100%',
          display: 'grid',
          justifyContent: 'space-between',
          gridTemplateColumns: 'repeat(auto-fill, minmax(256px, 1fr))',
          gridGap: '24px',
        }}
      >
        {data.ethscriptions.map((item, index) => {
          return (
            <Box
              key={Symbol(`${item.ethscriptionId}${index}`).toString()}
              sx={{
                width: '100%',
                boxSizing: 'border-box',
                borderRadius: '12px',
                border: '1px solid #2F343E',
                background: '#202229',
                cursor: 'pointer',
              }}
              onClick={() => {
                // 点击卡片 → 新标签打开铭文详情页
                const _url = `${URL_CONFIG[chainId].etherscription}/ethscriptions/${item.ethscriptionId}`;
                window.open(_url);
              }}
            >
              {/* 顶部：集合标签 + 认证勾（verified green check）*/}
              <Box
                sx={{
                  padding: '16px 20px 17px 20px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <EthscriptionLabel collectionName={item.collectionName} category={item.category} icon={item.icon} />
                {/* swoosh 图标表示 verified（认证集合）*/}
                {item.verified && <SwooshGreenSVG />}
              </Box>
              <Divider />
              {/* 底部：序号 / 数量 / 创建时间三行数据 */}
              <Box sx={{ p: '16px 20px', display: 'flex', gap: '6px', flexDirection: 'column' }}>
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    color: 'rgba(255, 255,255, 0.44)',
                    fontSize: '14px',
                    lineHeight: '16px',
                    letterSpacing: '1px',
                  }}
                >
                  Number
                  <Box sx={{ color: '#FFF', fontWeight: '500' }}>{`#${item.ethscriptionNumber}`}</Box>
                </Box>

                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    color: 'rgba(255, 255,255, 0.44)',
                    fontSize: '14px',
                    lineHeight: '16px',
                    letterSpacing: '1px',
                    marginBottom: '10px',
                  }}
                >
                  Amount
                  <Box sx={{ color: '#FFF', fontWeight: '500' }}>{Number(item.amount).toLocaleString()}</Box>
                </Box>

                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    color: 'rgba(255, 255,255, 0.44)',
                    fontSize: '14px',
                    lineHeight: '16px',
                    letterSpacing: '1px',
                  }}
                >
                  Created
                  <Box sx={{ color: 'rgba(255,255,255,0.8)', fontWeight: '500' }}>
                    {dayjs(item.blockTime).format('YYYY/MM/DD HH:mm:ss')}
                  </Box>
                </Box>
              </Box>
            </Box>
          );
        })}
      </Box>
    </InfiniteScroll>
  );
};

export default ResultArea;
