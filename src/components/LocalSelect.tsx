// ============================================================================
// 【LocalSelect】本地下拉选择组件（封装 MUI Select）
// ----------------------------------------------------------------------------
// 与 FilterSelect 的区别：直接使用 MUI Select（原生下拉）而非自定义 Popover
// Props:
//   conditionArr  = 选项数组 [{label, value}]
//   bordered      = 是否显示边框
//   onChange      = 选中回调
//   defaultValue  = 默认选中项
//   sx            = 样式扩展
// 使用场景：页面内简单下拉选择（如时间范围选择）
// ============================================================================

'use client';

import React, { useRef, useState, useEffect } from 'react';
import { Box, Typography, Select, MenuItem, SxProps } from '@mui/material';
import { SelectChangeEvent } from '@mui/material/Select';

interface IConditionSelect {
  conditionArr: {
    label: React.ReactNode | string;
    value: string;
  }[];
  bordered?: boolean;
  onChange: (e: any) => void;
  defaultValue?: string;
  sx?: SxProps;
}

const LocalSelect: React.FC<IConditionSelect> = ({
  conditionArr,
  bordered = false,
  onChange,
  defaultValue,
  sx = {},
}) => {
  const [currentMenu, setCurrenMenu] = useState(conditionArr[0]);

  const handleChange = (event: SelectChangeEvent) => {
    const _currentSelect = conditionArr.find((item) => item.value === event.target.value);
    setCurrenMenu(_currentSelect!);
    onChange && onChange(_currentSelect);
  };

  useEffect(() => {
    if (defaultValue && currentMenu.value === conditionArr[0].value) {
      const _currentSelect = conditionArr.find((item) => item.value === defaultValue);
      setCurrenMenu(_currentSelect!);
    }
  }, [defaultValue]);

  return (
    <Select
      value={currentMenu.value}
      onChange={handleChange}
      MenuProps={{
        sx: {
          '& .MuiMenu-paper': {
            marginTop: '6px',
            borderRadius: '8px',
            color: 'rgb(172,172,172)',
          },
        },
      }}
      sx={{
        p: '0 16px',
        height: '40px',
        fontSize: '14px',
        '& fieldset': {
          borderWidth: bordered ? '1px' : '0',
          borderColor: '#fff',
        },

        '& .MuiSelect-select.MuiSelect-outlined': {
          p: '0 28px 0 0',
          color: 'white',
        },
        '& .MuiOutlinedInput-root-MuiSelect-root.Mui-focused .MuiOutlinedInput-notchedOutline': {
          borderWidth: bordered ? '1px' : '0',
        },
        ...sx,
      }}
    >
      {conditionArr.map((status) => {
        return (
          <MenuItem
            sx={{
              '&.Mui-selected': {
                backgroundColor: 'transparent',
                color: 'white',
              },
              '&.Mui-selected:hover': {
                backgroundColor: 'transparent',
                color: 'white',
              },
            }}
            value={status.value}
            key={status.value}
          >
            {status.label}
          </MenuItem>
        );
      })}
    </Select>
  );
};

export default LocalSelect;
