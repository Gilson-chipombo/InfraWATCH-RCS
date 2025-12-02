export function formatBytes(bytes: number, decimals = 2) {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + (sizes[i] || "");
}


export function formatMs(ms: number, decimals = 2) {
    if (ms < 1000) return `${ms.toFixed(decimals)} ms`;
    const seconds = ms / 1000;
    if (seconds < 60) return `${seconds.toFixed(decimals)} s`;
    const minutes = seconds / 60;
    return `${minutes.toFixed(decimals)} min`;
}


export function formatPercent(value: number) {
    return `${value * 100}`;
}


export const generateToken = (digit: number) => {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let link = '';
    for (let i = 0; i < digit; i++) {
        link += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return link;
};

export function getTemperatureColor(temp: number) {
  if (temp < 30) return "text-green-600";     // frio/ok
  if (temp < 50) return "text-yellow-500";    // alerta
  if (temp < 70) return "text-orange-500";    // quente
  return "text-red-600";                      // crítico
}

export function transformApiToSocket(apiData: any) {
  return {
    type: "snmp",
    ip: apiData?.interfaces?.find((i: any) => i.ip)?.ip ?? "",
    data: {
      serviceId: "", // pode preencher se existir
      timestamp: apiData.system.time,
      type: "SNMP",
      ip: apiData?.interfaces?.find((i: any) => i.ip)?.ip ?? "",
      sysName: apiData.system.sysName,
      vendor: "cisco", // pode ajustar se tiver
      metrics: {
        sysDescr: apiData.system.sysDescr,
        sysUpTime: apiData.system.sysUpTime,
        cpuLoad5sec: apiData.system.cpuLoad5sec,
        cpuLoad1min: apiData.system.cpuLoad1min,
        cpuLoad5min: apiData.system.cpuLoad5min,
        memFree: apiData.system.memFreeBytes,
        memTotal: apiData.system.memTotalBytes,
        temperature: apiData.sensors.temperature.map((t: any) => `${t.value} °C`),
        fanStatus: apiData.sensors.fanStatus.map((f: any) => f.status),
        psuStatus: apiData.sensors.psuStatus.map((p: any) => p.status ?? "unknown"),
        powerDraw: apiData.sensors.powerDraw.map((p: any) => `${p.watts} W`)
      },
      interfaces: apiData.interfaces.map((intf: any) => ({
        index: intf.ifIndex,
        name: intf.ifName,
        type: intf.ifType,
        adminStatus: intf.adminStatus,
        operStatus: intf.operStatus,
        mac: intf.mac,
        speed: intf.speedBps,
        inOctets: intf.inBytes,
        outOctets: intf.outBytes,
        ip: intf.ip ?? undefined
      }))
    }
  };
}
