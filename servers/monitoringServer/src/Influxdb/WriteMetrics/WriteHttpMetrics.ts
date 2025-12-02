import { Point } from '@influxdata/influxdb-client';
import { writeApi } from "../influxdb"

export function writeHttpMetrics(serviceId: string, data: any) {
  const point = new Point("http_metrics")
    .tag("serviceId", serviceId)
    .tag("serviceName", data.serviceName ?? "") // <-- adicionado
    .stringField("status", data.status ?? "")
    .intField("httpStatus", data.httpStatus ?? 0)
    .stringField("ip", data.ip ?? "")
    .intField("sizeBytes", data.sizeBytes ?? 0)
    .floatField("dnsMs", data.dnsMs ?? 0)
    .floatField("connectAndDownloadMs", data.connectAndDownloadMs ?? 0)
    .floatField("totalMs", data.totalMs ?? 0)
    .timestamp(new Date());

  if (data.headers) {
    Object.entries(data.headers).forEach(([key, value]) => {
      const headerPoint = new Point("service_http_header")
        .tag("serviceId", serviceId)
        .tag("serviceName", data.serviceName ?? "") // <-- também aqui
        .tag("header", key)
        .stringField("value", String(value))
        .timestamp(new Date());

      writeApi.writePoint(headerPoint);
    });
  }

  writeApi.writePoint(point);
  writeApi.flush();
}
