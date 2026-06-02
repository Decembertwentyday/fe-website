// ============================================================================
// 【MediaList】社交媒体链接列表组件
// ----------------------------------------------------------------------------
// 展示集合/项目的对应社交媒体图标（Discord/Twitter/Github/官网/Telegram）
// 内部 mediaList 字典把 SocialPlatformKey 映射到对应 SVG 图标
// 只有 data 中存在的平台才显示，即 data.twitter 有内容才显示 Twitter 图标
// ============================================================================

'use client';

import { Box } from '@mui/material';
import Link from 'next/link';

import DiscordSVG from '@/assets/icons/discord.svg';
import TwitterSVG from '@/assets/icons/twitter.svg';
import GithubSVG from '@/assets/icons/github.svg';
import EarthSVG from '@/assets/icons/earth.svg';
import TelegramSVG from '@/assets/icons/telegram.svg';

import { SocialPlatform, SocialPlatformKey } from '@/services/types';

interface IMediaList {
  data: SocialPlatform;
}

const mediaList: { [key in SocialPlatformKey]: React.ReactNode } = {
  discord: <DiscordSVG style={{ color: 'rgba(255,255,255,0.45', scale: 1.5 }} />,
  twitter: <TwitterSVG style={{ color: 'rgba(255,255,255,0.45', scale: 1.5 }} />,
  github: <GithubSVG style={{ color: 'rgba(255,255,255,0.45', scale: 1.5 }} />,
  website: <EarthSVG style={{ color: 'rgba(255,255,255,0.45', scale: 1.5 }} />,
  telegram: <TelegramSVG style={{ color: 'rgba(255,255,255,0.45', scale: 1.5 }} />,
};

const MediaList: React.FC<IMediaList> = ({ data }) => {
  return (
    <Box
      sx={{
        borderRadius: '50px',
        display: 'flex',
        alignItems: 'center',
        gap: '20px',
        width: 'fit-content',
        height: '36px',
      }}
    >
      {Object.keys(data).map((item, index) => {
        let _href = data[item as SocialPlatformKey];
        if (!(_href.startsWith('http://') || _href.startsWith('https://'))) {
          _href = `http://${_href}`;
        }
        return (
          data?.[item as SocialPlatformKey] && (
            <Link key={index} href={_href} style={{ display: 'flex', alignItems: 'center' }} target="_blank">
              {mediaList[item as SocialPlatformKey]}
            </Link>
          )
        );
      })}
    </Box>
  );
};

export default MediaList;
