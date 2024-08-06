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

const REFERENCE_DATE = new Date(1900, 0, 1); // Reference date for handling dates before 1970

// Function to format values for display
function fmtVal(u: uPlot, raw: number) {
  if (u.scales.x.time) {
    // For time-based data, convert Unix timestamp to date string
    return raw == null ? '' : format(new Date(raw * 1000), 'yyyy-MM-dd');
  }
  // For non-time data, convert days since reference date to date string
  const date = new Date(REFERENCE_DATE.getTime() + raw * 24 * 60 * 60 * 1000);
  return raw == null ? '' : format(date, 'yyyy-MM-dd');
}

// Function to convert date string to formatted date or year
function convertDate(stringDate: string): string {
  if (stringDate.slice(6) === "00") {
    // If day and month are "00", return just the year
    return stringDate.slice(0, 4);
  } else {
    // Otherwise, parse the full date and format it
    const date = parse(stringDate, 'yyyyMMdd', new Date());
    if (!isValid(date)) {
      console.log('Invalid date:', date);
      return "";
    }
    return format(date, 'yyyy-MM-dd');
  }
}

// The main Chart component
const ChartUplot = React.memo(({ data, color, labelYAxe, time }: ChartProps) => {
  // Refs for the chart container and uPlot instance
  const chartRef = useRef<HTMLDivElement>(null);
  const chartInstanceRef = useRef<uPlot | null>(null);

  // Prepare chart data
  const chartData = useMemo(() => {
    let dates: number[];
    if (time) {
      // For time-based data, convert dates to Unix timestamps
      dates = data.map(item => new Date(item.date).getTime() / 1000);
    } else {
      // For non-time data, convert dates to days since reference date
      dates = data.map(item => {
        const date = parse(item.date.toString(), 'yyyyMMdd', new Date());
        return differenceInDays(date, REFERENCE_DATE);
      });
    }
    const values = data.map(item => item.value);
    return [dates, values];
  }, [data, time]);

  // Effect to create or update the chart
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

      // Destroy existing chart instance if it exists
      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy();
      }

      // Create new uPlot instance
      chartInstanceRef.current = new uPlot(options, chartData, chartRef.current);
    }

    // Cleanup function to destroy chart when component unmounts
    return () => {
      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy();
      }
    };
  }, [chartData, color, labelYAxe, time]);

  // Effect to handle window resizing
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

// Wrapper component for the chart
export default function Chart({ data, color, labelYAxe, time }: ChartProps) {
  return (
    <div>
      <ChartUplot data={data} color={color} labelYAxe={labelYAxe} time={time}/>
    </div>
  )
}