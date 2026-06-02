// ============================================================================
// 【ShareInvest】分享到投资平台的按鈕组件
// ----------------------------------------------------------------------------
// 点击弹出 Popover，展示可分享到的平台列表（如 Coingecko）
// 此组件采用 TypographyProps 扩展，公开接口基本和 Typography 一致
// 内容（children）为触发弹出的按鈕文字
// ============================================================================
import { Fragment, useState } from 'react';
import { IconButton, MenuItem, Popover, TypographyProps } from '@mui/material';

import JumpSVG from '@/assets/icons/jump.svg';

const ShareInvest: React.FC<TypographyProps> = ({ children, sx, ...props }) => {
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
  const handleOpenClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleOpenClose = () => {
    setAnchorEl(null);
  };

  const handleOnClickCoingecko = () => {
    window.open(`https://www.coingecko.com/en/coins/x`);
    handleOpenClose();
  };

  const handleOnClickTwitter = () => {
    window.open(`https://twitter.com/intent/tweet?text=x`);
    handleOpenClose();
  };

  return (
    <Fragment>
      <IconButton onClick={handleOpenClick}>
        <JumpSVG />
      </IconButton>
      <Popover
        open={Boolean(anchorEl)}
        anchorEl={anchorEl}
        onClose={handleOpenClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
      >
        <MenuItem onClick={handleOnClickCoingecko}>Coingecko</MenuItem>
        <MenuItem onClick={handleOnClickTwitter}>Share to Twitter</MenuItem>
      </Popover>
    </Fragment>
  );
};

export default ShareInvest;
