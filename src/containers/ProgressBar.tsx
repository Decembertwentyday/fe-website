// ============================================================================
// 【ProgressBar】铸造进度条组件（基于 MUI LinearProgress）
// ----------------------------------------------------------------------------
// 通过 styled 包裹 LinearProgress，定制了庖圆角且高度固定的进度条。
// 使用场景：HoldersList 中展示每个地址的持有占比、TokenOverview 中显示铸造进度
// Props 继承自 LinearProgressProps：value（百分比数字 0~100）、variant='determinate'
// ============================================================================

'use client';

import * as React from 'react';
import { styled } from '@mui/material/styles';
import LinearProgress, { LinearProgressProps, linearProgressClasses } from '@mui/material/LinearProgress';

const Progress = styled((props: LinearProgressProps) => <LinearProgress {...props} />)(({ theme }) => ({
  height: 10,
  borderRadius: 5,
  [`&.${linearProgressClasses.colorPrimary}`]: {
    backgroundColor: theme.palette.grey[theme.palette.mode === 'light' ? 200 : 800],
  },
  [`& .${linearProgressClasses.bar}`]: {
    borderRadius: 5,
    backgroundColor: theme.palette.primary,
  },
}));

export default Progress;
