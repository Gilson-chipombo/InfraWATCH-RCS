import { Point } from '@influxdata/influxdb-client';
import { writeApi } from "../influxdb"

export async function writeSlaRecordToInflux(slaRecord: {
    serviceId: string;
    serviceName: string;
    metric: string;
    value: number;
    status: boolean;
    criticality: string;
  }) {
    const point = new Point('sla_records')
      .tag('serviceId', slaRecord.serviceId)
      .tag('serviceName', slaRecord.serviceName)
      .tag('metric', slaRecord.metric)
      .tag('criticality', slaRecord.criticality)
      .floatField('value', slaRecord.value)
      .intField('status', slaRecord.status ? 1 : 0)
      .timestamp(new Date());
  
    writeApi.writePoint(point);
    await writeApi.flush();
  }