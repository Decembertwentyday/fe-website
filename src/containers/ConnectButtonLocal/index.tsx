/**
 * ==============================================================
 * 文件：src/containers/ConnectButtonLocal/index.tsx
 * 作用：自定义样式的「连接钱包」按钮（基于 RainbowKit ConnectButton.Custom）
 *
 * 为什么不用 RainbowKit 默认按钮？
 *   默认样式与 EtchMarket 品牌色（#D5E970 黄绿）不一致，
 *   Custom 模式可以完全控制 UI，同时保留 RainbowKit 的钱包列表、链切换、SIWE 登录能力。
 *
 * 三种 UI 状态：
 *   1. 未连接 → 黄绿「Connect Wallet」按钮 → 点击 openConnectModal
 *   2. 错误网络 → 红色「Wrong network」→ 点击 openChainModal 切换链
 *   3. 已连接且 SIWE 已认证 → 地址头像 + 下拉菜单（AccountMenu）
 *
 * ready 与 opacity:0 的技巧：
 *   RainbowKit  hydration 前 mounted=false，先隐藏按钮避免「闪一下错误状态」
 *   这是 RainbowKit 官方 Custom 按钮文档推荐的做法
 *
 * emojiAvatarForAddress：
 *   根据地址哈希生成固定 emoji + 背景色，让用户快速识别自己的钱包（类似 MetaMask 头像）
 * ==============================================================
 */

import { Box, Button, useMediaQuery } from '@mui/material';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { emojiAvatarForAddress } from '@/containers/ConnectButtonLocal/emojiAvatar';
import AccountMenu from './AccountMenu';

const ConnectButtonLocal = () => {
  const matches = useMediaQuery('(max-width:750px)');

  return (
    <ConnectButton.Custom>
      {({ account, chain, openAccountModal, openChainModal, openConnectModal, authenticationStatus, mounted }) => {
        // ready：RainbowKit 已完成客户端挂载，且 SIWE 认证状态不在 loading 中
        const ready = mounted && authenticationStatus !== 'loading';
        const emojiInfo = account?.address && emojiAvatarForAddress(account?.address);
        // connected：钱包已连 + 链正确 + （若启用 SIWE）已完成 Sign-In
        const connected =
          ready && account && chain && (!authenticationStatus || authenticationStatus === 'authenticated');
        return (
          <div
            {...(!ready && {
              'aria-hidden': true,
              style: {
                opacity: 0,
                pointerEvents: 'none',
                userSelect: 'none',
              },
            })}
          >
            {(() => {
              if (!connected) {
                return (
                  <Button
                    sx={{
                      px: '12px',
                      height: '40px',
                      background: '#D5E970',
                      borderRadius: '12px',
                      fontWeight: '700',
                      color: 'black',
                      textTransform: 'none',
                      fontSize: '16px',
                      '&:hover': {
                        background: '#D5E970',
                        transform: 'scale(1.05)',
                        transition: '0.3s',
                      },
                    }}
                    onClick={openConnectModal}
                    type="button"
                  >
                    Connect Wallet
                  </Button>
                );
              }
              if (chain.unsupported) {
                return (
                  <Button
                    onClick={openChainModal}
                    sx={{
                      px: '12px',
                      height: '40px',
                      background: '#FF494A',
                      borderRadius: '12px',
                      fontWeight: '700',
                      color: 'white',
                      textTransform: 'none',
                      fontSize: '16px',
                      '&:hover': {
                        background: '#FF494A',
                        transform: 'scale(1.05)',
                        transition: '0.3s',
                      },
                    }}
                    endIcon={<ExpandMoreIcon sx={{ fontSize: '20px', fontWeight: 'bold' }} />}
                  >
                    Wrong network
                  </Button>
                );
              }
              return (
                <div style={{ display: 'flex', gap: 12 }}>
                  {account.address && (
                    <AccountMenu>
                      <Box
                        onClick={() => {
                          matches && openAccountModal();
                        }}
                        sx={{
                          position: 'relative',
                          display: 'flex',
                          gap: '6px',
                          cursor: 'pointer',
                          '&:hover': {
                            transform: 'scale(1.05)',
                            transition: '0.3s',
                          },
                        }}
                      >
                        <Box
                          sx={{
                            width: '24px',
                            height: '24px',
                            borderRadius: '12px',
                            fontSize: '13px',
                            textAlign: 'center',
                            lineHeight: '24px',
                            background: emojiInfo && emojiInfo.color,
                          }}
                        >
                          {emojiInfo && emojiInfo.emoji}
                        </Box>
                        <Box fontSize={'16px'} fontWeight={'bold'}>
                          {account.displayName}
                        </Box>
                        <ExpandMoreIcon sx={{ width: '24px', height: '24px' }} />
                      </Box>
                    </AccountMenu>
                  )}
                </div>
              );
            })()}
          </div>
        );
      }}
    </ConnectButton.Custom>
  );
};

export default ConnectButtonLocal;
