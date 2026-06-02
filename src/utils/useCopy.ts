// ============================================================================
// 【useCopy】复制到剪贴板自定义 Hook
// ----------------------------------------------------------------------------
// 用法：const [isCopy, copy] = useCopy(1500);
//       <Button onClick={() => copy(address)}>{isCopy ? '✓ 已复制' : '复制'}</Button>
//
// 返回 [isCopy, copyHandler]：
//   isCopy       = 是否正在复制状态（timeout 毫秒后自动变回 false）
//   copyHandler  = async 函数，调用 navigator.clipboard.writeText 写入剪贴板
// timeout 默认 1000ms（1秒后按钮恢复）
// ============================================================================
import { useState } from 'react';

type CopyHandlerType = (text: string) => Promise<void>;
type CopyHookReturnType = [boolean, CopyHandlerType];
type CopyHookType = (timeout?: number) => CopyHookReturnType;

export const useCopy: CopyHookType = (timeout) => {
  const [isCopy, setCopy] = useState<boolean>(false);

  const copyHandler: CopyHandlerType = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopy(true);

      setTimeout(() => {
        setCopy(false);
      }, timeout || 1000);
    } catch (e) {
      setCopy(false);
    }
  };

  return [isCopy, copyHandler];
};
