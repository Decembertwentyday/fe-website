// ============================================================================
// 【app/tokens/ResultArea.tsx】Token 铭文查询结果展示区（无限滚动）
// ----------------------------------------------------------------------------
// 职责：
//   接收外部传入的铭文数据并渲染卡片列表，支持无限滚动加载更多。
//   本组件不发起任何请求，只负责展示；加载更多由父组件通过 loadMore 回调实现。
//
// Props：
//   data: GetOwnerData — 包含 ethscriptions 数组和 page 分页信息
//   loadMore: () => void — 滚动到底时触发（父组件里增加 page.index）
//
// 卡片点击行为：
//   点击铭文卡片 → window.open 打开外部 Ethscription 浏览器
//   URL = URL_CONFIG[chainId].etherscription + '/ethscriptions/' + ethscriptionId
//
// 卡片内容结构：
//   - 顶部：EthscriptionLabel（集合名+类别图标）+ 认证勾（verified）
//   - 分割线
//   - 底部数据：Number（铭文序号）/ Amount（铭文数量）/ Created（创建时间）
//
// 布局要点：
//   - 左右各 12% 留白，整体居中
//   - 每列固定 306px 宽，自动换行（auto-fill）
// ============================================================================

'use client';

import { Box, Divider } from '@mui/material';
import InfiniteScroll from 'react-infinite-scroll-component';
import SwooshGreenSVG from '@/assets/images/swoosh-icon-green.svg';
import { GetOwnerData } from '@/services/ethscriptions/types';
import dayjs from 'dayjs';
import { URL_CONFIG } from '@/constants';
import { useChainId } from 'wagmi';
import EthscriptionLabel from '@/components/EthscriptionLabel';

interface IResultArea {
  data: GetOwnerData; // 铭文列表数据（ethscriptions + page）
  loadMore: () => void; // 滚动到底时触发加载下一页
}

const ResultArea: React.FC<IResultArea> = ({ data, loadMore }) => {
  // isHasMore：总数 > 已加载数量 → 还有更多可以加载
  const isHasMore = Number(data.page.total) > data.ethscriptions.length;
  const chainId = useChainId(); // 当前链 ID（决定外部链接的域名）

  return (
    // 无限滚动：滚动到底时调用 loadMore（父组件实现加载下一页）
    <InfiniteScroll
      style={{ marginBottom: '80px' }}
      dataLength={data.ethscriptions.length} // 告知组件当前已有多少条
      next={loadMore}
      hasMore={isHasMore}
      loader={<Box sx={{ textAlign: 'center', padding: '40px 0', fontWeight: 500 }}>Loading...</Box>}
      endMessage={
        <Box sx={{ textAlign: 'center', padding: '40px 0', fontWeight: 500 }}> Yay! You have seen it all</Box>
      }
    >
      <Box
        sx={{
          width: '100%',
          p: '28px 12% 0 12%',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, 306px)',
          justifyContent: 'center',
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
                // 点击卡片 → 新标签打开 Ethscription 浏览器查看铭文详情
                const _url = `${URL_CONFIG[chainId].etherscription}/ethscriptions/${item.ethscriptionId}`;
                window.open(_url);
              }}
            >
              <Box
                sx={{
                  padding: '16px 20px 17px 20px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <EthscriptionLabel collectionName={item.collectionName} category={item.category} icon={item.icon} />
                {item.verified && <SwooshGreenSVG />}
              </Box>
              <Divider />
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
