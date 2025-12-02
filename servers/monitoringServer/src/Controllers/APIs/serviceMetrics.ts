import { queryApi } from '../../Influxdb/influxdb';

interface MetricRow {
  _time: string;
  [key: string]: any;
}

export async function queryMetrics(
  serviceId: string,
  measurement: string
): Promise<MetricRow[]> {
  const query = `
    from(bucket: "${process.env.INFLUX_BUCKET}")
      |> range(start: -1m)
      |> filter(fn: (r) => r._measurement == "${measurement}" and r.serviceId == "${serviceId}")
      |> last()
      |> pivot(rowKey:["_time"], columnKey: ["_field"], valueColumn: "_value")
  `;


  try {
    const rows = await queryApi.collectRows<MetricRow>(query);
    return rows;
  } catch (error: any) {
    console.log(error.message)
    throw new Error(`Erro na consulta InfluxDB: ${error.message}`);
  }
}

export async function getPingMetrics(serviceId: string) {
  try {
    const rows = await queryMetrics(serviceId, 'ping_metrics');
    const row = rows[0];
    if (!row) return null;

    const transmitted = row.packets_transmitted || 0;
    const received = row.packets_received || 0;

    return {
      time: row._time,
      serviceId,
      serviceName: row.serviceName || 'unknown', // <-- corrigido
      packets_transmitted: transmitted,
      packets_received: received,
      percent_packet_loss: row.percent_packet_loss || 0,
      minimum_response_ms: row.minimum_response_ms || 0,
      maximum_response_ms: row.maximum_response_ms || 0,
      average_response_ms: row.average_response_ms || 0,
      standard_deviation_ms: row.standard_deviation_ms || 0,
      ttl: row.ttl || null,
      status: row.status || (received > 0 ? 'UP' : 'DOWN'),
    };
  } catch (error) {
    throw error;
  }
}


export async function getSnmpMetrics(serviceId: string) {
  try {
    const systemRows = await queryMetrics(serviceId, "snmp_system");
    const system = systemRows[0]
      ? {
          time: systemRows[0]._time,
          sysName: systemRows[0].sysName || "unknown",
          sysDescr: systemRows[0].sysDescr || "N/A",
          sysUpTime: systemRows[0].sysUpTime || "N/A",
          cpuLoad5sec: systemRows[0].cpuLoad5sec || 0,
          cpuLoad5min: systemRows[0].cpuLoad5min || 0,
          memFreeBytes: systemRows[0].memFreeBytes || 0,
          memTotalBytes: systemRows[0].memTotalBytes || 0,
          memUsedPercent: systemRows[0].memUsedPercent || 0,
        }
      : null;

    const ifaceRows = await queryMetrics(serviceId, "snmp_interface");
    const interfaces = ifaceRows.map((row) => ({
      time: row._time,
      ifIndex: row.ifIndex,
      ifName: row.ifName,
      ifType: row.ifType,
      adminStatus: row.adminStatus,
      operStatus: row.operStatus,
      mac: row.mac,
      speedBps: row.speedBps || 0,
      inBytes: row.inBytes || 0,
      outBytes: row.outBytes || 0,
      inErrors: row.inErrors || 0,
      outErrors: row.outErrors || 0,
      ip: row.ipAddress || null,
    }));

    const summaryRows = await queryMetrics(serviceId, "snmp_summary");
    const summary = summaryRows[0]
      ? {
          time: summaryRows[0]._time,
          totalInterfaces: summaryRows[0].totalInterfaces || 0,
          interfacesUp: summaryRows[0].interfacesUp || 0,
          interfacesDown: summaryRows[0].interfacesDown || 0,
          totalInBytes: summaryRows[0].totalInBytes || 0,
          totalOutBytes: summaryRows[0].totalOutBytes || 0,
          totalErrors: summaryRows[0].totalErrors || 0,
        }
      : null;

    const sensorRows = await queryMetrics(serviceId, "snmp_sensor");
    const sensors = {
      temperature: [] as { time: string; index: string; value: number }[],
      fanStatus: [] as { time: string; index: string; status: string }[],
      psuStatus: [] as { time: string; index: string; status: string }[],
      powerDraw: [] as { time: string; index: string; watts: number }[],
    };

    for (const row of sensorRows) {
      switch (row.type) {
        case "temperature":
          sensors.temperature.push({
            time: row._time,
            index: row.index,
            value: row.value,
          });
          break;
        case "fan":
          sensors.fanStatus.push({
            time: row._time,
            index: row.index,
            status: row.status,
          });
          break;
        case "psu":
          sensors.psuStatus.push({
            time: row._time,
            index: row.index,
            status: row.status,
          });
          break;
        case "power":
          sensors.powerDraw.push({
            time: row._time,
            index: row.index,
            watts: row.watts,
          });
          break;
      }
    }

    return { system, interfaces, summary, sensors };
  } catch (error) {
    throw error;
  }
}

export async function getHttpMetrics(serviceId: string) {
  try {
    const rows = await queryMetrics(serviceId, 'http_metrics');
    const row = rows[0];
    if (!row) return null;

    return {
      time: row._time,
      serviceId,
      serviceName: row.serviceName || 'unknown', // <-- adicionado
      status: row.status || 'unknown',
      httpStatus: row.httpStatus || 0,
      ip: row.ip || '',
      sizeBytes: row.sizeBytes || 0,
      dnsMs: row.dnsMs || 0,
      connectAndDownloadMs: row.connectAndDownloadMs || 0,
      totalMs: row.totalMs || 0,
      headers: row.headers
        ? (typeof row.headers === 'string'
            ? JSON.parse(row.headers)
            : row.headers)
        : {},
    };
  } catch (error: any) {
    throw new Error(`Erro ao buscar métricas HTTP: ${error.message}`);
  }
}


export async function getWebhookMetrics(serviceId: string) {
  try {
    const rows = await queryMetrics(serviceId, 'webhook_metrics');
    const row = rows[0];
    if (!row) return null;

    return {
      time: row._time,
      status: row.status || 'unknown',
      httpStatus: row.httpStatus || 0,
      ip: row.ip || null,
      sizeBytes: row.sizeBytes || 0,
      dnsMs: row.dnsMs || 0,
      connectAndDownloadMs: row.connectAndDownloadMs || 0,
      totalMs: row.totalMs || 0,
      headers: row.headers || {},
      payloadSent: row.payloadSent || null,
      responseBody: row.responseBody || null,
    };
  } catch (error) {
    throw error;
  }
}
