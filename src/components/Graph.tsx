import { useMemo } from "react";
import { Line } from "react-chartjs-2";
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  PointElement, 
  LineElement, 
  Title, 
  Tooltip, 
  Legend, 
  Filler 
} from "chart.js";
import type { ChartOptions } from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const getCssVar = (name: string): string => {
  if (typeof window === "undefined") return "";
  const themeRoot =
    document.querySelector("[class*='theme-']") ?? document.documentElement;
  return getComputedStyle(themeRoot)
    .getPropertyValue(name)
    .trim();
};

const hexToRgba = (hex: string, alpha: number): string => {
  const normalized = hex.replace("#", "").trim();
  const full = normalized.length === 3
    ? normalized.split("").map((ch) => ch + ch).join("")
    : normalized;
  
  if (!/^[0-9a-fA-F]{6}$/.test(full)) return `rgba(200, 155, 94, ${alpha})`; // fallback
  
  const r = parseInt(full.slice(0, 2), 16);
  const g = parseInt(full.slice(2, 4), 16);
  const b = parseInt(full.slice(4, 6), 16);
  
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

type GraphPoint = {
  x: number;
  y: number;
};

type GraphProps = {
  data: GraphPoint[];
  className?: string;
  height?: number | string;
  width?: number | string;
  lineLabel?: string;
  xTitle?: string;
  yTitle?: string;
};

export const Graph = ({
  data,
  className,
  height,
  width,
  lineLabel = "WPM",
  xTitle = "TIME (SECONDS)",
  yTitle = "WORDS PER MINUTE",
}: GraphProps) => {
  // Dynamische Farben aus Tailwind Config
  const colors = useMemo(() => {
    const accentPrimary = getCssVar("--accent-primary") || "#c89b5e";
    const accentSecondary = getCssVar("--accent-secondary") || "#8b7355";
    const accentWarning = getCssVar("--accent-warning") || "#e8c080";
    const cardBg = getCssVar("--card-bg") || "#1a1a1a";
    const textPrimary = getCssVar("--text-primary") || "#e8ddd0";
    const textSecondary = getCssVar("--text-secondary") || "#b8a896";

    return {
      line: accentPrimary,
      lineHover: accentWarning,
      point: accentPrimary,
      pointHover: accentWarning,
      grid: hexToRgba(accentSecondary, 0.12),
      fill: hexToRgba(accentPrimary, 0.18),
      axis: textSecondary,
      axisTitle: textPrimary,
      tooltipBg: hexToRgba(cardBg, 0.98),
      tooltipBorder: accentPrimary,
    };
  }, []);

  const options: ChartOptions<"line"> = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { 
        display: false 
      },
      tooltip: {
        enabled: true,
        backgroundColor: colors.tooltipBg,
        titleColor: colors.axisTitle,
        bodyColor: colors.axis,
        borderColor: colors.tooltipBorder,
        borderWidth: 2,
        padding: 14,
        titleFont: { 
          size: 15, 
          weight: "bold",
          family: "'JetBrains Mono', monospace"
        },
        bodyFont: { 
          size: 14,
          family: "'JetBrains Mono', monospace"
        },
        displayColors: false,
        callbacks: {
          title: (items) => {
            const x = items[0]?.parsed?.x;
            return x == null ? "" : `${x}s`;
          },
          label: (item) => {
            const y = item.parsed.y;
            return `${Math.round(y ?? 0)} WPM`;
          },
        },
      }
    },
    scales: {
      x: {
        type: "linear",
        grid: { 
          display: true,
          color: colors.grid,
          lineWidth: 1.5,
        },
        border: { 
          display: false 
        },
        ticks: {
          color: colors.axis,
          font: { 
            size: 12,
            family: "'JetBrains Mono', monospace",
            weight: 500
          },
          padding: 10,
          maxTicksLimit: 10,
        },
        title: {
          display: true,
          text: xTitle,
          color: colors.axisTitle,
          font: { 
            size: 13, 
            weight: "bold",
            family: "'JetBrains Mono', monospace"
          },
          padding: { top: 12 }
        }
      },
      y: {
        beginAtZero: true,
        grid: { 
          display: true,
          color: colors.grid,
          lineWidth: 1.5,
        },
        border: { 
          display: false 
        },
        ticks: {
          color: colors.axis,
          font: { 
            size: 12,
            family: "'JetBrains Mono', monospace",
            weight: 500
          },
          padding: 10,
          maxTicksLimit: 8,
        },
        title: {
          display: true,
          text: yTitle,
          color: colors.axisTitle,
          font: { 
            size: 13, 
            weight: "bold",
            family: "'JetBrains Mono', monospace"
          },
          padding: { bottom: 12 }
        }
      },
    },
    interaction: {
      intersect: false,
      mode: "index",
    },
    animation: {
      duration: 750,
      easing: "easeInOutQuart",
    }
  }), [colors, xTitle, yTitle]);

  const chartData = useMemo(() => ({
    datasets: [
      {
        label: lineLabel,
        data,
        borderColor: colors.line,
        backgroundColor: colors.fill,
        pointRadius: 5,
        pointHoverRadius: 9,
        pointBackgroundColor: colors.point,
        pointBorderColor: colors.tooltipBg,
        pointBorderWidth: 2.5,
        pointHoverBackgroundColor: colors.pointHover,
        pointHoverBorderColor: colors.line,
        pointHoverBorderWidth: 3,
        tension: 0.4,
        fill: true,
        borderWidth: 3,
        segment: {
          borderColor: colors.line
        }
      },
    ],
  }), [data, colors, lineLabel]);

  return (
    <div
      className={[
        "w-full h-full p-4 bg-card-bg/40 backdrop-blur-sm rounded-2xl border border-card-border/50 shadow-2xl",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      style={{ height, width }}
    >
      <Line options={options} data={chartData} />
    </div>
  );
};
