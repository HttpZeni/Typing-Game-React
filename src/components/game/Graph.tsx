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
  return getComputedStyle(themeRoot).getPropertyValue(name).trim();
};

const hexToRgba = (hex: string, alpha: number): string => {
  const normalized = hex.replace("#", "").trim();
  const full = normalized.length === 3
    ? normalized.split("").map((ch) => ch + ch).join("")
    : normalized;

  if (!/^[0-9a-fA-F]{6}$/.test(full)) return `rgba(200, 155, 94, ${alpha})`;

  const r = parseInt(full.slice(0, 2), 16);
  const g = parseInt(full.slice(2, 4), 16);
  const b = parseInt(full.slice(4, 6), 16);

  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

type GraphNumericKey<T> = {
  [K in keyof T]: T[K] extends number | string ? K : never
}[keyof T];

export type GraphSeries<T> = {
  key: GraphNumericKey<T>;
  label?: string;
  color?: string;
  fill?: boolean;
  tension?: number;
};

export type GraphXKey<T> = GraphNumericKey<T> | ((row: T, index: number) => number);

export type GraphProps<T> = {
  data: T[];
  xKey: GraphXKey<T>;
  series: GraphSeries<T>[];
  xTitle?: string;
  yTitle?: string;
  className?: string;
  height?: number | string;
  width?: number | string;
  showLegend?: boolean;
  yBeginAtZero?: boolean;
  tooltipValueSuffix?: string;
};

export function Graph<T extends Record<string, unknown>>({
  data,
  xKey,
  series,
  xTitle = "X",
  yTitle = "Y",
  className,
  height,
  width,
  showLegend = false,
  yBeginAtZero = true,
  tooltipValueSuffix = "",
}: GraphProps<T>) {
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
      legend: { display: showLegend },
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
            return x == null ? "" : `${x}`;
          },
          label: (item) => {
            const y = item.parsed.y;
            const suffix = tooltipValueSuffix ? ` ${tooltipValueSuffix}` : "";
            return `${Math.round(y ?? 0)}${suffix}`;
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
        border: { display: false },
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
        beginAtZero: yBeginAtZero,
        grid: {
          display: true,
          color: colors.grid,
          lineWidth: 1.5,
        },
        border: { display: false },
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
  }), [colors, showLegend, tooltipValueSuffix, xTitle, yBeginAtZero, yTitle]);

  const chartData = useMemo(() => {
    const safeSeries = series ?? [];
    const getX = (row: T, index: number) => {
      if (typeof xKey === "function") return xKey(row, index);
      return Number(row[xKey]) || 0;
    };

    const datasets = safeSeries.map((s) => {
      const color = s.color ?? colors.line;
      const fill = s.fill ?? false;
      return {
        label: s.label ?? String(s.key),
        data: data.map((row, index) => ({
          x: getX(row, index),
          y: Number(row[s.key]) || 0,
        })),
        borderColor: color,
        backgroundColor: fill ? hexToRgba(color, 0.18) : "transparent",
        pointRadius: 5,
        pointHoverRadius: 9,
        pointBackgroundColor: color,
        pointBorderColor: colors.tooltipBg,
        pointBorderWidth: 2.5,
        pointHoverBackgroundColor: colors.lineHover,
        pointHoverBorderColor: color,
        pointHoverBorderWidth: 3,
        tension: s.tension ?? 0.4,
        fill,
        borderWidth: 3,
        segment: {
          borderColor: color
        }
      };
    });

    return { datasets };
  }, [data, series, xKey, colors]);

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
}
