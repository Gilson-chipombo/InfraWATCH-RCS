"use client";

import { useMemo } from "react";
import dynamic from "next/dynamic";
import { useTheme } from "next-themes";
import { SnmpMessage } from "@/src/types/interfaces";

const ReactApexChart = dynamic(() => import("react-apexcharts"), { ssr: false });

export const LineSteplineChartCPU = ({ logs = [] }: { logs?: SnmpMessage[] }) => {
  const { theme } = useTheme();

  const chartConfig = useMemo(() => {
    const isDark = theme === "dark";
    const textColor = isDark ? "#f8f8f8" : "#333";

    const recentLogs = logs.slice(-9); // últimos 9

    return {
      series: [
        {
          name: "CPU (5sec)",
          data: recentLogs.map((item) =>
            parseFloat(item?.data?.metrics?.cpuLoad5sec || "0")
          ),
        },
      ],
      options: {
        chart: { type: "line", height: 350, toolbar: { show: false } },
        stroke: { curve: "stepline", width: 2, colors: ["#f43f5e"] },
        dataLabels: { enabled: false },
        title: {
          text: "CPU",
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
  max: 100, // Ajustável: se seu equipamento nunca chega a 100%, use 10, 50, etc.
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
