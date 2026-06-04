/**
 * ==============================================================
 * 文件：src/containers/ConnectWallet.tsx
 * 作用：钱包连接入口的「薄包装组件」
 *
 * 为什么单独一层，不直接在 Header 里写 ConnectButtonLocal？
 *   1. 关注点分离：Header 管导航，ConnectWallet 管「连接钱包」这一块 UI
 *   2. 复用：其他页面（如 Modal 内）也可以 import ConnectWallet，不用重复引 RainbowKit
 *   3. 以后换 UI（比如只显示图标）只改这一处
 *
 * 实际逻辑在 ConnectButtonLocal 里（自定义 RainbowKit ConnectButton.Custom）
 * ==============================================================
 */

'use client';

import { Box, useMediaQuery } from '@mui/material';
import ConnectButtonLocal from './ConnectButtonLocal';

const ConnectWallet = () => {
  return (
    <Box>
      <ConnectButtonLocal />
    </Box>
  );
};

export default ConnectWallet;
