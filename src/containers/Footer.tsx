// ============================================================================
// 【页腳组件】全站页面底部
// ----------------------------------------------------------------------------
// 职责：
//   1. 可选展示社交媒体图标列表（Twitter、Discord 等）
//   2. 展示商务联系入口与官方 Twitter 账号
//
// props.showMedia：
//   true（默认）→ 显示完整底部（媒体图标 + 联系信息）
//   false        → 仅显示联系信息（某些嵌套页面不需要重复社交图标）
//
// 设计思路：“可控可复用”
//   通过 props 开关控制子块，让同一个 Footer 组件适用多种场景，避免写两个类似组件。
// ============================================================================

'use client';

import { Box, Typography, Divider, Link } from '@mui/material';
import MediaList from './MediaList';

interface IFooter {
  // 是否显示社交媒体图标列表，默认 true
  showMedia?: boolean;
}

const Footer: React.FC<IFooter> = ({ showMedia = true }) => {
  return (
    <Box>
      {/* 社交媒体图标（可选） */}
      {showMedia && <MediaList />}

      {/* 分隔线 */}
      <Divider />

      {/* 商务联系信息 */}
      <Box sx={{ padding: '30px 0 50px 0' }}>
        <Typography
          variant={'h5'}
          sx={{
            textAlign: 'center',
            color: 'rgba(255,255,255,0.44)', // 半透明白，座为辅助文本颜色
            fontSize: '14px',
            fontFamily: 'HarmonyOS Sans',
            lineHeight: '16px',
          }}
        >
          Media inquires for EtchMarket - Contact
          {/* Twitter 链接（新窗口打开，避免跳出本站） */}
          <Link
            href="https://twitter.com/EtchMarket"
            target="__blank" // 注：严格讲应是 "_blank"（单下划线），但浏览器容错会同样处理
            sx={{ fontWeight: '500', textDecoration: 'none', color: '#FAFAFA', ml: '12px' }}
          >
            @EtchMarket
          </Link>
        </Typography>
      </Box>
    </Box>
  );
};

export default Footer;
