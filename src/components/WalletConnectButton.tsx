// ============================================================================
// 【WalletConnectButton】钱包权限包裹组件
// ----------------------------------------------------------------------------
// 设计模式：守卫组件（Guard Pattern）
//   - 已连接钱包：渲染 children（正常操作按鈕）
//   - 未连接钱包：渲染 "Connect Wallet" 按鈕，点击弹出 RainbowKit 连接弹窗
// 用法：
//   <WalletConnectButton>
//     <BuyButton />    ← 只有连接钱包后才显示
//   </WalletConnectButton>
// openConnectModal 来自 RainbowKit（动态导入，包括 MetaMask/WalletConnect 等多种钉包）
// ============================================================================
import { Box, BoxProps, Button, Typography } from '@mui/material';

import WarnSVG from '@/assets/icons/warn.svg';
import { useConnectModal } from '@rainbow-me/rainbowkit';
import { useAccount } from 'wagmi';

interface IWalletConnectButton {
  children: React.ReactNode;
}

const WalletConnectButton: React.FC<IWalletConnectButton & BoxProps> = ({ children, sx }) => {
  const { openConnectModal } = useConnectModal();
  const { address } = useAccount();
  return address ? (
    children
  ) : (
    <Button
      variant="contained"
      fullWidth
      disableElevation
      sx={{
        height: '40px',
        fontSize: '14px',
        fontWeight: 500,
        textTransform: 'capitalize',
        ...sx,
      }}
      onClick={openConnectModal}
    >
      Connect Wallet
    </Button>
  );
};

export default WalletConnectButton;
