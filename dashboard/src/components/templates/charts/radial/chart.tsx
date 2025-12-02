"use client";

import { useMemo } from "react";
import dynamic from "next/dynamic";
import { useTheme } from "next-themes";

const ReactApexChart = dynamic(() => import("react-apexcharts"), { ssr: false });

type PieData = {
  label: string;
  value: number;
};

export const SimplePieChart = ({ data }: { data: PieData[] }) => {
  const { theme } = useTheme();

  const chartConfig = useMemo(() => {
    const textColor = theme === "dark" ? "#f8f8f8" : "#333";

    return {
      series: data.map((item) => item.value),
      options: {
        chart: {
          type: "pie",
        },
        labels: data.map((item) => item.label),
        legend: {
          position: "right",
          labels: { colors: textColor },
        },
        dataLabels: {
          style: { colors: [textColor] },
        },
        colors: ["#3b82f6", "#f59e0b", "#10b981", "#ef4444", "#8b5cf6"],
        stroke: {
          colors: [theme === "dark" ? "#1a1a1a" : "#fff"], 
          width: 2,
        },
      },
    };
  }, [theme, data]);

  return (
    <div className="w-full flex justify-center">
      <ReactApexChart
        options={chartConfig.options}
        series={chartConfig.series}
        type="pie"
        width={350}
      />
    </div>
  );
};
