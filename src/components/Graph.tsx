import { useMemo } from "react";
import { Line } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler } from "chart.js";
import type { ChartOptions } from "chart.js";
import type { LineGraphPoint } from "../tools/fetchData";

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler
)

const options: ChartOptions<"line"> = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
    tooltip: {
      enabled: true,
      backgroundColor: 'rgba(0, 0, 0, 0.9)',
      padding: 16,
      titleFont: { size: 14, weight: 'bold' },
      bodyFont: { size: 14 },
      borderColor: '#c89b5e',
      borderWidth: 1,
      callbacks: {
        title: (items) => `Time: ${items[0].parsed.x}s`,
        label: (item) => `WPM: ${item.parsed.y}`,
      }
    }
  },
  scales: {
    x: {
      type: "linear",
      grid: { 
        display: true,
        color: 'rgba(200, 155, 94, 0.08)',
        lineWidth: 1,
      },
      border: { display: false },
      ticks: {
        color: '#c89b5e',
        font: { size: 13 },
        padding: 8,
      },
      title: {
        display: true,
        text: 'Time (seconds)',
        color: '#c89b5e',
        font: { size: 14, weight: 'bold' },
        padding: { top: 10 }
      }
    },
    y: {
      beginAtZero: true,
      grid: { 
        display: true,
        color: 'rgba(200, 155, 94, 0.08)',
        lineWidth: 1,
      },
      border: { display: false },
      ticks: {
        color: '#c89b5e',
        font: { size: 13 },
        padding: 8,
      },
      title: {
        display: true,
        text: 'Words Per Minute',
        color: '#c89b5e',
        font: { size: 14, weight: 'bold' },
        padding: { bottom: 10 }
      }
    },
  },
  interaction: {
    intersect: false,
    mode: 'index',
  },
};


type GraphProps = {
  lineData: LineGraphPoint[];
};

export const Graph = ({ lineData }: GraphProps) => {

  const chartData = useMemo(() => ({
    datasets: [
      {
        label: "WPM",
        data: lineData.map(p => ({ x: p.Seconds, y: p.WPM })),
        borderColor: "#c89b5e",
        backgroundColor: "rgba(200, 155, 94, 0.15)",
        pointRadius: 6,
        pointHoverRadius: 8,
        pointBackgroundColor: "#c89b5e",
        pointBorderColor: "#1a1a1a",
        pointBorderWidth: 2,
        pointHoverBackgroundColor: "#e8c080",
        pointHoverBorderColor: "#c89b5e",
        pointHoverBorderWidth: 3,
        tension: 0.35,
        fill: true,
        borderWidth: 3,
      },
    ],
  }), [lineData]);

  return <Line options={options} data={chartData} />;
}