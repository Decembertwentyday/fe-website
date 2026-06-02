// ============================================================================
// 【StakingOverview】质押数据概览面板
// ----------------------------------------------------------------------------
// 职责：
//   展示当前集合的质押统计数据（质押人数、锁仓量、TVL、累计奖励、待领取奖励），
//   以及当前 Era（时代/周期）的进度和剩余时间。
//
// "Era" 是什么？
//   质押系统通常以"周期/时代"为单位分配奖励。每个 Era 有开始时间和结束时间，
//   到期后重新计算和分配奖励。CircularProgress 展示当前 Era 的完成百分比。
//
// 数据来源：
//   services.vault.getStakingStatic(collection) → GetStakingStaticData
//   包含字段：stakers / totalLocked / tvl / cumulativeRewards / pendingRewards
//             epochStartTime / epochEndTime（Era 的开始和结束 Unix 时间戳）
//
// 关键工具函数：
//   getTimeAgoString(timestamp)：把结束时间戳转为"X个月X天 left"的倒计时字符串
//   dayjs.duration + BigNumber：计算当前进度百分比
//   getTruncate：截断小数位展示（避免超长数字）
// ============================================================================

import { Box, Typography, styled, useMediaQuery } from '@mui/material';
import { useEffect, useState } from 'react';
import services from '@/services';
import dayjs, { ConfigType } from 'dayjs';

import ETHSVG from '@/assets/icons/eth16.svg';

import CircularProgress from '@/containers/CircularProgress';
import { GetStakingStaticData } from '@/services/vault/types';
import bignumberjs from 'bignumber.js';
import getTruncate from '@/utils/getTruncate';

interface ITokenOverview {
  collection: string; // 集合名称（用于请求对应集合的质押数据）
}

// ★ 工具函数：把 Unix 时间戳转为"X个月X天 left"格式的倒计时字符串
// 参数 timestamp：结束时间的 Unix 时间戳（秒）
// 原理：dayjs.duration() 计算目标时间与当前时间的差，再提取月/天/时/分/秒
// 注意：时/分/秒的计算代码被注释掉，说明当前只精确到"天"
export const getTimeAgoString = (timestamp: number) => {
  // 计算"距离 timestamp 还有多少秒"的时长
  const remainingDuration = dayjs.duration(timestamp - dayjs().unix(), 'seconds');

  const monthsLeft = remainingDuration.months();
  const daysLeft = remainingDuration.days();
  const hoursLeft = remainingDuration.hours();
  const minutesLeft = remainingDuration.minutes();
  const secondsLeft = remainingDuration.seconds();

  let remainingTimeFormatted = '';
  if (monthsLeft > 0) {
    remainingTimeFormatted = `${monthsLeft}M`;
  }
  if (daysLeft > 0) {
    remainingTimeFormatted = `${remainingTimeFormatted} ${daysLeft}D`;
  }
  // 以下时/分/秒部分被注释掉（当前精度只到"天"）
  // if (hoursLeft > 0) {
  //   remainingTimeFormatted = `${remainingTimeFormatted} ${hoursLeft}h`;
  // }
  // if (minutesLeft > 0) {
  //   remainingTimeFormatted = `${remainingTimeFormatted} ${minutesLeft}min`;
  // }
  // if (secondsLeft > 0) {
  //   remainingTimeFormatted = `${remainingTimeFormatted} ${secondsLeft}s`;
  // }

  return `${remainingTimeFormatted} left`;
};

