// ============================================================================
// 【FilterCheckBox】多选过滤器下拉组件
// ----------------------------------------------------------------------------
// 点击标签弹出 Popover，内含多个 Checkbox 选项。
// 选中状态用内部 state 维护，确认后调用 onSelect(selectedItems[])。
// defaultValue: 初始勾选状态，格式为 { label: { isChecked: boolean } }
// 使用场景：CollectionList 集合列表筛选类型（NFT / Token / Domain）
// ============================================================================

'use client';

import React, { useRef, useState, useEffect } from 'react';
import { Box, Typography, Popover, Button, FormGroup, FormControlLabel, Checkbox } from '@mui/material';

import ArrowDownSVG from '@/assets/icons/arrow_down.svg';
import ArrowUPSVG from '@/assets/icons/arrow_up.svg';

type SelectItem = {
  label: string;
  value: string;
};

interface IFilterCheckBox {
  label: React.ReactNode;
  selectList: SelectItem[];
  onSelect?: (val: SelectItem[]) => void;
  defaultValue?: {
    [key in SelectItem['label']]: {
      isChecked: boolean;
      data: SelectItem;
    };
  };
}

const FilterCheckBox: React.FC<IFilterCheckBox> = ({ selectList, label, defaultValue, onSelect }) => {
  const [anchorEl, setAnchorEl] = React.useState<HTMLDivElement | null>(null);
  const [selected, setSelected] = useState<
    | {
        [key in SelectItem['label']]: {
          isChecked: boolean;
          data: SelectItem;
        };
      }
    | null
  >(defaultValue || null);

  const handleClick = (event: React.MouseEvent<HTMLDivElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);

  const handleChange = (value: SelectItem) => {
    return (event: React.ChangeEvent<HTMLInputElement>) => {
      const result = {
        ...selected,
        [event.target.name]: {
          isChecked: event.target.checked,
          data: value,
        },
      };
      setSelected(result);

      const selectedResult = Object.values(result)
        .filter((item) => item.isChecked)
        .map((item) => item.data);
      onSelect?.(selectedResult);
      handleClose();
    };
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }} onClick={handleClick}>
        {label}
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
          <FormGroup>
            {selectList.map((item) => {
              return (
                <FormControlLabel
                  key={item.label}
                  sx={{
                    justifyContent: 'flex-start',
                    fontSize: '14px',
                    textTransform: 'none',
                    ':hover': {
                      color: '#fff',
                      backgroundColor: 'transparent',
                    },
                  }}
                  control={
                    <Checkbox checked={selected?.[item.label]?.isChecked || false} onChange={handleChange(item)} />
                  }
                  label={item.label}
                  value={item.value}
                  name={item.label}
                />
              );
            })}
          </FormGroup>
        </Box>
      </Popover>
    </Box>
  );
};

export default FilterCheckBox;
