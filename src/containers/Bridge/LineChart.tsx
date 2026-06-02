import { useLayoutEffect, useRef } from 'react';
import { Line } from '@antv/g2plot';
import dayjs from 'dayjs';

interface ILineChart {
  data: Record<string, any>[];
  style: React.CSSProperties;
  color: string;
  isToolip?: boolean;
  isXAxis?: boolean;
}
const LineChart: React.FC<ILineChart> = ({ data, color, style, isToolip, isXAxis }) => {
  const lineRef = useRef<HTMLDivElement>(null);
  const priceRangs = data.map((item) => item.price);
  const min = Math.min(...priceRangs);
  const max = Math.max(...priceRangs);
  useLayoutEffect(() => {
    if (data.length > 0 && lineRef.current) {
      lineRef.current.innerHTML = '';
      const line = new Line(lineRef.current, {
        data,
        padding: 'auto',
        color,
        xField: 'num',
        yField: 'price',
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
          tickCount: 5,
          min: min - ((max - min) / 5) * 2,
          max: max,
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
            label: null,
            title: null,
            line: {
              style: {
                stroke: '#EAE8E5',
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
                background: '#FEFEFE',
                'font-size': '14px',
                padding: '12px',
                'border-radius': '4px',
                'box-sizing': 'border-box',
                'box-shadow': '0px 1px 25px rgba(19, 33, 82, 0.1), 0px 0px 4px rgba(19, 33, 82, 0.06)',
              },
            },
            customContent: (title, items: any) => {
              const date = dayjs(items?.[0]?.name).format('MM/DD/YY');
              const time = dayjs(items?.[0]?.name).format('hh:mm A');

              return `
              <div>
                <div style="color: #999; margin-bottom: 6px;"><span style="margin-right: 20px;">${date}</span><span>${time}</span></div>
                <div style="color: #000;">${items?.[0]?.value}</div>
              </div>
            `;
            },
            formatter: (data) => {
              return {
                name: data.num,
                value: data.price.toLocaleString('en-US', {
                  style: 'currency',
                  minimumFractionDigits: 0,
                  maximumFractionDigits: 4,
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
