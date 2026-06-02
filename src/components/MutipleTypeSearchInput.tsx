// ============================================================================
// 【多类型搜索框】带"类型下拉"的增强版搜索框
// ----------------------------------------------------------------------------
// 和普通 SearchInput 的区别：
//   SearchInput            → 简版，只有输入框 + 搜索图标
//   MutipleTypeSearchInput → 增加了左侧的"类型下拉选择器"，
//                            允许用户选择搜索范围：All Type / Text / Domain / Token
//
// 使用场景：
//   /search 搜索页，搜索内容可能是地址、铭文ID、域名、代币标识等，需要类型过滤。
//
// 6 个 Props 说明：
//   searchType       → 当前选中的搜索类型（all/text/domain/token）
//   onSearchTypeChage→ 类型下拉变化回调（注：组件内有拼写错误 Chage 而非 Change，保持原样）
//   searchBy         → 输入框的当前值（受控组件，由父组件控制）
//   onSearchByChange → 输入内容变化回调
//   onEnter          → 按回车回调
//   onClick          → 点搜索按钮回调
//   onClear          → 清空回调
//
// 与普通 SearchInput 的技术差异：
//   - 输入框是"受控组件"：用 value={searchBy} + onChange 组合
//     （而 SearchInput 用的是非受控，直接操作 ref）
//   - 为什么这里选受控：类型变化时需要同时重置输入框内容，受控组件允许父组件完全控制源头。
// ============================================================================

'use client';

import { useRef, useState } from 'react';
import {
  Box,
  Divider,
  IconButton,
  InputAdornment,
  InputBase,
  InputBaseProps,
  MenuItem,
  Select,
  useMediaQuery,
} from '@mui/material';
import { KeyboardArrowDown, Search } from '@mui/icons-material';

import ClearSVG from '@/assets/images/clear-icon.svg';
import SearchSVG from '@/assets/images/search-icon.svg';
import { SearchType } from '@/services/ethscriptions/types';

// 组件 Props 接口：在 InputBase 原生属性基础上额外扩展了搜索相关属性
interface ISearchInput {
  searchType: SearchType; // 当前选中的搜索类型
  onClear: () => void; // 清空回调
  onClick: (val: string) => void; // 点搜索图标回调
  onEnter: (val: string) => void; // 按回车回调
  onSearchTypeChage: (e: SearchType) => void; // 类型下拉变化回调（注意：原代码拼写错误，保持原样）
  searchBy: string; // 输入框当前值（受控）
  onSearchByChange: (e: string) => void; // 输入内容变化回调
}

// 下拉选项结构：label=显示文字，value=实际传值
type Condition = {
  label: string;
  value: string;
};

