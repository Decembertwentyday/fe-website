// 【容器组件 - 跨链桥链信息选择项】
// 作用：通用的链或网络指示组件，用作在桥接界面上显示 "From" (从) 或 "To" (到) 哪个网络（如：Facet / Ethereum）。
// 工作原理：接收 `type` ('From' | 'To')、链名称 `name`，以及链图标 `icon` 节点，渲染一个横向卡片块。
import { Box, Stack, Typography } from '@mui/material';

interface IChainItem {
  type: 'From' | 'To';
  name: string;
  icon: React.ReactNode;
}

const ChainItem: React.FC<IChainItem> = ({ icon, type, name }) => {
  return (
    <Stack direction="row" gap="6px" alignItems="center">
      {icon}
      <Box>
        <Typography>{type}</Typography>
        <Typography>{name}</Typography>
      </Box>
    </Stack>
  );
};

export default ChainItem;
