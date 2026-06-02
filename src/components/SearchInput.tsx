// ============================================================================
// 【搜索输入框】项目通用的搜索组件
// ----------------------------------------------------------------------------
// 使用场景：市场页、搜索页等需要输入查询的地方
//
// 三个回调（不同事件触发不同回调，让使用者灵活控制）：
//   onEnter → 用户按下回车时（示意“我要搜索”）
//   onClick → 用户点击右侧搜索图标时
//   onClear → 用户点击清空按钮或清空输入时
//
// 为什么用 useRef 不用 useState：
//   - useState 会导致每次按键都重渲染整个组件（特别输入框动画可能抑郁）
//   - useRef 仅存储 DOM 引用，不触发重渲染，性能更好
//   - 只在 onInput/onKeyUp/onClick 时才去读 inputRef.current.value，不需要响应式状态
//
// 为什么另外用 isClear 状态：
//   - 控制“清空按钮”是否显示（UI 需要响应式更新 → 必须用 useState）
//
// 设计亮点：
//   - :focus-within 伪类：输入框内部任何元素获得焦点时，外框嵌亦变为亮黄边框
//   - trim() 去除首尾空格，避免“用户输了一个空格就触发搜索”这种坟体验
// ============================================================================

'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { Box, Divider, IconButton, InputBase, InputBaseProps } from '@mui/material';

import ClearSVG from '@/assets/images/clear-icon.svg';
import SearchSVG from '@/assets/images/search-icon.svg';

interface ISearchInput {
  onClear: () => void; // 清空回调
  onClick: (val: string) => void; // 点击搜索图标回调
  onEnter: (val: string) => void; // 按回车回调
}

// 交锱类型：同时接受自定义 props 和 MUI InputBase 原生 props（如 placeholder/sx）
const SearchInput: React.FC<ISearchInput & InputBaseProps> = ({
  onClick,
  onClear,
  onEnter,
  defaultValue,
  placeholder,
  sx,
}) => {
  // 输入框 DOM 引用（读取当前输入值，不触发重渲染）
  const inputRef = useRef<HTMLInputElement>();
  // 是否显示“清空”按钮（输入有内容时才显示）
  const [isClear, setIsClear] = useState<boolean>(false);

  return (
    <Box
      sx={{
        p: '2px 4px',
        display: 'flex',
        alignItems: 'center',
        width: 640, // 默认宽度，可被传入的 sx 覆盖
        height: 52,
        borderRadius: '6px',
        border: '1px solid #2F343E',
        background: '#202229',
        transition: 'all 0.2s ease-in-out', // 平滑过渡边框颜色
        // 【亮点】:focus-within 是 "后代元素获得焦点时父元素也响应" 的 CSS 伪类
        ':focus-within': {
          border: '1px solid #E5FF65', // 输入框获得焦点时外框变亮黄
        },
        ...sx, // 外部 sx 会覆盖默认样式（例如传 width:'100%'）
      }}
    >
      {/* 输入域 */}
      <InputBase
        sx={{ ml: 1, flex: 1 }} // flex:1 填充剩余空间
        inputRef={inputRef} // 把 ref 挂在原生 input 元素上
        defaultValue={defaultValue}
        placeholder={placeholder}
        // 输入事件：每次输入都调用，用于控制清空按钮的显示
        onInput={(event) => {
          const _value = inputRef.current?.value.trim() ?? '';
          if (_value != '') {
            setIsClear(true); // 有内容 → 显示清空按钮
          } else {
            setIsClear(false); // 空 → 隐藏清空按钮
            onClear(); // 同时通知父组件“清空了”（重置查询条件）
          }
        }}
        // 键盘事件：按下 Enter 且输入非空 → 触发搜索
        onKeyUp={(event) => {
          const _value = inputRef.current?.value.trim() ?? '';
          if (event.key === 'Enter' && _value != '') {
            onEnter(_value);
          }
        }}
      />

      {/* 清空按钮（有内容时才显示） */}
      {isClear && (
        <IconButton
          type="button"
          sx={{ p: '10px' }}
          onClick={() => {
            if (inputRef.current) {
              inputRef.current.value = ''; // 直接操作 DOM 清空输入值（非受控组件写法）
              setIsClear(false);
              onClear();
            }
          }}
        >
          <ClearSVG />
        </IconButton>
      )}

      {/* 竖向分隔线 */}
      <Divider sx={{ height: '100%', m: 0.5 }} orientation="vertical" />

      {/* 右侧搜索图标按钮 */}
      <IconButton
        color="primary"
        sx={{ p: '10px' }}
        aria-label="directions" // 无障碍标签（会被读屏软件读出）
        onClick={() => {
          const _value = inputRef.current?.value.trim() ?? '';
          // 注意：这里不检查是否为空，是为了让父组件自己决定空值是否调用接口
          onClick(_value);
        }}
      >
        <SearchSVG />
      </IconButton>
    </Box>
  );
};

export default SearchInput;
