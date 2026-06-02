// ============================================================================
// 【LineChart】基于 @antv/g2plot 的价格走势折线图
// ----------------------------------------------------------------------------
// 使用 @antv/g2plot（阿里对外可视化库）的 Line 图表类。
// 用 useLayoutEffect + useRef 在 DOM 就绪后初始化图表实例。
// Props:
//   data     = [{usdPrice, time, ...}] 数据数组
//   dataType = Y轴字段名
//   color    = 线条颜色
//   isToolip = 是否显示 Tooltip
//   isXAxis  = 是否显示 X轴标签
// 注意：组件卸载时需要调用 chart.destroy()，否则内存泄漏
// ============================================================================
import { useLayoutEffect, useRef } from 'react';
import { Line } from '@antv/g2plot';
import dayjs from 'dayjs';
import BigNumber from 'bignumber.js';
import getTruncate from '@/utils/getTruncate';

interface ILineChart {
  data: Record<string, any>[];
  dataType: string;
  style: React.CSSProperties;
  color: string;
  isToolip?: boolean;
  isXAxis?: boolean;
}
const LineChart: React.FC<ILineChart> = ({ data, dataType, color, style, isToolip, isXAxis }) => {
  const lineRef = useRef<HTMLDivElement>(null);

  const priceRangs = data.map((item) => item.usdPrice);
  const min = Math.min(...priceRangs);
  const max = Math.max(...priceRangs);

  let xAxisTickCount = 12;

  if (dataType == '1d') {
    xAxisTickCount = 12;
  } else {
    xAxisTickCount = 7;
  }

  useLayoutEffect(() => {
    if (data.length > 0 && lineRef.current) {
      lineRef.current.innerHTML = '';

      const line = new Line(lineRef.current, {
        data,
        padding: 'auto',
        color,
        xField: 'date',
        yField: 'usdPrice',
        label: {
          style: {
            fill: 'transparent',
          },
        },
        lineStyle: {
          fill: 'transparent',
          lineWidth: 1.5,
        },
        tooltip: false,
        xAxis: false,
        yAxis: {
          min: BigNumber(min).minus(BigNumber(min).div(data.length)).toNumber(),
          max: BigNumber(max).plus(BigNumber(max).div(data.length)).toNumber(),
          nice: true, // 是否美化
          tickCount: data.length / 5, // 期望的坐标轴刻度数
          label: null,
          grid: null,
        },
        pixelRatio: window.devicePixelRatio,
        renderer: 'canvas',
      });

      line.render();

      if (isXAxis) {
        line.update({
          xAxis: {
            label: {
              formatter: (text) => {
                if (dataType == '1d') {
                  const _date = dayjs.unix(Number(text));
                  return dayjs
                    .unix(Number(text))
                    .format(_date.hour() === 0 && _date.minute() === 0 ? 'DD. MMM' : 'HH:mm');
                } else {
                  return dayjs.unix(Number(text)).format('DD. MMM');
                }
              },
              autoHide: true,
            },
            tickCount: xAxisTickCount,
            title: null,
            line: {
              style: {
                stroke: 'rgba(255,255,255,0.1)',
              },
            },
          },
        });
      }
      if (isToolip) {
        line.update({
          tooltip: {
            showTitle: false,
            showCrosshairs: true,
            crosshairs: {
              type: 'x',
              follow: false,
              line: {
                style: {
                  lineWidth: 1,
                  lineDash: [3, 4],
                  fill: '#999',
                },
              },
            },
            domStyles: {
              'g2-tooltip': {
                'font-size': '14px',
                padding: '8px',
                'border-radius': '8px',
                border: '1px solid #474C56',
                background: '#313439',
                'box-shadow': '0px 0px 4px 0px rgba(0, 0, 0, 0.06), 0px 1px 25px 0px rgba(0, 0, 0, 0.10)',
              },
            },
            customContent: (title, items: any) => {
              const date = dayjs.unix(items?.[0]?.name).format('MM/DD/YY hh:mm A');
              const price = `$${getTruncate(items?.[0]?.data?.usdPrice, 4)}`;
              return `
              <div style="line-height: 20px; font-size: 14px; color: rgba(255,255,255,0.45); min-width: 200px;">
                <div style="display: flex; justify-content: space-between; align-items: center;"><span style="color: #fff;">Time</span><span>${date}</span></div>
                <div style="display: flex; justify-content: space-between; align-items: center;"><span style="color: #fff;">Price</span><span>${price}</span></div>
              </div>
            `;
            },
            formatter: (data) => {
              return {
                name: data.date,
                value: data.usdPrice.toLocaleString('en-US', {
                  style: 'currency',
                  minimumFractionDigits: 0,
                  maximumFractionDigits: 2,
                  currency: 'USD',
                }),
              };
            },
          },
        });
      }
    }
  }, [data, lineRef.current]);

  return <div ref={lineRef} style={style} />;
};
LineChart.defaultProps = {
  data: [],
  color: '#32CA8A',
  isToolip: false,
  isXAxis: false,
};

export default LineChart;
