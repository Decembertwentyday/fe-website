// 【CategorySquare】铭文类型小图标组件（方形）
// 将 category 映射到简写标签（domain→DM, text→TXT, image→IMG）
// 如有 value（data URI）则渲染为图片，否则显示灰底色 + 类型文字
import { Box, BoxProps } from '@mui/material';

const categoryObj: Record<string, string> = {
  domain: 'DM',
  text: 'TXT',
  image: 'IMG',
  token: 'TXT',
};

const CategorySquare: React.FC<{ category: string; value: string } & BoxProps> = ({ category, value = '' }) => {
  return (
    <Box
      sx={{
        width: '32px',
        height: '32px',
        borderRadius: '2px',
        overflow: 'hidden',
        background: '#313439',
      }}
    >
      {category === 'image' && value ? (
        <img src={value} alt="img" style={{ width: '32px', height: '32px' }}></img>
      ) : (
        <Box
          sx={{
            width: '100%',
            lineHeight: '32px',
            fontSize: '10px',
            fontWeight: 500,
            textAlign: 'center',
          }}
        >
          {categoryObj[category]}
        </Box>
      )}
    </Box>
  );
};
export default CategorySquare;
