"use client";
import { useEffect, useState } from "react";
import { Radialbar } from "@/src/components/templates/charts/radial/chart-radial-stacked";
import { SimplePieChart } from "@/src/components/templates/charts/radial/chart";
import { HorizontalBarChart } from "@/src/components/templates/charts/customBar/custo";
import { LineSteplineChartCPU } from "@/src/components/templates/charts/radial/chart-LineCPU";
import { LineSteplineChartMemory } from "@/src/components/templates/charts/radial/chart-LineMemory";
import { cn } from "@/src/lib/utils";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from "@/src/components/ui/table";
import { SnmpMessage, NetworkInterface } from "@/src/types/interfaces";
import { getTemperatureColor } from "@/config/uitl1";


// Hook para persistir métricas no localStorage
function usePersistedMetrics(key: string, evento?: SnmpMessage, logs: SnmpMessage[] = []) {
  const [cachedEvento, setCachedEvento] = useState<SnmpMessage | undefined>(evento);
  const [cachedLogs, setCachedLogs] = useState<SnmpMessage[]>(logs);

  // carregar do localStorage quando abrir a tela
  useEffect(() => {
    const savedEvento = localStorage.getItem(`${key}-evento`);
    const savedLogs = localStorage.getItem(`${key}-logs`);

    if (savedEvento) setCachedEvento(JSON.parse(savedEvento));
    if (savedLogs) setCachedLogs(JSON.parse(savedLogs));
  }, [key]);

  // sempre que o evento mudar, salvar localmente
  useEffect(() => {
    if (evento) {
      localStorage.setItem(`${key}-evento`, JSON.stringify(evento));
      setCachedEvento(evento);
    }
  }, [evento, key]);

  // sempre que os logs mudarem, salvar localmente
  useEffect(() => {
    if (logs.length > 0) {
      localStorage.setItem(`${key}-logs`, JSON.stringify(logs));
      setCachedLogs(logs);
    }
  }, [logs, key]);

  return { evento: cachedEvento, logs: cachedLogs };
}


