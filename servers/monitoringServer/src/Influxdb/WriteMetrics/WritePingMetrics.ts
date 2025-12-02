import { Point } from '@influxdata/influxdb-client';
import { writeApi } from "../influxdb"

export function writePingMetrics(serviceId: string, metrics: any)
{
  const point = new Point('ping_metrics')
    .tag('serviceId', serviceId)

    .tag('serviceName', metrics.serviceName)

    .floatField('percent_packet_loss', metrics.percent_packet_loss)

    .floatField('minimum_response_ms', metrics.minimum_response_ms)

    .floatField('maximum_response_ms', metrics.maximum_response_ms)

    .floatField('average_response_ms', metrics.average_response_ms)

    .floatField('standard_deviation_ms', metrics.standard_deviation_ms)

    .intField('packets_transmitted', metrics.packets_transmitted)

    .intField('packets_received', metrics.packets_received)

    .intField('result_code', metrics.result_code ?? 0)
    .intField('ttl', metrics.ttl ?? 0)

    .stringField('status', metrics.status);

  writeApi.writePoint(point);
  writeApi.flush();
}