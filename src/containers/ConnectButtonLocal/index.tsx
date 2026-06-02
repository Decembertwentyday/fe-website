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
        // Note: If your app doesn't use authentication, you
        // can remove all 'authenticationStatus' checks
        const ready = mounted && authenticationStatus !== 'loading';
        const emojiInfo = account?.address && emojiAvatarForAddress(account?.address);
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
