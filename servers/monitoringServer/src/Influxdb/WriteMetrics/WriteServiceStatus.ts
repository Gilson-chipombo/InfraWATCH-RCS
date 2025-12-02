import { Point } from "@influxdata/influxdb-client";
import { queryApi } from '../../Influxdb/influxdb';
import { writeApi } from "../influxdb"

export async function writeServiceStatus(params: { serviceId: string; status: "UP" | "DOWN"; latency?: number;})
{
  const { serviceId, status, latency } = params;

  writeApi.useDefaultTags({ serviceId });

  const point = new Point("service_status")
    .tag("serviceId", serviceId)
    .stringField("status", status)
    .booleanField("isUp", status === "UP")
    .timestamp(new Date());

  if (latency !== undefined)
  {
    point.floatField("latency_ms", latency);
  }

  writeApi.writePoint(point);

  try
  {
    await writeApi.flush();
  }
  catch (err)
  {
    console.error("Erro ao gravar status no Influx:", err);
  }
}

export async function countRecentUps(serviceId: string, minutes: number)
{
  const fluxQuery = `
    from(bucket: "${process.env.INFLUX_BUCKET}")
      |> range(start: -${minutes}m)
      |> filter(fn: (r) => r._measurement == "service_status")
      |> filter(fn: (r) => r.serviceId == "${serviceId}")
      |> filter(fn: (r) => r._field == "isUp")
      |> filter(fn: (r) => r._value == true)
      |> count()
  `;

  return new Promise<number>((resolve, reject) =>
  {
    let count = 0;
    queryApi.queryRows(fluxQuery,
    {
      next: (row, tableMeta) =>
      {
        const o = tableMeta.toObject(row);
        count = o._value;
      },
      error: reject,
      complete: () => resolve(count),
    });
  });
}

