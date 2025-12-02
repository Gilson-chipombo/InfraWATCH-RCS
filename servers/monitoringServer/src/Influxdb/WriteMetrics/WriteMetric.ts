import { Point } from '@influxdata/influxdb-client';
import { writeApi } from "../influxdb"

export function writeMetric(serviceId: string, status: string)
{
  const point = new Point('service_status')
    .tag('serviceId', serviceId)
    .stringField('status', status)
    .timestamp(new Date());

  writeApi.writePoint(point);
  writeApi.flush();
}
