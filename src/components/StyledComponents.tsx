// 【StyledComponents.tsx】全局共用样式扩展组件
// StyledTooltip：在默认 MUI Tooltip 基础上覆盖 fontSize、padding、borderRadius
// 用法：<StyledTooltip title="...">。其他样式组件可继续在此文件扩展

import { Tooltip, TooltipProps, styled } from '@mui/material';

const StyledTooltip = styled(({ className, ...props }: TooltipProps) => (
  <Tooltip {...props} classes={{ popper: className }} />
))`
  & .MuiTooltip-tooltip {
    font-size: 14px;
    padding: 12px;
    border-radius: 8px;
  }
`;

export { StyledTooltip };
