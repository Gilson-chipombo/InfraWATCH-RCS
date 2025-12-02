export interface ProxyServiceData {
    id: string;
    type: "SNMP" | "HTTP" | "PING" | "WEBHOOK";
    target: string;
    timestamp: string;
    metrics?: any; // Pode ser SNMP metrics, HTTP status, PING RTT etc
    interfaces?: any[]; // Caso SNMP tenha interfaces
  }
  