export function DashboardContent({
  evento,
  logs,
  socketStatus,
  url
}: {
  evento?: SnmpMessage,
  logs: SnmpMessage[],
  socketStatus: number,
  url: URLSearchParams
}) {

  const cacheKey = `device-${url.get("target")}`;
  const { evento: cachedEvento, logs: cachedLogs } = usePersistedMetrics(cacheKey, evento, logs);

  const upInterfaces = cachedEvento?.data.interfaces?.filter(
    (item) => item.adminStatus === "up" && item.operStatus === "up"
  ).length || 0;

  return (
    <div className="">
      <div className="">
        <div className="flex flex-col gap-2">
          <div className="grid grid-cols-[1.5fr_1fr_1fr_1fr_1fr] gap-2">
            <div className="card items-center justify-center">
              <span className="text-blue-800 text-2xl">{url.get("name")}</span>
            </div>
            <div className="card items-center">
              {
                socketStatus == -1 ? (
                  <span className="text-orange-600-700 text-3xl" />
                ) : socketStatus == 1 ? (
                  <span className="text-green-700 text-3xl">connected</span>
                ) : (
                  <span className="text-red-700 text-3xl">disconnect</span>
                )
              }
            </div>
            <div className="card items-center relative">
              <div className="w-full absolute top-2 left-4">
                <span className="text-sm">Device</span>
              </div>
              <div className="mt-6">
                <span className="text-green-700">
                  {cachedEvento?.data.sysName || "-------"}
                </span>
              </div>
            </div>
            <div className="card items-center relative">
              <div className="w-full absolute top-2 left-4">
                <span className="text-sm">System uptime</span>
              </div>
              <div className="mt-6">
                <span className="text-green-700">
                  {cachedEvento?.data.metrics.sysUpTime || "-------"}
                </span>
              </div>
            </div>
            <div className="card items-center relative">
              <div className="w-full absolute top-2 left-4">
                <span className="text-sm">Vendor</span>
              </div>
              <div className="mt-6">
                <span className="text-green-700">
                  {cachedEvento?.data.vendor || "-------"}
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-[1fr_1fr_2fr_1.5fr] gap-2">
            <div className={cn("card", "justify-center")}>
              <div>
                <Radialbar value={parseFloat(cachedEvento?.data.metrics.cpuLoad5sec || 0)} description="CPU Load(5sec)" />
              </div>
            </div>
            <div className={cn("card", "justify-center")}>
              <Radialbar
                value={
                  cachedEvento?.data.metrics?.memTotal
                    ? parseFloat(
                      (((cachedEvento.data.metrics.memTotal - cachedEvento.data.metrics.memFree) / cachedEvento.data.metrics.memTotal) * 100).toFixed(2)
                    )
                    : 0
                }
                description="Memory Used (%)"
              />
            </div>
            <div className={cn("card", "justify-start")}>
              <Table className="">
                <TableHeader>
                  <TableRow>
                    <TableHead>Timestamp</TableHead>
                    <TableHead>Dispositivo</TableHead>
                    <TableHead>IP</TableHead>
                    <TableHead>Vendor</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Resumo</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {cachedLogs.slice(-9).reverse().map((item, index) => {
                    const memBytes = item.data.metrics?.memFree;
                    const resumo = `CPU ${item.data.metrics?.cpuLoad5sec || 0}% | Mem ${
                      memBytes ? (memBytes / (1024 ** 2)).toFixed(2) + " MB" : "-"
                    }`;
                    return (
                      <TableRow key={index}>
                        <TableCell className="text-[8pt]">{item.data.timestamp}</TableCell>
                        <TableCell className="text-[8pt]">{item.data.sysName}</TableCell>
                        <TableCell className="text-[8pt]">{item.data.ip}</TableCell>
                        <TableCell className="text-[8pt]">{item.data.vendor}</TableCell>
                        <TableCell className="text-[8pt]">{item.type}</TableCell>
                        <TableCell className="text-[8pt]">{resumo}</TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>

            <div className={cn("flex flex-col gap-2", "items-start w-full")}>
              <div className="card w-full">
                <div className="w-full flex flex-col">
                  <span className="my-2">Power Draw</span>
                  <div className="flex items-center flex-row  justify-center">
                    <HorizontalBarChart value={parseFloat(cachedEvento?.data.metrics.powerDraw[0]?.split(" ")[0])} className="" background="rgb(0,255,0)" />
                    <span className="px-2 text-sm w-[120px] mt-2 text-center text-green-600">
                      {cachedEvento?.data.metrics.powerDraw[0] || 0}
                    </span>
                  </div>
                </div>
              </div>

              <div className="card flex-1 w-full justify-center">
                <span>Temperatura</span>
                <div>
                  {cachedEvento?.data.metrics.temperature?.map((t, idx) => (
                    <div key={idx} className="w-full flex flex-col">
                      <div className="flex items-center flex-row justify-center">
                        <span className="px-2 text-sm w-[120px] mt-2 text-right">
                          {["BACK", "CPU", "FRONT", "Homewood"][idx] || `Sensor ${idx}`}
                        </span>
                        <HorizontalBarChart value={parseFloat(t?.split(" ")[0])} className="" />
                        <span
                          className={`px-2 text-xl w-[120px] mt-2 text-center font-bold ${getTemperatureColor(
                            parseFloat(t?.split(" ")[0] || "0")
                          )}`}
                        >
                          {t || 0}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-[1.5fr_1fr_2.5fr] gap-2">
            <div className="flex flex-row w-full gap-2">
              <div className="card w-1/2 relative justify-center">
                <div className="w-full absolute top-2 left-4">
                  <span className="text-sm">Interfaces</span>
                </div>
                <div className="mt-6 py-4 text-center">
                  <span className="text-purple-400 text-7xl">
                    {cachedEvento?.data.interfaces.length}
                  </span>
                </div>
              </div>
              <div className="card w-1/2 relative justify-center">
                <div className="w-full absolute top-2 left-4">
                  <span className="text-sm">Interface UP</span>
                </div>
                <div className="mt-6 py-4 text-center">
                  <span className="text-green-700 text-7xl">
                    {upInterfaces}
                  </span>
                </div>
              </div>
            </div>
            <div className="card justify-center">
              <SimplePieChart
                data={[
                  { label: "UP", value: upInterfaces },
                  { label: "DOWN", value: (cachedEvento?.data.interfaces.length - upInterfaces) },
                ]}
              />
            </div>
            <div className="card overflow-auto  max-h-[280px]">
              <Table className="h-full ">
                <TableHeader className="h-[30px]">
                  <TableRow className="font-bold hover:bg-transparent">
                    <TableHead className="pl-7">Interface</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Velocidade</TableHead>
                    <TableHead>MAC</TableHead>
                    <TableHead>IP</TableHead>
                    <TableHead>In</TableHead>
                    <TableHead>Out</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody className="overflow-auto">
                  {cachedEvento?.data?.interfaces?.map((item: NetworkInterface, index: number) => {
                    const hasIp = true;
                    const isNullName = item?.name?.toLowerCase().startsWith("null");

                    if (hasIp || isNullName) {
                      return (
                        <TableRow key={index} className="text-sm">
                          <TableCell className="text-[10pt] pl-7">{item?.name || "-"}</TableCell>
                          <TableCell className="text-[10pt]">
                            {item?.adminStatus}/{item?.operStatus}
                          </TableCell>
                          <TableCell className="text-[10pt]">
                            {item?.speed ? (
                              item.speed >= 4294967295
                                ? (item.speed / 1_000_000_000).toFixed(2) + " Gbps"
                                : (item.speed / 1_000_000).toFixed(2) + " Mbps"
                            ) : (
                              "-"
                            )}
                          </TableCell>
                          <TableCell className="text-[10pt]">{item?.mac || "-"}</TableCell>
                          <TableCell className="text-[10pt]">{item?.ip || "-"}</TableCell>
                          <TableCell className="text-[10pt]">{item?.inOctets ?? "-"}</TableCell>
                          <TableCell className="text-[10pt]">{item?.outOctets ?? "-"}</TableCell>
                        </TableRow>
                      );
                    }
                    return null;
                  })}
                </TableBody>
              </Table>
            </div>
          </div>
          <div className="w-full grid grid-cols-[1fr_1fr] gap-2">
            <div className="card"><LineSteplineChartCPU logs={cachedLogs} /></div>
            <div className="card"><LineSteplineChartMemory logs={cachedLogs} /></div>
          </div>
        </div>
      </div>
    </div>
  );
}
