import ChartData from '@/interface/chartdata';
import React, { useEffect, useMemo, useRef } from 'react'
import uPlot from 'uplot';
import { format, parse, isValid, differenceInDays } from 'date-fns';

type ChartProps = {
  data: ChartData[];
  color: string;
  labelYAxe: string;
  time: boolean;
};

const REFERENCE_DATE = new Date(1900, 0, 1); // January 1, 1900 as a reference point

function fmtVal(u: uPlot, raw: number) {
  if (u.scales.x.time) {
    return raw == null ? '' : format(new Date(raw * 1000), 'yyyy-MM-dd');
  }
  const date = new Date(REFERENCE_DATE.getTime() + raw * 24 * 60 * 60 * 1000);
  return raw == null ? '' : format(date, 'yyyy-MM-dd');
}

function convertDate(stringDate: string): string {
  if (stringDate.slice(6) === "00") {
    return stringDate.slice(0, 4);
  } else {
    const date = parse(stringDate, 'yyyyMMdd', new Date());
    if (!isValid(date)) {
      console.log('Invalid date:', date);
      return "";
    }
    return format(date, 'yyyy-MM-dd');
  }
}

const ChartUplot = React.memo(({ data, color, labelYAxe, time }: ChartProps) => {
  const chartRef = useRef<HTMLDivElement>(null);
  const chartInstanceRef = useRef<uPlot | null>(null);

  const chartData = useMemo(() => {
    let dates: number[];
    if (time) {
      dates = data.map(item => new Date(item.date).getTime() / 1000);
    } else {
      dates = data.map(item => {
        const date = parse(item.date.toString(), 'yyyyMMdd', new Date());
        return differenceInDays(date, REFERENCE_DATE);
      });
    }
    const values = data.map(item => item.value);
    return [dates, values];
  }, [data, time]);

  useEffect(() => {
    if (chartRef.current && chartData[0].length > 0) {
      const options: uPlot.Options = {
        width: chartRef.current.clientWidth,
        height: 400,
        series: [
          {
            label: "Date",
            value: fmtVal,
          },
          {
            stroke: color,
            spanGaps: false,
          },
        ],
        scales: {
          x: {
            time: time,
          },
        },
        axes: [
          {
            space: 80,
            values: (self: uPlot, splits: number[]) => 
              time 
                ? splits.map(v => format(new Date(v * 1000), 'yyyy'))
                : splits.map(v => {
                    const date = new Date(REFERENCE_DATE.getTime() + v * 24 * 60 * 60 * 1000);
                    return convertDate(format(date, 'yyyyMMdd'));
                  }),
          },
          {
            label: labelYAxe,
            space: 30,
            size: 50,
          },
        ],
      };

      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy();
      }

      chartInstanceRef.current = new uPlot(options, chartData, chartRef.current);
    }

    return () => {
      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy();
      }
    };
  }, [chartData, color, labelYAxe, time]);

  useEffect(() => {
    const handleResize = () => {
      if (chartInstanceRef.current && chartRef.current) {
        chartInstanceRef.current.setSize({
          width: chartRef.current.clientWidth,
          height: 400,
        });
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return <div ref={chartRef} />;
});

export default function Chart({ data, color, labelYAxe, time }: ChartProps) {
  return (
    <div>
      <ChartUplot data={data} color={color} labelYAxe={labelYAxe} time={time}/>
    </div>
  )
}