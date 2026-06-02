// ============================================================================
// 【LineChat】Bridge 页面的价格走势图区域（注意：LineChat 是原代码的拼写错误，应为 LineChart）
// ----------------------------------------------------------------------------
// ⚠️ ⚠️ ⚠️ 重要警告：此组件使用的全部是硬编码假数据！⚠️ ⚠️ ⚠️
//
// 这说明 Bridge 功能目前仍处于开发中/未完成状态。
// 具体假数据包括：
//   1. lineData：写死的固定数组（只有 4 个点），不是真实价格数据
//   2. 价格 "$12,456.44"：写死的字符串，不是真实 ETH 价格
//   3. 涨跌显示逻辑：`false ? ... : ...`，始终走 else 分支（永远显示跌）
//   4. LineStats.onSelect 里的 getCoinInfo/getMarketChart 调用都被注释掉了（功能未接入）
//   5. InvestInfo 里的 TVL/Volume 等数据全部是写死的字符串（如 `$802.2M`）
//
// 职责（设计意图）：
//   展示 ETH 在 Ethereum 主网的价格走势和市场统计，
//   供用户在决定跨链存入之前了解当前市场行情。
//
// 组件树：
//   LineChat
//   ├── 代币名称（ETH + Ethereum 标签 + ShareInvest 分享按钮）
//   ├── 价格 + 涨跌幅（写死数据）
//   ├── LineChart（折线图，使用写死的 lineData）
//   ├── LineStats（时间周期按钮，onSelect 里功能已注释掉）
//   └── InvestInfo（统计面板，全部写死数据）
// ============================================================================

import { Box, Typography } from '@mui/material';

import ChainEthSVG from '@/assets/icons/chain_eth.svg';
import LineChart from './LineChart';
import ShareInvest from '@/components/ShareInvest';
import MarketDownSVG from '@/assets/icons/marketDown.svg';
import MarketUpSVG from '@/assets/icons/marketUp.svg';
import LineStats from './LineStats';
import InvestInfo from './InvestInfo';

interface ILineChat {}

// ⚠️ 假数据：只有 4 个点，不是真实 ETH 历史价格
// 真实数据应从 API 获取并根据 period 切换
const lineData = [
  { num: 1, price: 2 },
  { num: 2, price: 100 },
  { num: 3, price: 40 },
  { num: 4, price: 80 },
];

const LineChat: React.FC<ILineChat> = () => {
  return (
    <Box sx={{ flex: 1 }}>
      {/* 代币名称区：ETH 图标 + 名称 + 分享按钮 */}
      <Box mb="12px" display="flex" alignItems="center" justifyContent="space-between">
        <Box display="flex" alignItems="center">
          <ChainEthSVG />
          <Typography
            color="#fff"
            sx={{ fontSize: '28px', fontFamily: 'Inter', fontWeight: '700', margin: '0 8px' }}
            style={{ textTransform: 'uppercase' }}
          >
            ETH
          </Typography>
          <Typography
            color="rgba(255,255,255,0.45)"
            sx={{ fontSize: '16px', fontWeight: '400', fontFamily: 'HarmonyOS Sans' }}
          >
            Ethereum
          </Typography>
        </Box>
        <ShareInvest />
      </Box>

      {/* 价格 + 涨跌幅
          ⚠️ 全部硬编码：
          - "$12,456.44" 是写死的价格，不是真实 ETH 价格
          - "-7.33" 是写死的涨跌值
          - `false ? '#32CA8A' : '#D8346F'` 条件永远为 false → 始终显示红色（跌）
          - 箭头图标也是 false ? 下跌图标 : 上涨图标 → 永远显示上涨箭头（逻辑写反了？）
          → 这些都需要接入真实数据接口后修正 */}
      <Box display="flex" alignItems="center" mb="34px">
        <Typography color="#fff" sx={{ fontSize: '20px', fontWeight: '700', marginRight: '13px' }}>
          $12,456.44
        </Typography>
        <Typography color="rgba(255,255,255,0.65)" sx={{ fontSize: '16px', fontWeight: '500' }}>
          -7.33
        </Typography>
        <Box
          color={false ? '#32CA8A' : '#D8346F'}
          display="flex"
          alignItems="center"
          justifyContent="center"
          style={{ marginLeft: '2px' }}
        >
          {false ? <MarketDownSVG /> : <MarketUpSVG />}
        </Box>
      </Box>

      {/* 折线图：使用上方写死的 lineData，颜色固定红色 */}
      <LineChart
        data={lineData}
        color="#D8346F"
        isToolip
        isXAxis
        style={{ height: '260px', width: '100%', paddingBottom: '48px' }}
      />

      {/* 时间周期切换按钮（1d/1w/1m/1y）
          ⚠️ onSelect 里的实际请求函数（getCoinInfo/getMarketChart）全被注释掉了
          → 切换周期后图表不会更新，功能未接入 */}
      <LineStats
        onSelect={(val) => {
          // getMarketChart(val);  // ← 未实现：获取图表数据

          // 计算 coinDays（保留了计算逻辑，但最终的请求被注释掉了）
          let coinDays = 1;
          if (val == '1w') {
            coinDays = 7;
          } else if (val == '1m') {
            coinDays = 30;
          } else if (val == '1y') {
            coinDays = 365;
          }

          // getCoinInfo(coinDays);  // ← 未实现：获取统计数据
        }}
      />

      {/* 底部统计面板
          ⚠️ 全部写死的假数据（TVL/Volume/52w low/52w high），不是真实数据 */}
      <InvestInfo
        data={[
          {
            label: 'TVL',
            value: `$802.2M`, // ⚠️ 假数据
          },
          {
            label: '24h Volume',
            value: `$562.2M`, // ⚠️ 假数据
          },
          {
            label: '52w low',
            value: `$837.2`, // ⚠️ 假数据
          },
          {
            label: '52w high',
            value: `$8.2K`, // ⚠️ 假数据
          },
        ]}
      />
    </Box>
  );
};

export default LineChat;
