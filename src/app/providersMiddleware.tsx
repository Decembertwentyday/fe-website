/**
 * ==============================================================
 * 文件：src/app/providersMiddleware.tsx
 * 作用：全局的"用户信息加载器"
 *
 * 作用类比：
 *   就像进入一个商场，刷卡机（门）识别了你的会员卡（钱包地址），
 *   就会去后台查你是不是 VIP（OG Pass），然后记录下来。
 *   这个组件就是那个"自动查询 VIP 资格"的逻辑。
 *
 * 这个组件做了什么？
 *   1. 监听钱包地址变化（useAccount hook）
 *   2. 每当地址变化（连接新钱包/切换地址），就向后端查询该地址是否有 OG Pass
 *   3. 把查询结果存入全局状态（GlobalStore.setIsOGPass）
 *   4. 其余什么都不做——它只是透明地渲染 children
 *
 * 为什么不在 providers.tsx 里做这个？
 *   关注点分离原则：providers.tsx 专注于"注入全局能力"，
 *   这个组件专注于"根据用户地址获取用户信息"，逻辑职责更清晰。
 * ==============================================================
 */

'use client';
// ↑ 客户端组件声明（使用了 useEffect、useAccount 等客户端 Hook）

import { Fragment, useEffect } from 'react';
// ↑ Fragment：空包装容器，不会渲染任何 DOM 元素
// useEffect：副作用 Hook，在组件渲染后执行某些操作

import * as dayjs from 'dayjs';
import duration from 'dayjs/plugin/duration';
// ↑ 这里引入了 dayjs 但似乎未使用，可能是历史遗留

import { useAccount } from 'wagmi';
// ↑ wagmi 的 Hook，返回当前连接钱包的信息
// 最常用的属性：address（钱包地址）、isConnected（是否已连接）

import * as GlobalStore from '@/stores/GlobalStore';
// ↑ 全局状态 store（用于存储 OG Pass 资格）

import services from '@/services';
// ↑ 统一的服务层实例

dayjs.extend(duration);
// ↑ 初始化 dayjs 的 duration 插件（这里实际未用到，历史遗留代码）

/**
 * ProvidersMiddleware 组件
 * 这个组件的特殊之处：它没有自己的 UI，只有逻辑
 * 它把 children 原封不动地渲染出来，自己"隐形地"在后台工作
 */
export function ProvidersMiddleware({ children }: { children: React.ReactNode }) {
  const { address } = useAccount();
  // ↑ 解构赋值：从 useAccount() 的返回值中取出 address
  // address 是当前连接的钱包地址（如 '0xAbCd...1234'）
  // 如果钱包未连接，address 是 undefined

  /**
   * 获取用户的 DID（去中心化身份）信息
   * 主要目的：检查该地址是否持有 OG Pass（早期用户特权）
   */
  async function getDiDUserInfo() {
    const response = await services.did.getUserInfo((address as string) ?? '');
    // ↑ 调用后端接口，查询地址对应的用户信息
    // (address as string) 是 TypeScript 类型断言：告诉编译器"address 是 string"
    // ?? '' 是空值合并：如果 address 是 undefined，就传空字符串

    if (response?.code == 200) {
      // ↑ response?.code：可选链，防止 response 是 undefined 时报错
      // == 200（双等号，宽松比较）vs === 200（严格比较）
      // 这里用 == 可能是为了同时匹配 200 和 '200'（字符串和数字）

      if (response.data.isOg) {
        // ↑ 如果后端返回 isOg: true，说明该地址是 OG Pass 持有者
        GlobalStore.setIsOGPass(true);
      } else {
        GlobalStore.setIsOGPass(false);
      }
    }
  }

  // 副作用：当 address 变化时，重新查询用户信息
  useEffect(() => {
    getDiDUserInfo();
    // ↑ 每次 address 变化（连接钱包、切换地址、断开钱包），都重新查询
  }, [address]);
  // ↑ 依赖数组 [address]：只有 address 变化时才重新执行这个 effect

  // 透明渲染：这个组件自身不渲染任何 DOM，只是包裹 children
  return <Fragment>{children}</Fragment>;
  // ↑ Fragment 相当于一个"空容器"，不产生额外的 HTML 元素
  // 等价于 <>{children}</>（短写法）
}
