// 【钱包适配器 - Gate Wallet】
// 作用：为了将芝麻 (Gate.io) 钱包客户端无缝融合到 @rainbow-me/rainbowkit (RainbowKit) 组件中，
//       实现一键连接以太坊和各类 DApp 网络的特性。
// 原理：定义图标和下载外链，识别并挂载浏览器注入对象 `window.gatewallet` 作为 Web3 Provider；
//       暴露给 wagmi 的 InjectedConnector 使用。
import { Chain, Wallet, getWalletConnectConnector } from '@rainbow-me/rainbowkit';
import { InjectedConnector } from 'wagmi/connectors/injected';
import type { InjectedConnectorOptions } from '@wagmi/core/connectors/injected';
export interface GateWalletOptions {
  chains: Chain[];
}

export const gateWallet = ({ chains, ...options }: GateWalletOptions & InjectedConnectorOptions): Wallet => {
  return {
    id: 'gatewallet',
    name: 'Gate Wallet',
    iconUrl: 'https://gimg2.gateimg.com/image/1654851660739235057_downlod_gate1.svg',
    iconBackground: '#fff',
    installed: (typeof window !== 'undefined' && !!((window as any).gatewallet as any)) || undefined,
    downloadUrls: {
      android: 'https://www.gate.io/mobileapp',
      ios: 'https://www.gate.io/mobileapp',
      chrome:
        'https://chrome.google.com/webstore/detail/gate-wallet/cpmkedoipcpimgecpmgpldfpohjplkpp?utm_source=ext_sidebar&hl=en',
      qrCode: 'https://www.gate.io/mobileapp',
    },
    createConnector: () => {
      const getProvider = () => (typeof window !== 'undefined' ? ((window as any).gatewallet as any) : undefined);

      const connector = new InjectedConnector({
        chains,
        options: { getProvider, ...options },
      });
      return {
        connector,
        // mobile: {
        //   getUri: async () => {
        //     const provider = await connector.getProvider();
        //     // @ts-expect-error
        //     const uri = await new Promise<string>((resolve) => provider.once('display_uri', resolve));
        //     return uri;
        //   },
        // },
        // qrCode: {
        //   getUri: async () => {
        //     const provider = await connector.getProvider();
        //     // @ts-expect-error
        //     const uri = await new Promise<string>((resolve) => provider.once('display_uri', resolve));
        //     return uri;
        //   },
        //   instructions: {
        //     learnMoreUrl: 'https://www.gate.io/web3',
        //     steps: [
        //       {
        //         description: 'We recommend putting My Wallet on your home screen for faster access to your wallet.',
        //         step: 'install',
        //         title: 'Open the Gate Wallet app',
        //       },
        //       {
        //         description:
        //           'Be sure to back up your wallet using a secure method. Never share your secret phrase with anyone.',
        //         step: 'create',
        //         title: 'Create or Import a Wallet',
        //       },
        //       {
        //         description: 'After you scan, a connection prompt will appear for you to connect your wallet.',
        //         step: 'scan',
        //         title: 'Tap the scan button',
        //       },
        //     ],
        //   },
        // },
        extension: {
          instructions: {
            learnMoreUrl: 'https://www.gate.io/web3',
            steps: [
              {
                description: 'We recommend pinning My Wallet to your taskbar for quicker access to your wallet.',
                step: 'install',
                title: 'Install the Gate Wallet extension',
              },
              {
                description:
                  'Be sure to back up your wallet using a secure method. Never share your secret phrase with anyone.',
                step: 'create',
                title: 'Create or Import a Wallet',
              },
              {
                description:
                  'Once you set up your wallet, click below to refresh the browser and load up the extension.',
                step: 'refresh',
                title: 'Refresh your browser',
              },
            ],
          },
        },
      };
    },
  };
};
