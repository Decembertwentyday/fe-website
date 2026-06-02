'use client';

import { Box, BoxProps } from '@mui/material';
import Link from 'next/link';

import GitBookSVG from '@/assets/icons/gitbook.svg';
import DiscordSVG from '@/assets/icons/discord_lg.svg';
import TwitterSVG from '@/assets/icons/twitter_lg.svg';

const getMediaInfoList = (color = '#E5FF65') => {
  return [
    { icon: <DiscordSVG color={color} />, alt: 'Link to discord', url: 'https://discord.gg/CXnkHmbNqv' },
    { icon: <TwitterSVG color={color} />, alt: 'Link to twitter', url: 'https://twitter.com/EtchMarket' },
    { icon: <GitBookSVG color={color} />, alt: 'Link to gitbook', url: 'https://docs.etch.market/' },
  ];
};

interface IMediaList {
  mediaCard?: boolean;
  color?: string;
  sx?: BoxProps;
}

const MediaList: React.FC<IMediaList> = ({ mediaCard = false, color, sx = {} }) => {
  const MediaInfoList = getMediaInfoList(color ?? '#E5FF65');
  const mediaCardSx = mediaCard
    ? {
        border: '1px solid #E5FF65',
        background: '#171A1F',
        margin: '0 auto 30px',
      }
    : { margin: '10px auto' };

  return (
    <Box
      sx={{
        borderRadius: '50px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '20px',
        width: 'fit-content',
        padding: '0 36px',
        height: '48px',
        ...mediaCardSx,
        ...sx,
      }}
    >
      {MediaInfoList.map((item, index) => {
        return (
          <Link key={index} href={item.url} style={{ display: 'flex', alignItems: 'center' }} target="_blank">
            {item.icon}
          </Link>
        );
      })}
    </Box>
  );
};

export default MediaList;
