import { useEffect, useState } from 'react';
import { CloudSnow } from 'lucide-react';
import './App.css';
//import uPlot from 'uplot';
import 'uplot/dist/uPlot.min.css';
import Papa from 'papaparse';
import Tab from './components/Tab/Tab';
//import { format } from 'date-fns';
import Chart from './components/Chart/Chart';
import ChartData from './interface/chartdata';
import useLocalStorage from './hooks/useLocalStorage';



const fetchData = async (path: string, delimiter: string): Promise<ChartData[]> => {
  const response = await fetch(path); 
  const csv = await response.text();
  const results = Papa.parse<ChartData>(csv, { dynamicTyping: true, delimiter: delimiter, header: true, skipEmptyLines: true });
  return results.data;
};

interface TabData {
  title: string;
  value: string;
}

const tabs: TabData[] = [
  { title: 'Précipitations', value: 'precipitations' },
  { title: 'Température', value: 'temperature' },
];

/* const ChartL = React.memo(({ data }: { data: Temp[] }) => {
  const chartRef = useRef<HTMLDivElement>(null);
  const chartInstanceRef = useRef<uPlot | null>(null);

  const chartData = useMemo(() => {
    const dates = data.map(item => new Date(item.date).getTime() / 1000);
    const values = data.map(item => item.value);
    return [dates, values];
  }, [data]);

  useEffect(() => {
    if (chartRef.current && chartData[0].length > 0) {
      const options = {
        width: chartRef.current.clientWidth,
        height: 400,
        series: [
          {},
          {
            stroke: "#4338ca",
          },
        ],
        scales: {
          x: {
            time: true,
          },
        },
        axes: [
          {
            space: 30,
            values: (self: uPlot, splits: number[]) => splits.map(v => format(new Date(v * 1000), 'yyyy')),
          },
          {
            label: "Temperature",
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
  }, [chartData]);

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
}); */

function App() {
  const [activeTab, setActiveTab] = useLocalStorage("activeTab", "precipitations");
  //const [activeTab, setActiveTab] = useState<string>("precipitations");
  const [labelChart, setlabelChart] = useState<string>("Précipitations");
  const [loading, setLoading] = useState<boolean>(true);
  const [timeChart, setTimeChart] = useState<boolean>(false);
  const [data, setData] = useState<ChartData[]>([]);

  const pathTemperature = 'src/csv/20240730_temperature.csv';
  const pathRainLevel = 'src/csv/20240730_rain-level.csv';

  const handleTabClick = (value: string) =>{
    setActiveTab(value);
  };


  useEffect(() => {

    const tab = tabs.find(( element )=> element.value === activeTab)

    console.log(tab)

    setLoading(true)
    if(tab?.value === 'precipitations'){
      setTimeChart(false)
      setlabelChart(tab?.title)
      fetchData(pathRainLevel,",")
        .then(fetchedData => {setData(fetchedData), console.log(fetchedData)})
        .catch(error => console.error('Error fetching data:', error))
    }
    if(tab?.value === 'temperature'){
      setTimeChart(true)
      setlabelChart(tab?.title)
      fetchData(pathTemperature,";")
        .then(fetchedData => {setData(fetchedData), console.log(fetchedData)})
        .catch(error => console.error('Error fetching data:', error))
    }
    setLoading(false)

  }, [activeTab]);


  /* useEffect(() => {

    fetchData(pathRainLevel,",")
      .then(fetchedData => {setData(fetchedData), console.log(fetchedData)})
      .catch(error => console.error('Error fetching data:', error))

    setLoading(false)
  }, []); */


  return (
    <div className="min-h-screen flex flex-col bg-gray-200">
      <div className="w-full bg-white">
        <div className="flex px-2 py-4">
          <CloudSnow />
          <div className="ml-2">Station météo</div>
        </div>
      </div>
      <div className="w-full bg-white flex">
        {tabs.map((tab) => (
          <Tab
            key={tab.value}
            title={tab.title}
            enable={activeTab === tab.value}
            onClick={() => handleTabClick(tab.value)}
          />
        ))}
      </div>
      <div className="flex-grow flex justify-center items-center">
        <div className="p-4 bg-white w-11/12 lg:w-10/12 rounded-xl">

           { loading ? 
           <div className="text-xl font-semibold text-center">Loading data...</div> : 
           <Chart data={data} color={"#4338ca"} labelYAxe={labelChart} time={timeChart} /> 
           }
          
        </div>
      </div>
    </div>
  );
}

export default App;