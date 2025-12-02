import os from "os";
import { NextRequest } from "next/server";
import {formatBytes} from "@/config/uitl1";

function getLocalIPv4() {
  const networkInterfaces = os.networkInterfaces();
  for (const iface of Object.values(networkInterfaces)) {
    if (!iface) continue;
    for (const alias of iface) {
      if (alias.family === "IPv4" && !alias.internal) {
        return alias.address;
      }
    }
  }
  return "Não disponível";
}

function formatUptime(seconds: number) {
  const days = Math.floor(seconds / (3600 * 24));
  const hours = Math.floor((seconds % (3600 * 24)) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  return `${days}d ${hours}h ${minutes}m`;
}

let prevCpuTimes: { totalIdle: number; totalTick: number } | null = null;

export async function GET(req: NextRequest) {
  const stream = new ReadableStream({
    start(controller) {
      const encoder = new TextEncoder();

      const sendData = () => {
        // CPU usage
        const cpus = os.cpus();
        let totalIdle = 0,
          totalTick = 0;

        cpus.forEach((cpu) => {
          for (const type in cpu.times) {
            totalTick += cpu.times[type as keyof typeof cpu.times];
          }
          totalIdle += cpu.times.idle;
        });

        let cpuUsage = 0;
        if (prevCpuTimes) {
          const diffIdle = totalIdle - prevCpuTimes.totalIdle;
          const diffTick = totalTick - prevCpuTimes.totalTick;
          cpuUsage = 1 - diffIdle / diffTick;
        }
        prevCpuTimes = { totalIdle, totalTick };

        // Memory usage
        const freeMemory = os.freemem();
        const totalMemory = os.totalmem();
        const memoryUsage = (totalMemory - freeMemory) / totalMemory;

        // System data
        const data = {
          cpu: {
            usagePercent: (cpuUsage * 100).toFixed(2) + "%",
            cores: cpus.length,
            model: cpus[0]?.model || "Desconhecido",
          },
          memory: {
            usagePercent: (memoryUsage * 100).toFixed(2) + "%",
            total: formatBytes(totalMemory),
            free: formatBytes(freeMemory),
            used: formatBytes(totalMemory - freeMemory),
          },
          system: {
            hostname: os.hostname(),
            platform: os.platform(),
            type: os.type(),
            version: os.release(),
            uptime: formatUptime(os.uptime()),
            ip: getLocalIPv4(),
          },
        };

        controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
      };

      // Envia de imediato
      sendData();
      // A cada 15 segundos
      const interval = setInterval(sendData, 15000);

      req.signal.addEventListener("abort", () => {
        clearInterval(interval);
        controller.close();
      });
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}
