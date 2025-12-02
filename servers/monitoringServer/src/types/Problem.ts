export type ProblemSeverity = "INFO" | "WARNING" | "HIGH" | "CRITICAL";
export type ProblemStatus = "UP" | "DOWN" | "UNKNOWN";

export interface Problem {
  serviceId: string;
  serviceName: string;
  metric: string;             // Ex: PING, HTTP, SNMP
  value: number;              // Ex: tempo ms, perda %, etc
  status: ProblemStatus;      // UP, DOWN ou UNKNOWN
  severity: ProblemSeverity;  // nível de impacto
  priority: number;           // prioridade numérica (1 = mais crítico)
  description: string;        // descrição curta
  recommendation?: string;    // sugestão de ação
  technicalDetails?: string;  // detalhes técnicos adicionais
  timestamp: string;          // ISO string
}
