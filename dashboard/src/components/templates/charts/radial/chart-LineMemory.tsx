"use client";

import { useMemo } from "react";
import dynamic from "next/dynamic";
import { useTheme } from "next-themes";
import { SnmpMessage } from "@/src/types/interfaces";

const ReactApexChart = dynamic(() => import("react-apexcharts"), { ssr: false });

export const LineSteplineChartMemory = ({ logs = [] }: { logs?: SnmpMessage[] }) => {
  const { theme } = useTheme();

  const chartConfig = useMemo(() => {
    const isDark = theme === "dark";
    const textColor = isDark ? "#f8f8f8" : "#333";

    const recentLogs = logs.slice(-9);

    return {
      series: [
        {
          name: "Memory Used (%)",
          data: recentLogs.map((item) => {
            const total = item?.data?.metrics?.memTotal;
            const free = item?.data?.metrics?.memFree;

            if (!total || !free) return 0;

            const usedPercent = ((total - free) / total) * 100;
            return parseFloat(usedPercent.toFixed(2));
          }),
        },
      ],
      options: {
        chart: { type: "line", height: 350, toolbar: { show: false } },
        stroke: { curve: "stepline", width: 2, colors: ["#3b82f6"] },
        dataLabels: { enabled: false },
        title: {
          text: "Memória",
          align: "center",
          style: { color: textColor, fontSize: "18px" },
        },
        xaxis: {
          categories: recentLogs.map((item) =>
            new Date(item?.data?.timestamp || "").toLocaleTimeString()
          ),
          labels: { style: { colors: textColor } },
          axisBorder: { color: textColor },
          axisTicks: { color: textColor },
        },
        yaxis: {
          min: 0,
          max: 100,
          tickAmount: 5,
          labels: {
            style: { colors: textColor },
            formatter: (val: number) => `${val.toFixed(0)}%`,
          },
        },
        markers: {
          size: 4,
          colors: [isDark ? "#ddd" : "#000"],
          strokeColors: "#fff",
          hover: { sizeOffset: 4 },
        },
        tooltip: { theme: isDark ? "dark" : "light" },
        grid: { show: false },
      },
    };
  }, [theme, logs]);

  return (
    <div>
      <ReactApexChart
        options={chartConfig.options}
        series={chartConfig.series}
        type="line"
        height={350}
      />
    </div>
  );
};
