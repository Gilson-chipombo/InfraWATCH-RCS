import { Problem } from "../types/Problem";

export interface PingResult {
  status: string;
  lossPercent: number;
  avgMs?: number;
  minMs?: number;
  maxMs?: number;
  mdevMs?: number;
}

export function analyzePingIssue(
  service: { id: string; name: string },
  result: PingResult | null
): Problem | null {
  const timestamp = new Date().toISOString();

  if (!result) {
    return {
      serviceId: service.id,
      serviceName: service.name,
      metric: "PING",
      value: 0,
      status: "DOWN",
      severity: "CRITICAL",
      priority: 1,
      description: "Sem resposta — pode ser firewall ou host inexistente.",
      recommendation: "Verifique conectividade de rede e se o host existe.",
      timestamp,
    };
  }

  if (result.lossPercent === 100) {
    return {
      serviceId: service.id,
      serviceName: service.name,
      metric: "PING",
      value: 100,
      status: "DOWN",
      severity: "CRITICAL",
      priority: 1,
      description: "Indisponibilidade total — 100% de perda de pacotes.",
      technicalDetails: formatTechnical(result),
      recommendation:
        "Verifique se o host está ativo e se há bloqueio ICMP no firewall.",
      timestamp,
    };
  }

  if (result.lossPercent >= 50) {
    return {
      serviceId: service.id,
      serviceName: service.name,
      metric: "PING",
      value: result.lossPercent,
      status: "DOWN",
      severity: "HIGH",
      priority: 2,
      description: "Alta perda de pacotes — rede instável ou congestionada.",
      technicalDetails: formatTechnical(result),
      recommendation:
        "Verifique qualidade do link e possíveis falhas de roteamento.",
      timestamp,
    };
  }

  if (result.avgMs && result.avgMs > 200) {
    return {
      serviceId: service.id,
      serviceName: service.name,
      metric: "PING",
      value: result.avgMs,
      status: "DOWN",
      severity: "HIGH",
      priority: 2,
      description: `Latência crítica (${result.avgMs}ms).`,
      technicalDetails: formatTechnical(result),
      recommendation: "Verifique saturação de banda ou problemas no provedor.",
      timestamp,
    };
  }

  if (result.status !== "UP") {
    return {
      serviceId: service.id,
      serviceName: service.name,
      metric: "PING",
      value: result.lossPercent,
      status: "DOWN",
      severity: "WARNING",
      priority: 3,
      description: "Host respondeu de forma inesperada ao PING.",
      technicalDetails: formatTechnical(result),
      recommendation:
        "Verifique configuração IPv4/IPv6 ou regras de firewall.",
      timestamp,
    };
  }

  return null;
}

function formatTechnical(result: PingResult): string {
  return `Status: ${result.status}, perda: ${result.lossPercent}%, min/avg/max/mdev: ${result.minMs}/${result.avgMs}/${result.maxMs}/${result.mdevMs}`;
}
