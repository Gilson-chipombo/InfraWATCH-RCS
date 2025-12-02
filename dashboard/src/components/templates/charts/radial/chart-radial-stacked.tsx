"use client";

import { useMemo } from "react";
import dynamic from "next/dynamic";
import { useTheme } from "next-themes";

// Importa dinamicamente o ReactApexChart, só no cliente
const ReactApexChart = dynamic(() => import("react-apexcharts"), { ssr: false });

export const Radialbar = ({ value = 0, description }: { value: number, description?: string }) => {
  const { theme } = useTheme(); // pega o tema atual: "light" ou "dark"

  const textColor = theme === "dark" ? "#ffffff" : "#0f172a"; // corrigi o "#fffff" inválido
  const gradientColors =
    theme === "dark"
      ? ["#6366f1", "#4f46e5", "#4338ca", "#1d4ed8"]
      : ["#60a5fa", "#3b82f6", "#2563eb", "#1d4ed8"];

  // useMemo para recalcular sempre que mudar o tema ou valor
  const chartConfig = useMemo(
    () => ({
      series: [value],
      options: {
        chart: {
          height: 350,
          type: "radialBar",
          offsetY: -10,
        },
        colors: [gradientColors[0]], // cor inicial
        plotOptions: {
          radialBar: {
            startAngle: -135,
            endAngle: 135,
            dataLabels: {
              name: {
                fontSize: "16px",
                offsetY: 120,
                color: textColor,
              },
              value: {
                offsetY: 76,
                fontSize: "22px",
                color: textColor,
                formatter: function (val: number) {
                  return val + "%";
                },
              },
            },
            track: {
              background: theme === "dark" ? "#334155" : "#efefef",
            },
          },
        },
        fill: {
          type: "gradient",
          gradient: {
            shade: "dark",
            shadeIntensity: 0.3,
            gradientToColors: gradientColors, // aplica o gradiente
            inverseColors: false,
            opacityFrom: 1,
            opacityTo: 1,
            stops: [0, 40, 70, 100],
          },
        },
        stroke: {
          dashArray: 4,
        },
        labels: [description],
      },
    }),
    [theme, textColor, gradientColors, value]
  );

  return (
    <div className="w-full flex justify-center">
      <ReactApexChart
        options={chartConfig.options}
        series={chartConfig.series}
        type="radialBar"
        height={350}
      />
    </div>
  );
};
