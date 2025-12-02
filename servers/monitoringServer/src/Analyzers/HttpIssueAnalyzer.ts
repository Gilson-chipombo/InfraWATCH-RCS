import { Problem } from "../types/Problem";

export interface HttpResult {
  status: string;
  httpStatus?: number;
  totalMs?: number;
}

export function analyzeHttpIssue(service: { id: string; name: string }, result: HttpResult | null): Problem | null
{
  const timestamp = new Date().toISOString();

  if (!result)
  {
    return {
      serviceId: service.id,
      serviceName: service.name,
      metric: "HTTP",
      value: 0,
      status: "DOWN",
      severity: "CRITICAL",
      priority: 1,
      description: "Sem resposta HTTP — destino inacessível.",
      recommendation: "Verifique se o servidor web está ativo e acessível.",
      timestamp,
    };
  }

  if (result.status !== "UP")
  {
    if (result.httpStatus && result.httpStatus >= 500)
    {
      return {
        serviceId: service.id,
        serviceName: service.name,
        metric: "HTTP",
        value: result.httpStatus,
        status: "DOWN",
        severity: "CRITICAL",
        priority: 1,
        description: `Erro de servidor HTTP ${result.httpStatus}.`,
        recommendation:
          "Verifique logs do servidor e dependências da aplicação.",
        timestamp,
      };
    }

    if (result.httpStatus && result.httpStatus >= 400)
    {
      return {
        serviceId: service.id,
        serviceName: service.name,
        metric: "HTTP",
        value: result.httpStatus,
        status: "DOWN",
        severity: "HIGH",
        priority: 2,
        description: `Erro de cliente HTTP ${result.httpStatus}.`,
        recommendation:
          "Verifique configuração de autenticação ou endpoint.",
        timestamp,
      };
    }

    return {
      serviceId: service.id,
      serviceName: service.name,
      metric: "HTTP",
      value: result.httpStatus ?? 0,
      status: "DOWN",
      severity: "WARNING",
      priority: 3,
      description: "Resposta HTTP inesperada ou inválida.",
      recommendation:
        "Verifique compatibilidade do protocolo ou restrições de acesso.",
      timestamp,
    };
  }

  if (result.totalMs && result.totalMs > 8000)
  {
    return {
      serviceId: service.id,
      serviceName: service.name,
      metric: "HTTP",
      value: result.totalMs,
      status: "UP",
      severity: "WARNING",
      priority: 3,
      description: `Tempo de resposta alto (${result.totalMs}ms).`,
      recommendation:
        "Monitorar performance do servidor e verificar gargalos de rede.",
      timestamp,
    };
  }
  return null;
}
