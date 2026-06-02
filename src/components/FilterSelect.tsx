// ============================================================================
// 【FilterSelect】单选过滤器下拉组件
// ----------------------------------------------------------------------------
// 点击标签弹出 Popover，内含列表单选项目。
// 与 FilterCheckBox 的区别：单选（选一个立即关闭）而非多选
// 选中后调用 onSelect(selectedItem)，并更新显示标签
// 使用场景：价格排序选择（最低价/最高价/最新）
// ============================================================================

'use client';

import React, { useRef, useState, useEffect } from 'react';
import { Box, Typography, Popover, Button } from '@mui/material';

import ArrowDownSVG from '@/assets/icons/arrow_down.svg';
import ArrowUPSVG from '@/assets/icons/arrow_up.svg';

type SelectItem = {
  label: string;
  value: string;
};

interface IFilterSelect {
  defaultValue?: SelectItem;
  selectList: SelectItem[];
  onSelect?: (val: SelectItem) => void;
}

const FilterSelect: React.FC<IFilterSelect> = ({ selectList, defaultValue, onSelect }) => {
  const [anchorEl, setAnchorEl] = React.useState<HTMLDivElement | null>(null);
  const [currentSelect, setCurrentSelect] = useState<SelectItem>(defaultValue || selectList[0]);

  const handleClick = (event: React.MouseEvent<HTMLDivElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);

  const handleOnSelect = (item: SelectItem) => {
    return () => {
      setCurrentSelect(item);
      onSelect?.(item);
      handleClose();
    };
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }} onClick={handleClick}>
        <Typography sx={{ mr: '10px', fontSize: '14px', width: 'max-content' }}>{currentSelect?.label}</Typography>
        {open ? <ArrowUPSVG color="rgba(255,255,255,0.45)" /> : <ArrowDownSVG color="rgba(255,255,255,0.45)" />}
      </Box>
      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        sx={{
          backgroundColor: 'transparent',

          '.MuiPaper-root': {
            background: 'transparent',
          },
        }}
      >
        <Box
          sx={{
            mt: '8px',
            display: 'flex',
            flexDirection: 'column',
            borderRadius: '8px',
            border: '1px solid #474C56',
            background: '#313439',
            p: '16px',
            boxShadow: '0px 0px 4px 0px rgba(19, 33, 82, 0.06), 0px 1px 25px 0px rgba(19, 33, 82, 0.10)',
          }}
        >
          {selectList.map((item) => {
            return (
              <Button
                key={item.value}
                fullWidth
                variant="text"
                onClick={handleOnSelect(item)}
                sx={{
                  color: item.value === currentSelect?.value ? '#fff' : 'rgba(255, 255, 255, 0.65)',
                  justifyContent: 'flex-start',
                  fontSize: '14px',
                  textTransform: 'none',
                  ':hover': {
                    color: '#fff',
                    backgroundColor: 'transparent',
                  },
                }}
              >
                {item.label}
              </Button>
            );
          })}
        </Box>
      </Popover>
    </Box>
  );
};

export default FilterSelect;
