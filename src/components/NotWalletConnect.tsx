// ============================================================================
// 【NotWalletConnect】未连接钱包时的占位提示组件
// ----------------------------------------------------------------------------
// 与 WalletConnectButton 的区别：
//   - WalletConnectButton：包裹子组件，未连接时替换渲染
//   - NotWalletConnect：独立占位组件，显示警告图标 + 文字 + 连接按鈕
// 使用场景：页面中复杂内容区域无法加载时（如资产列表、持仓列表）
// ============================================================================
import { Box, Button, Typography } from '@mui/material';: React.FC<INotWalletConnect> = () => {
  const { openConnectModal } = useConnectModal();
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '24px' }}>
      <WarnSVG />
      <Typography>Wallet is disconnected</Typography>
      <Button
        sx={{
          borderRadius: '46px',
          background: '#D5E970',
          display: 'flex',
          padding: ' 10px 16px',
          alignItems: 'flex-start',
          color: '#171A1F',
          fontFamily: 'HarmonyOS Sans',
          fontSize: '14px',
          fontWeight: 500,
          transition: 'all 0.8s ease-in-out',
          '&:hover': {
            fontWeight: '600',
            background: '#D5E970',
          },
        }}
        onClick={openConnectModal}
      >
        Connect Wallet
      </Button>
    </Box>
  );
};

export default NotWalletConnect;
