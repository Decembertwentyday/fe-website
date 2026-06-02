// ============================================================================
// 【Counter】数量加减输入组件（+ / -）
// ----------------------------------------------------------------------------
// Props:
//   count    = 当前数量（受控）
//   max      = 上限（达到时 + 按鈕无效）
//   onChange = 数量变化回调（父组件更新 count 状态）
// 限制：最小为 1（count > 1 才可减）、最大为 max（count < max 才可加）
// 使用场景： Launchpad 选择铸造数量、购物车数量选择
// ============================================================================
import { Box, Button, InputBase, styled } from '@mui/material';

type Iprops = {
  onChange: (value: number) => void;
  max: number;
  count: number;
};

const Counter: React.FC<Iprops> = ({ onChange, max, count }) => {
  return (
    <InputBase
      startAdornment={
        <Button
          sx={{
            minWidth: '34px',
            '&:hover': {
              background: 'none',
            },
          }}
          onClick={() => {
            if (count > 1) {
              onChange(count - 1);
            }
          }}
        >
          -
        </Button>
      }
      endAdornment={
        <Button
          sx={{
            minWidth: '34px',
            '&:hover': {
              background: 'none',
            },
          }}
          onClick={() => {
            if (count < max) {
              onChange(count + 1);
            }
          }}
        >
          +
        </Button>
      }
      sx={{
        textAlign: 'center',
        height: '100%',
        width: '136px',
        background: '#202229',
        p: 0,
        borderTopLeftRadius: '4px',
        borderBottomLeftRadius: '4px',
        '& .MuiInputBase-input': {
          textAlign: 'center',
        },
      }}
      value={count}
      type="number"
    />
  );
};

export default Counter;
