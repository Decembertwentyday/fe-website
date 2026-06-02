// ============================================================================
// 【containers/TokenTables.tsx】Token 详情页 Tab 切换表格容器
// ----------------------------------------------------------------------------
// 职责：
//   在 Token 详情页（/tokens/info）中展示两个列表：
//   - Holders（持有者列表）：该 Token 被哪些地址持有、各持有多少
//   - Transfers（转账记录）：该 Token 所有转账的历史记录
//   通过顶部 TabButton 按钮组切换两个视图。
//
// Props（三个参数全部透传给子容器，子容器用来查询数据）：
//   p   = 协议名（如 'erc-20'）
//   tick = 代币符号（如 'ordi'）
//   ca  = 合约地址（可选，某些协议需要）
//
// Tab 切换原理：
//   useState 存储 currentTab（初始为 TokenTab.Holders）
//   点击 TabButton → setCurrentTab → 条件渲染 HoledersList 或 TransferList
//
// TokenTab 枚举：
//   相比直接用字符串比较，用枚举可以防止拼写错误，编译器能帮你检查
// ============================================================================

import { Box, Button, ButtonGroup, ButtonProps } from '@mui/material';
import { useState } from 'react';

import HoledersList from './HoldersList';
import TransferList from './TransfersList';
import TabButton from '@/components/TabButton';

// 枚举：定义 Tab 的两个选项，避免硬编码字符串
enum TokenTab {
  Holders = 'Holders',
  Transfers = 'Transfers',
}

interface ITokenOverview {
  p: string; // 协议名（如 'erc-20'）
  tick: string; // 代币符号（如 'ordi'）
  ca?: string; // 合约地址（可选）
}

const TokenTables: React.FC<ITokenOverview> = ({ p, tick, ca }) => {
  // currentTab：控制显示哪个 Tab，默认 Holders
  const [currentTab, setCurrentTab] = useState<TokenTab>(TokenTab.Holders);
  return (
    <Box
      sx={{
        margin: '0 auto',
        mt: '60px',
        mb: '40px',
        borderRadius: '12px',
        border: '1px solid #2F343E',
        padding: '40px',
        boxSizing: 'border-box',
        background: '#202229',
      }}
    >
      {/* Tab 按钮组（居中）：Holders / Transfers 互斥切换 */}
      <Box display="flex" mb="40px" alignItems="center" justifyContent="center">
        <ButtonGroup
          sx={{
            // 去掉按钮组中间的分隔线（设计风格）
            '& .MuiButtonGroup-grouped:not(:last-of-type)': {
              borderRight: 'none',
            },
          }}
          variant="contained"
        >
          {/* active prop 决定是否高亮（当前选中项会显示荧光黄绿背景）*/}
          <TabButton onClick={() => setCurrentTab(TokenTab.Holders)} active={currentTab === TokenTab.Holders}>
            Holders
          </TabButton>
          <TabButton onClick={() => setCurrentTab(TokenTab.Transfers)} active={currentTab === TokenTab.Transfers}>
            Transfers
          </TabButton>
        </ButtonGroup>
      </Box>
      {/* 条件渲染：根据当前 Tab 显示持有者列表或转账记录 */}
      {currentTab === TokenTab.Holders ? (
        <HoledersList p={p} tick={tick} ca={ca} /> // 持有者列表（DataGrid）
      ) : (
        <TransferList p={p} tick={tick} ca={ca} /> // 转账记录列表（DataGrid）
      )}
    </Box>
  );
};

export default TokenTables;
