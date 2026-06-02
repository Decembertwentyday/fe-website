// 【StyledOutlinedInput.tsx】全局输入框样式扩展
// 在默认 OutlinedInput 基础上统一边框颜色规范：
//   默认： rgba(255,255,255,0.2)  hover： #E5FF65  focus： #E5FF65
// 全项目输入框均可直接替换 OutlinedInput 使用
import { OutlinedInput, styled } from '@mui/material';

const StyledOutlinedInput = styled(OutlinedInput)(() => ({
  height: '48px',
  '& input': {
    textAlign: 'left',
  },
  '&.MuiOutlinedInput-root': {
    fieldset: {
      borderColor: 'rgba(255,255,255,0.2)',
    },
    '&:hover fieldset': {
      borderColor: '#E5FF65',
      borderWidth: '1px',
    },
    '&.Mui-focused fieldset': {
      borderColor: '#E5FF65',
      borderWidth: '1px',
    },
  },
}));
export default StyledOutlinedInput;
