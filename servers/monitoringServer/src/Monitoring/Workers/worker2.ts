import { getIO } from "../../socket";
import { Problem } from "../../types/Problem";
import { analyzePingIssue } from "../../Analyzers/PingIssueAnalyzer";
import { analyzeHttpIssue } from "../../Analyzers/HttpIssueAnalyzer";
import { analyzeSnmpIssue } from "../../Analyzers/analyzeSnmpIssue";
import { writeSnmpMetrics } from "../../Influxdb/WriteMetrics/WriteSnmpMetrics";
import { writePingMetrics } from "../../Influxdb/WriteMetrics/WritePingMetrics";
import { writeHttpMetrics } from "../../Influxdb/WriteMetrics/WriteHttpMetrics";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function processProxyData(data: any): Promise<Problem[]> {
  const io = getIO();
  const problems: Problem[] = [];

  // 🔹 Busca no banco para enriquecer dados
  if (data?.serviceId) {
    const service = await prisma.service.findUnique({
      where: { id: data.serviceId },
      select: { name: true, target: true },
    });

    if (service) {
      data.serviceName = service.name;
      data.target = service.target;

      // garante também dentro de `data`
      if (data.data) {
        data.data.serviceName = service.name;
        data.data.target = service.target;
      }
    } else {
      data.serviceName = "unknown";
      data.target = "unknown";

      if (data.data) {
        data.data.serviceName = "unknown";
        data.data.target = "unknown";
      }
    }
  } else {
    data.serviceName = "unknown";
    data.target = "unknown";

    if (data.data) {
      data.data.serviceName = "unknown";
      data.data.target = "unknown";
    }
  }

  // 🔹 Validação básica
  if (!data || !data.type) {
    problems.push({
      serviceId: data?.serviceId || "unknown",
      serviceName: data.serviceName,
      metric: "unknown",
      value: 0,
      status: "UNKNOWN",
      description: "Dados inválidos recebidos do proxy",
      recommendation: "Verifique se o proxy está enviando os dados corretamente",
      priority: 2,
      severity: "WARNING",
      timestamp: new Date().toISOString(),
    });
    return problems;
  }

  console.log(data);

  // 🔹 Processamento por tipo de serviço
  switch (data.type) {
    case "SNMP":
      io.emit("snmpService", data);
      await writeSnmpMetrics(data.serviceId, data);
      const snmpAnalysis = await analyzeSnmpIssue(
        { id: data.serviceId, name: data.serviceName },
        data
      );
      if (snmpAnalysis) problems.push(snmpAnalysis);
      break;

    case "PING":
      io.emit("pingService", data);
      await writePingMetrics(data.serviceId, data);
      const pingAnalysis = analyzePingIssue(
        { id: data.serviceId, name: data.serviceName },
        data
      );
      if (pingAnalysis) problems.push(pingAnalysis);
      break;

    case "HTTP":
      io.emit("httpService", data);
      await writeHttpMetrics(data.serviceId, data);
      const httpAnalysis = analyzeHttpIssue(
        { id: data.serviceId, name: data.serviceName },
        data
      );
      if (httpAnalysis) problems.push(httpAnalysis);
      break;

    default:
      problems.push({
        serviceId: data.serviceId,
        serviceName: data.serviceName,
        metric: "unknown",
        value: 0,
        status: "UNKNOWN",
        description: `Tipo de serviço desconhecido: ${data.type}`,
        recommendation: "Verifique a configuração do proxy",
        priority: 2,
        severity: "WARNING",
        timestamp: new Date().toISOString(),
      });
  }

  return problems;
}
