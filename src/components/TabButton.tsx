// ============================================================================
// 【TabButton】选项卡 Tab 按鈕组件
// ----------------------------------------------------------------------------
// 在默认 MUI Button 基础上添加 active 属性：
//   active=true  → 背景 #4a4c52（深灰）、文字白色（选中状态）
//   active=false → 背景 #36383e（浅灰）、文字半透明（未选中）
// 移动端 px 较小，桌面端正常
// 扩展性：sxProps 可以覆盖默认样式
// ============================================================================
import { Button, ButtonProps, useMediaQuery } from '@mui/material';

type TabButtonProps = {
  active: boolean;
} & ButtonProps;
const TabButton = (props: TabButtonProps) => {
  const isMobile = useMediaQuery('(max-width:750px)');
  return (
    <Button
      sx={{
        backgroundColor: props.active ? '#4a4c52' : '#36383e',
        color: props.active ? '#fff' : 'rgba(255,255,255,0.45)',
        textTransform: 'none',
        whiteSpace: 'nowrap',
        px: isMobile ? '10px' : '16px',
        fontWeight: 500,
        '&:hover': {
          background: '#4a4c52',
        },
        ...props.sx,
      }}
      {...props}
    >
      {props.children}
    </Button>
  );
};
export default TabButton;
