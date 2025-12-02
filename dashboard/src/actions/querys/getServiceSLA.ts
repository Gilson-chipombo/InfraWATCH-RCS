"use server";

export interface SLAData {
  serviceId: string;
  start: string;
  end: string;
  totalChecks: number;
  upChecks: number;
  downChecks: number;
  uptimePercentage: number;
  upDurationMs: number;
  downDurationMs: number;
  unknownDurationMs: number;
  uptimePercentageByTime: number;
  inferredSampleIntervalMs: number;
}

export interface ServiceData {
  service: string;
  period: string;
  sla: SLAData;
  history: { timestamp: string; uptime: number }[];
}

export interface ServiceItem {
  id: string;
  name: string;
}

export const GetServices = async (): Promise<ServiceItem[] | { error: string }> => {
  const url = process.env.NEXT_PUBLIC_MONITORING_URL as string;
  const req = await fetch(`${url}/api/services`, {
    headers: { Accept: "application/json" },
    cache: "no-store",
  });

  if (!req.ok) return { error: "Erro ao buscar serviços" };

  return req.json();
};

export const GetServiceSLA = async ({
  serviceId,
  period,
}: {
  serviceId: string;
  period: string;
}): Promise<ServiceData | { error: string }> => {
  const url = process.env.NEXT_PUBLIC_MONITORING_URL as string;
  const req = await fetch(`${url}/api/sla/${serviceId}/${period}`, {
    headers: { Accept: "application/json" },
    cache: "no-store",
  });

  if (!req.ok) return { error: "Erro ao buscar SLA" };

  return req.json();
};

export const DownloadServiceSLAPDF = async ({
  serviceId,
  period,
}: {
  serviceId: string;
  period: string;
}) => {
  const url = process.env.NEXT_PUBLIC_MONITORING_URL as string;
  const req = await fetch(`${url}/api/sla/${serviceId}/${period}?format=pdf`, {
    headers: { Accept: "application/pdf" },
    cache: "no-store",
  });

  if (!req.ok) return { error: "Falha ao gerar PDF" };

  const blob = await req.blob();
  return blob;
};
