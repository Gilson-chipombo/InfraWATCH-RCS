import { InfluxDB } from '@influxdata/influxdb-client';

const url = process.env.INFLUX_URL!;
const token = process.env.INFLUX_TOKEN!;
export const org = process.env.INFLUX_ORG!;
const bucket = process.env.INFLUX_BUCKET!;

export const influxDB = new InfluxDB({ url, token });

export const writeApi = influxDB.getWriteApi(org, bucket, 'ms');
export const queryApi = influxDB.getQueryApi(org);
