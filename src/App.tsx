import { useEffect, useState } from 'react';
import { CloudSnow } from 'lucide-react';
import './App.css';
import 'uplot/dist/uPlot.min.css';
import Papa from 'papaparse';
import Tab from './components/Tab/Tab';
import Chart from './components/Chart/Chart';
import ChartData from './interface/chartdata';
import useLocalStorage from './hooks/useLocalStorage';

interface TabData {
  title: string;
  value: string;
}

const fetchData = async (path: string, delimiter: string): Promise<ChartData[]> => {
  const response = await fetch(path); 
  const csv = await response.text();
  const results = Papa.parse<ChartData>(csv, { dynamicTyping: true, delimiter: delimiter, header: true, skipEmptyLines: true });
  return results.data;
};

const tabs: TabData[] = [
  { title: 'Précipitations', value: 'precipitations' },
  { title: 'Température', value: 'temperature' },
];


function App() {
  const [activeTab, setActiveTab] = useLocalStorage<string>("activeTab", "precipitations");
  const [labelChart, setlabelChart] = useState<string>("Précipitations");
  const [loading, setLoading] = useState<boolean>(true);
  const [timeChart, setTimeChart] = useState<boolean>(false);
  const [data, setData] = useState<ChartData[]>([]);

  const pathTemperature = 'src/data/csv/20240730_temperature.csv';
  const pathRainLevel = 'src/data/csv/20240730_rain-level.csv';

  const handleTabClick = (value: string) =>{
    setActiveTab(value);
  };


  useEffect(() => {

    const tab = tabs.find(( element )=> element.value === activeTab)

    setLoading(true)
    if(tab?.value === 'precipitations'){
      setTimeChart(false)
      setlabelChart(`${tab?.title} mm`) 
      fetchData(pathRainLevel,",")
        .then(fetchedData => setData(fetchedData))
        .catch(error => console.error('Error fetching data:', error))
    }
    if(tab?.value === 'temperature'){
      setTimeChart(true)
      setlabelChart(`${tab?.title} °C`)
      fetchData(pathTemperature,";")
        .then(fetchedData => setData(fetchedData))
        .catch(error => console.error('Error fetching data:', error))
    }
    setLoading(false)

  }, [activeTab]);

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
        <div className='p-4 bg-white w-11/12 lg:w-10/12 rounded-xl'>

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