// React.FC<ISearchInput & InputBaseProps>：
//   同时接受自定义 props 和 MUI InputBase 的所有原生 props（比如 sx、disabled 等）
const MutipleTypeSearchInput: React.FC<ISearchInput & InputBaseProps> = ({
  onClick,
  onClear,
  onEnter,
  sx,
  searchType,
  onSearchTypeChage,
  searchBy,
  onSearchByChange,
}) => {
  // inputRef：直接指向 DOM 输入框，用于在事件处理中读取当前值
  const inputRef = useRef<HTMLInputElement>();
  // isClear：控制"清空按钮"是否显示（有内容才显示）
  const [isClear, setIsClear] = useState<boolean>(false);
  // 响应式：移动端（宽度<=750px）输入框占屏幕90%宽；桌面端固定 640px
  const isMobile = useMediaQuery('(max-width:750px)');

  // 搜索类型选项列表，对应后端接口的 searchType 参数
  const conditionArr: Condition[] = [
    {
      label: 'All Type', // 不限类型，传 '' 给后端
      value: 'all',
    },
    {
      label: 'Text', // 文本类铭文
      value: 'text',
    },
    {
      label: 'Domain', // 域名类铭文
      value: 'domain',
    },
    {
      label: 'Token', // Token（铭文代币）
      value: 'token',
    },
  ];

  return (
    // 最外层容器：整个搜索框的视觉边框和背景
    // :focus-within 伪类：只要内部任何子元素获得焦点，整个框的外边框就变亮黄
    <Box
      sx={{
        p: '0',
        display: 'flex',
        alignItems: 'center',
        width: isMobile ? '90vw' : 640, // 响应式宽度
        height: 52,
        borderRadius: '6px',
        border: '1px solid #2F343E',
        background: '#202229',
        transition: 'all 0.2s ease-in-out',
        ':focus-within': {
          border: '1px solid #E5FF65', // 焦点时外框变荧光黄
        },
        ...sx, // 允许父组件通过 sx prop 覆盖样式
      }}
    >
      {/* 核心输入框区域（包含左侧类型选择器） */}
      <InputBase
        sx={{ flex: 1, fontSize: '14px' }}
        inputRef={inputRef}
        placeholder="Search by Address / Ethscription / Token / Domain"
        value={searchBy} // ← 受控组件：由父组件通过 searchBy 状态控制值
        startAdornment={
          // 左侧修饰器：在输入框内部左侧嵌入一个 Select 下拉
          <InputAdornment position="start">
            {/* 搜索类型下拉选择器 */}
            <Select
              IconComponent={KeyboardArrowDown} // 替换默认下拉箭头图标
              MenuProps={{
                sx: {
                  '& .MuiMenu-paper': {
                    backgroundColor: '#313439', // 下拉菜单背景色（深色主题）
                  },
                },
              }}
              sx={{
                color: 'white',
                fontSize: 14,
                fontWeight: '500',
                '.MuiSvgIcon-root': { color: '#BFBFBF' }, // 箭头图标颜色
                '.MuiOutlinedInput-notchedOutline': { border: 'none' }, // 去掉 Select 自带边框，融合到搜索框整体
              }}
              defaultValue=""
              value={searchType} // 受控：由父组件传入的 searchType 决定当前选中项
              onChange={(e) => {
                // 类型变化时通知父组件，由父组件同时处理：重置 searchBy、重新发请求
                onSearchTypeChage(e.target.value as SearchType);
              }}
            >
              {/* 遍历渲染选项 */}
              {conditionArr.map((item) => (
                <MenuItem
                  key={item.value}
                  sx={{
                    color: 'rgba(255,255,255,0.65)',
                    fontSize: '14px',
                    '&.Mui-selected': {
                      backgroundColor: 'transparent', // 选中时去掉默认蓝色背景
                      color: 'white',
                    },
                    '&.Mui-selected:hover': {
                      backgroundColor: 'transparent',
                      color: 'white',
                    },
                  }}
                  value={item.value}
                >
                  {item.label}
                </MenuItem>
              ))}
            </Select>
            {/* 类型选择器和输入框之间的竖向分隔线 */}
            <Divider orientation="vertical" sx={{ height: '16px' }} />
          </InputAdornment>
        }
        // 受控输入：每次输入变化通知父组件更新 searchBy 状态
        onChange={(e) => {
          onSearchByChange(e.target.value);
        }}
        // onInput：控制"清空按钮"的显隐（有内容才显示）
        onInput={(event) => {
          const _value = inputRef.current?.value.trim() ?? '';
          if (_value != '') {
            setIsClear(true); // 有内容，显示清空按钮
          } else {
            setIsClear(false); // 内容清空，隐藏清空按钮
            onClear(); // 同时通知父组件执行清空逻辑（比如清空搜索结果）
          }
        }}
        // onKeyUp：监听回车键，触发搜索
        onKeyUp={(event) => {
          const _value = inputRef.current?.value.trim() ?? '';
          if (event.key === 'Enter' && _value != '') {
            onEnter(_value); // 按下回车且有内容时触发搜索
          }
        }}
      />

      {/* 清空按钮：只在输入框有内容时（isClear=true）渲染 */}
      {isClear && (
        <IconButton
          type="button"
          sx={{ p: '10px' }}
          onClick={() => {
            if (inputRef.current) {
              inputRef.current.value = ''; // 直接操作 DOM 清空输入框
              setIsClear(false); // 隐藏清空按钮
              onClear(); // 通知父组件
            }
          }}
        >
          <ClearSVG />
        </IconButton>
      )}

      {/* 分隔线 + 右侧搜索图标按钮 */}
      <Divider sx={{ height: '100%' }} orientation="vertical" />
      <IconButton
        color="primary"
        sx={{
          width: '50px',
          height: '100%',
          borderRadius: '0',
          borderTopRightRadius: '6px', // 右上角圆角与整体外框一致
          borderBottomRightRadius: '6px', // 右下角圆角与整体外框一致
          // 悬停特效：背景变荧光黄，图标变深色（视觉反馈）
          '&:hover': {
            background: '#E5FF65',
            svg: {
              fill: '#171A1F',
            },
          },
        }}
        aria-label="directions"
        onClick={() => {
          // 点击时读取当前输入值并回调
          const _value = inputRef.current?.value.trim() ?? '';
          onClick(_value);
        }}
      >
        <SearchSVG className="icon" />
      </IconButton>
    </Box>
  );
};

export default MutipleTypeSearchInput;
