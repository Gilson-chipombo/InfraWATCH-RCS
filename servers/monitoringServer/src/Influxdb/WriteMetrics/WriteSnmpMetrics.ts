import { Point } from "@influxdata/influxdb-client";
import { writeApi } from "../influxdb";

export async function writeSnmpMetrics(serviceId: string, data: any) {
  const points: Point[] = [];

  // === SNMP System ===
  const systemPoint = new Point("snmp_system")
    .tag("serviceId", serviceId)
    .tag("ip", data.ip)
    .tag("sysName", data.sysName || "unknown")
    .stringField("sysDescr", data.metrics.sysDescr || "N/A")
    .stringField("sysUpTime", data.metrics.sysUpTime || "N/A");

  // CPU load
  ["cpuLoad5sec", "cpuLoad1min", "cpuLoad5min"].forEach((key) => {
    const value = data.metrics[key];
    if (value != null && !isNaN(Number(value))) {
      systemPoint.floatField(key, Number(value));
    }
  });

  // Memória
  if (data.metrics.memFree != null && !isNaN(Number(data.metrics.memFree))) {
    const memFreeValue = Number(data.metrics.memFree);
    systemPoint.intField("memFreeBytes", memFreeValue);
  }
  if (data.metrics.memTotal != null && !isNaN(Number(data.metrics.memTotal))) {
    const memTotalValue = Number(data.metrics.memTotal);
    systemPoint.intField("memTotalBytes", memTotalValue);

    const memFreeBytes = systemPoint.fields["memFreeBytes"];
    if (memFreeBytes && typeof memFreeBytes === "number") {
      const usedPercent = ((memTotalValue - memFreeBytes) / memTotalValue) * 100;
      systemPoint.floatField("memUsedPercent", usedPercent);
    }
  }

  systemPoint.timestamp(new Date(data.timestamp));
  points.push(systemPoint);

  // === Interfaces ===
  if (data.interfaces && Array.isArray(data.interfaces)) {
    for (const iface of data.interfaces) {
      const ifacePoint = new Point("snmp_interface")
        .tag("serviceId", serviceId)
        .tag("ip", data.ip)
        .tag("sysName", data.sysName || "unknown")
        .tag("ifIndex", String(iface.index))
        .tag("ifName", iface.name || "unknown")
        .tag("ifType", iface.type || "unknown")
        .tag("adminStatus", iface.adminStatus || "unknown")
        .tag("operStatus", iface.operStatus || "unknown");

      if (iface.mac) ifacePoint.stringField("mac", iface.mac);
      if (iface.ip) ifacePoint.stringField("ipAddress", iface.ip);

      if (iface.speed != null && !isNaN(Number(iface.speed))) {
        ifacePoint.intField("speedBps", Number(iface.speed));
      }

      if (iface.inOctets != null && !isNaN(Number(iface.inOctets))) {
        ifacePoint.intField("inBytes", Number(iface.inOctets));
      }

      if (iface.outOctets != null && !isNaN(Number(iface.outOctets))) {
        ifacePoint.intField("outBytes", Number(iface.outOctets));
      }

      if (iface.inErrors != null && !isNaN(Number(iface.inErrors))) {
        ifacePoint.intField("inErrors", Number(iface.inErrors));
      }

      if (iface.outErrors != null && !isNaN(Number(iface.outErrors))) {
        ifacePoint.intField("outErrors", Number(iface.outErrors));
      }

      ifacePoint.timestamp(new Date(data.timestamp));
      points.push(ifacePoint);
    }
  }

  // === Summary ===
  const summaryPoint = new Point("snmp_summary")
    .tag("serviceId", serviceId)
    .tag("ip", data.ip)
    .tag("sysName", data.sysName || "unknown")
    .intField("totalInterfaces", data.interfaces?.length || 0)
    .intField(
      "interfacesUp",
      data.interfaces?.filter((i: any) => i.operStatus === "up").length || 0
    )
    .intField(
      "interfacesDown",
      data.interfaces?.filter((i: any) => i.operStatus === "down").length || 0
    )
    .timestamp(new Date(data.timestamp));

  if (data.interfaces && Array.isArray(data.interfaces)) {
    let totalInBytes = 0;
    let totalOutBytes = 0;
    let totalErrors = 0;

    for (const iface of data.interfaces) {
      if (iface.operStatus === "up") {
        if (iface.inOctets != null) totalInBytes += Number(iface.inOctets);
        if (iface.outOctets != null) totalOutBytes += Number(iface.outOctets);
        if (iface.inErrors != null) totalErrors += Number(iface.inErrors) || 0;
        if (iface.outErrors != null) totalErrors += Number(iface.outErrors) || 0;
      }
    }

    summaryPoint
      .intField("totalInBytes", totalInBytes)
      .intField("totalOutBytes", totalOutBytes)
      .intField("totalErrors", totalErrors);
  }

  points.push(summaryPoint);

  // === Sensores ===
  if (Array.isArray(data.metrics.temperature)) {
    data.metrics.temperature.forEach((temp: string, idx: number) => {
      const value = parseFloat(temp);
      if (!isNaN(value)) {
        points.push(
          new Point("snmp_sensor")
            .tag("serviceId", serviceId)
            .tag("ip", data.ip)
            .tag("sysName", data.sysName || "unknown")
            .tag("type", "temperature")
            .tag("index", String(idx))
            .floatField("value", value)
            .timestamp(new Date(data.timestamp))
        );
      }
    });
  }

  if (Array.isArray(data.metrics.fanStatus)) {
    data.metrics.fanStatus.forEach((status: string, idx: number) => {
      points.push(
        new Point("snmp_sensor")
          .tag("serviceId", serviceId)
          .tag("ip", data.ip)
          .tag("sysName", data.sysName || "unknown")
          .tag("type", "fan")
          .tag("index", String(idx))
          .stringField("status", status)
          .timestamp(new Date(data.timestamp))
      );
    });
  }

  if (Array.isArray(data.metrics.psuStatus)) {
    data.metrics.psuStatus.forEach((status: string, idx: number) => {
      points.push(
        new Point("snmp_sensor")
          .tag("serviceId", serviceId)
          .tag("ip", data.ip)
          .tag("sysName", data.sysName || "unknown")
          .tag("type", "psu")
          .tag("index", String(idx))
          .stringField("status", status)
          .timestamp(new Date(data.timestamp))
      );
    });
  }

  if (Array.isArray(data.metrics.powerDraw)) {
    data.metrics.powerDraw.forEach((pwr: string, idx: number) => {
      const match = pwr.match(/^([\d.]+)\s*W/i);
      const value = match ? parseFloat(match[1]) : null;
      if (value !== null && !isNaN(value)) {
        points.push(
          new Point("snmp_sensor")
            .tag("serviceId", serviceId)
            .tag("ip", data.ip)
            .tag("sysName", data.sysName || "unknown")
            .tag("type", "power")
            .tag("index", String(idx))
            .floatField("watts", value)
            .timestamp(new Date(data.timestamp))
        );
      }
    });
  }

  // === Write all points ===
  for (const point of points) {
    if (Object.keys(point.fields).length > 0) {
      writeApi.writePoint(point);
    } else {
      console.log("Point ignorado por não ter fields:", point.toLineProtocol());
    }
  }

  await writeApi.flush();
}
