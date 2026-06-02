// ============================================================================
// 【SwapChart】Swap 页的 Token 价格走势图（仅大屏显示）
// ----------------------------------------------------------------------------
// 职责：
//   展示当前 Token 的价格走势折线图，以及流动性、成交量等市场统计数据。
//   这个组件只在宽屏（≥1400px）时渲染（父组件 Swap/index.tsx 控制）。
//
// 数据来源：
//   services.marketplace.marketChart(filterRequest) — 市场价格图表接口
//   react-query 的 useQuery 管理请求状态和缓存
//
// 组件树：
//   SwapChart
//   ├── 价格 + 涨跌幅（顶部）
//   ├── LineChart（折线图主体）
//   ├── LineStats（时间周期切换：1d/1w/1m/1y）
//   └── InvestInfo（底部统计：流动性/24h量/24h买/24h卖）
//
// 颜色逻辑：
//   priceChangePercentage24h <= 0 → 红色（跌）
//   priceChangePercentage24h > 0  → 绿色（涨）
// ============================================================================

import { Box, BoxProps, Typography } from '@mui/material';
import BigNumber from 'bignumber.js';

import { MarketChartRequest, categoryType } from '@/services/marketpalce/types';
import { useImmer } from 'use-immer';
import services from '@/services';
import InvestInfo from '../Bridge/InvestInfo';
import LineStats from '../Bridge/LineStats';
import { numberFormatUnit } from '@/utils/numberFormatUnit';
import getTruncate from '@/utils/getTruncate';
import MarketDownSVG from '@/assets/icons/marketDown.svg';
import MarketUpSVG from '@/assets/icons/marketUp.svg';
import EthLogo from '@/assets/icons/eth16.svg';
import LineChart from '@/components/LineChart';
import { useQuery } from 'react-query';

interface ISwapChart {
  category: categoryType; // 市场类别（影响图表接口参数）
  collectionName: string; // 集合名称（图表接口参数）
  tokenAddress?: string; // Token 合约地址（图表接口参数）
  sx: BoxProps['sx']; // 外部样式（父组件传入 flex: 1）
}

const SwapChart: React.FC<ISwapChart> = ({ category, tokenAddress, collectionName, sx }) => {
  // filterRequest：图表接口的请求参数，useImmer 管理
  const [filterRequest, setFilterRequest] = useImmer<MarketChartRequest>({
    category,
    collectionName,
    period: '1d', // 默认显示 1 天的数据
    contractAddress: tokenAddress,
  });

  // useQuery 获取图表数据
  // queryKey 包含 filterRequest，period 变化时自动重新请求
  // enabled: collectionName != ''：集合名为空时不发请求（防止无效请求）
  // refetchOnWindowFocus: false：切换标签页不重新请求
  const marketData = useQuery({
    queryKey: ['getMarketchartSwap', filterRequest],
    queryFn: () => services.marketplace.marketChart(filterRequest),
    enabled: collectionName != '',
    refetchOnWindowFocus: false,
  });

  // 从接口数据中提取图表数据，设置默认值防止 undefined 报错
  const lineData = marketData.data?.data || {
    prices: [],
    currentPrice: '0',
    priceChange24h: 0,
    priceChangePercentage24h: 0,
    marketCap: '0',
    volume24h: '0',
    high24h: '0',
    low24h: '0',
    liquidity: '0',
    buy24h: '0',
    sell24h: '0',
  };

  // numberFormatUnit：将大数字格式化为带单位的形式
  // 例如：1500000 → { value: 1.5, unit: 'M' }
  const { value: liquidityValue, unit: liquidityUnit } = numberFormatUnit(lineData.liquidity);
  const { value: volume24Value, unit: volume24Unit } = numberFormatUnit(lineData.volume24h);
  const { value: buy24Value, unit: buy24Unit } = numberFormatUnit(lineData.buy24h);
  const { value: sell24Value, unit: sell24Unit } = numberFormatUnit(lineData.sell24h);

  // 涨跌颜色：跌→红，涨→绿（同时影响折线图颜色和百分比文字颜色）
  const percentage24hColor = new BigNumber(lineData.priceChangePercentage24h).lte(0) ? '#D8346F' : '#32CA8A';

  return (
    <Box sx={sx}>
      {/* 顶部：当前价格 + 24h 涨跌幅 + 涨跌箭头 */}
      <Box display="flex" alignItems="center" mb="34px">
        <Typography color="#fff" sx={{ fontSize: '20px', fontWeight: '700', marginRight: '13px' }}>
          {`$${getTruncate(lineData.currentPrice, 4)}`}
        </Typography>

        <Box
          color={percentage24hColor}
          display="flex"
          alignItems="center"
          justifyContent="center"
          style={{ gap: '2px' }}
        >
          {/* 24h 涨跌百分比：priceChangePercentage24h * 100 转为百分比显示 */}
          <Typography sx={{ fontSize: '16px', fontWeight: '500' }}>
            {`${new BigNumber(lineData.priceChangePercentage24h).multipliedBy(100).toFixed(2)}%`}
          </Typography>
          {/* 涨跌箭头图标 */}
          {new BigNumber(lineData.priceChangePercentage24h).lte(0) ? <MarketDownSVG /> : <MarketUpSVG />}
        </Box>
      </Box>

      {/* 折线图主体：价格数据转为数字类型传入（usdPrice 原始类型是 string） */}
      <LineChart
        dataType={filterRequest.period}
        data={lineData.prices.map((a) => ({
          ...a,
          usdPrice: Number(a.usdPrice), // string → number
        }))}
        color={percentage24hColor} // 折线颜色跟随涨跌
        isToolip
        isXAxis
        style={{ height: '260px', width: '100%', paddingBottom: '48px' }}
      />

      {/* 时间周期选择器：1d / 1w / 1m / 1y */}
      <LineStats
        onSelect={(val) => {
          setFilterRequest((state) => {
            state.period = val; // 切换周期 → filterRequest 变化 → useQuery 重新请求
          });
        }}
      />

      {/* 底部统计面板：流动性、24h成交量、24h买入量、24h卖出量 */}
      <InvestInfo
        data={[
          {
            label: 'Liquidity',
            value: `$${getTruncate(String(liquidityValue), 0)} ${liquidityUnit}`,
          },
          {
            label: '24h Volume',
            value: (
              <Box display="flex" alignItems="center">
                {`${getTruncate(String(volume24Value), 2)} ${volume24Unit}`}
                <EthLogo />
              </Box>
            ),
          },
          {
            label: '24h Buy',
            value: `$${getTruncate(String(buy24Value), 0)} ${buy24Unit}`,
          },
          {
            label: '24h Sell',
            value: `$${getTruncate(String(sell24Value), 0)} ${sell24Unit}`,
          },
        ]}
      />
    </Box>
  );
};

export default SwapChart;
