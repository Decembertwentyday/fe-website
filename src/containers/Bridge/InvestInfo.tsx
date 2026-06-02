// 【容器组件 - 桥接投资/质押信息面板】
// 作用：渲染跨链桥场景或质押场景下的统计信息项。
// 工作原理：接收包含 `label` 和 `value` 的 `data` 数组，利用自动换行与流式布局进行信息卡片的展示
// （例如：展示质押的 APY、总质押量、个人质押量等数据）。
import React from 'react';
import { Box, Typography } from '@mui/material';

interface IInvestInfo {
  data: { label: string; value: React.ReactNode }[];
}

const InvestInfo: React.FC<IInvestInfo> = ({ data }) => {
  return (
    data.length > 0 && (
      <Box
        display="flex"
        alignItems="center"
        justifyContent="space-between"
        rowGap="16px"
        sx={{ flexWrap: { xs: 'wrap', sm: 'nowrap' } }}
      >
        {data.map((item, index) => (
          <Box key={index} sx={{ width: { xs: '50%', sm: 'auto' } }}>
            <Typography
              mb="4px"
              sx={{ fontSize: '14px', fontWeight: 500, fontFamily: 'Poppins', color: 'rgba(255,255,255,0.45)' }}
            >
              {item.label}
            </Typography>
            <Box sx={{ fontSize: '20px', fontWeight: 500, fontFamily: 'Poppins', color: '#fff' }}>{item.value}</Box>
          </Box>
        ))}
      </Box>
    )
  );
};

export default InvestInfo;