const Stakingview: React.FC<ITokenOverview> = ({ collection }) => {
  // stakingStatic：质押统计数据（来自接口，含 TVL/质押人数等）
  const [stakingStatic, setStakingStatic] = useState<GetStakingStaticData>();
  // matches：是否宽屏（≥750px），控制布局和字体大小
  const matches = useMediaQuery('(min-width:750px)');
  // eraInfo：Era 进度信息（diff=持续天数, progress=完成百分比, left=剩余时间字符串）
  const [eraInfo, setEraInfo] = useState<{ diff: string; progress: number; left: string }>({
    diff: '',
    progress: 0,
    left: '',
  });

  // 获取质押统计数据 + 计算 Era 进度
  async function getErc20Info() {
    const response = await services.vault.getStakingStatic(collection);

    if (response?.code == 200) {
      console.log(response.data); // 调试日志（生产环境通常应删除）
      setStakingStatic(response.data);

      // 计算 Era 总时长（单位：天）
      // epochEndTime/epochStartTime 是 Unix 秒时间戳，×1000 转为毫秒
      const diff = dayjs(Number(response.data.epochEndTime) * 1000)
        .diff(Number(response.data.epochStartTime) * 1000, 'day')
        .toString();

      // 计算已过去时间（当前时间 - 开始时间，单位：秒）
      const remainingDuration = new bignumberjs(dayjs().unix()).minus(response.data.epochStartTime).toString();

      // 计算进度百分比 = 已过去时间 / 总时长 * 100
      // 使用 BigNumber.js 进行精确计算，防止浮点误差
      const progress = new bignumberjs(remainingDuration)
        .multipliedBy(100)
        .div(new bignumberjs(response.data.epochEndTime).minus(response.data.epochStartTime))
        .toNumber();

      setEraInfo({ diff, progress, left: getTimeAgoString(response.data.epochEndTime) });
    }
  }

  // 监听 collection 变化 → 重新请求数据
  // collection.trim() != '' 防止空集合名时发出无效请求
  useEffect(() => {
    if (collection.trim() != '') {
      getErc20Info();
    }
  }, [collection]);

  // ★ 通用统计标签组件（内联函数复用，避免重复 JSX）
  // label: 指标名称（如 "Stakers"）
  // value: 指标值（如 "123"）
  // isLine: 是否显示右侧分隔线（用伪元素 ::before 实现）
  // isHighlight: 是否用荧光黄绿色 #E5FF65 高亮显示值（用于强调核心指标）
  // isShowIcon: 是否在值后面显示 ETH 图标（用于 ETH 计价的指标）
  function getTagComponent(label: string, value: string, isLine: boolean, isHighlight: boolean, isShowIcon: boolean) {
    return (
      <Box
        sx={{
          display: 'flex',
          flex: '1',
          flexDirection: 'column',
          alignItems: 'center',
          position: 'relative',
          '&:before': isLine
            ? {
                content: '" "',
                display: 'block',
                borderRight: '1px solid rgba(255,255,255,0.2)', // 右侧分隔线
                top: 0,
                bottom: 0,
                right: 0,
                height: '50px',
                position: 'absolute',
              }
            : null,
        }}
      >
        <Typography sx={{ fontSize: '14px', color: 'rgba(255, 255, 255, 0.45)' }}>{label}</Typography>
        <Typography
          sx={{
            fontSize: '20px',
            color: isHighlight ? '#E5FF65' : 'rgb(255, 255, 255)', // 高亮 vs 普通白色
            display: 'flex',
            alignItems: 'center',
          }}
        >
          {value}
          {isShowIcon && <ETHSVG />}
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Box
        sx={{
          height: matches ? '120px' : 'auto', // 宽屏固定高度，窄屏自适应
          padding: '24px',
          boxSizing: 'border-box',
          borderRadius: '12px',
          border: '1px solid #2F343E',
          background: '#202229',
          mb: '28px',
          display: matches ? 'flex' : 'grid',
          alignItems: 'center',
          gridTemplateColumns: 'repeat(3, 1fr)', // 窄屏时 3 列网格布局
          justifyContent: 'center',
          gridGap: '24px',
        }}
      >
        {/* Stakers：质押人数，用荧光黄高亮 */}
        {getTagComponent('Stakers', `${stakingStatic?.stakers ?? '--'}`, true, true, false)}

        {/* Total locked：集合内锁仓总量（代币数量，取整显示）
            collection?.split(' ')?.[1] 取集合名第二段作为代币符号（如 "FacetPunks PUNK" → "PUNK"） */}
        {getTagComponent(
          `Total locked (${collection?.split(' ')?.[1] ?? '--'})`,
          `${stakingStatic?.totalLocked ? getTruncate(stakingStatic?.totalLocked, 0) : '--'}`,
          true,
          false,
          false,
        )}

        {/* TVL（Total Value Locked）：总锁仓价值（ETH 计价，保留 2 位小数） */}
        {getTagComponent(
          'TVL',
          `${stakingStatic?.tvl ? getTruncate(stakingStatic?.tvl, 2) : '--'}
`,
          matches, // 宽屏时显示右侧分隔线，窄屏时不显示（最后一列）
          false,
          true, // 显示 ETH 图标
        )}

        {/* Cumulative rewards：累计发放奖励总量（ETH 计价） */}
        {getTagComponent(
          'Cumulative rewards',
          `${stakingStatic?.cumulativeRewards ? getTruncate(stakingStatic?.cumulativeRewards, 2) : '--'}
`,
          true,
          false,
          true,
        )}

        {/* Pending rewards：待领取奖励（ETH 计价） */}
        {getTagComponent(
          'Pending rewards',
          `${stakingStatic?.pendingRewards ? getTruncate(stakingStatic?.pendingRewards, 2) : '--'}
`,
          true,
          false,
          true,
        )}

        {/* Era 进度区：圆形进度条 + 时长 + 剩余时间 */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flex: '1',
            gap: '12px',
          }}
        >
          {/* CircularProgress：圆形进度条，value 是 0-100 的百分比 */}
          <CircularProgress value={eraInfo.progress} />
          <Box sx={{ display: 'flex', alignItems: 'flex-start', flexDirection: 'column' }}>
            <Typography sx={{ fontSize: '14px', color: 'rgba(255, 255, 255, 0.45)' }}>Era</Typography>
            {/* Era 总时长（天数） */}
            <Typography sx={{ fontSize: matches ? '20px' : '14px' }}>{`${eraInfo.diff} Days`}</Typography>
            {/* 剩余时间（如 "5D left"） */}
            <Typography sx={{ fontSize: '14px', color: 'rgba(255, 255, 255, 0.45)', width: 'max-content' }}>
              {eraInfo.left}
            </Typography>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default Stakingview;
