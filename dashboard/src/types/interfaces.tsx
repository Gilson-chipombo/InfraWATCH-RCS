import { SSHKey } from "../app/(front-end)/(private)/ssh/ssh_gen"

export interface Post {
  id: String
  userId: String
  title: String
  capa?: String,
  description: String
  content: String
  createdAt: string
  updatedAt: string
}

export interface PingWacth {
  average_response_ms: Number
  maximum_response_ms: Number
  minimum_response_ms: Number
  packets_received: Number
  packets_transmitted: Number
  percent_packet_loss: Number
  status: string
  standard_deviation_ms: number
  ttl: number
}

export interface HttpWatch {
  status: string;
  httpStatus: number;
  ip: string;
  sizeBytes: number;
  dnsMs: number;
  connectAndDownloadMs: number;
  totalMs: number;
  service: {
    id: string;
    name: string;
    type: string;
    target: string;
    ownerId: string;
    criticality: "low" | "medium" | "high"; // aqui já deixei tipado
    createdAt: string; // ISO date
    updatedAt: string; // ISO date
  };
  headers: {
    date: string;
    "content-type": string;
    "transfer-encoding"?: string;
    connection?: string;
    "cache-control"?: string;
    "content-language"?: string;
    "content-security-policy"?: string;
    "referrer-policy"?: string;
    "set-cookie"?: string;
    "strict-transport-security"?: string;
    "x-content-type-options"?: string;
    "x-frame-options"?: string;
    "x-robots-tag"?: string;
    "x-xss-protection"?: string;
    "cf-cache-status"?: string;
    server?: string;
    "cf-ray"?: string;
    [key: string]: string | undefined;
  };
  target: string;
}


export interface ServicesProps {
  id: string;
  name: string;
  type: string;
  target: string;
  status: "UP" | "DOWN";
  checkEveryS: number;
}


export interface Ping {
  host: String,
  alive: Boolean,
  time: Number,
  min: String,
  max: String,
  avg: String,
  stddev: String,
  message?: string
}

export interface SnmpWatch {
  type: "snmp";
  ip: string;
  data: {
    serviceId: string;
    timestamp: string; // ISO Date string
    type: "SNMP";
    ip: string;
    sysName: string;
    vendor: string;
    metrics: {
      sysDescr: string;
      sysUpTime: string;
      cpuLoad5min: string;
      memFree: string;
      memTotal: string;
    };
    interfaces: NetworkInterface[];
  };
}

export interface NetworkInterface {
  index: string;
  name: string;
  type: string; // "ethernet" | "l2vlan" | "other"
  adminStatus: "up" | "down";
  operStatus: "up" | "down";
  mac: string;
  speed: string;
  inOctets: string;
  outOctets: string;
  ip?: string; // opcional, já que nem todas têm
}


export interface Service {
  id: string;
  type: string;
  name: string;
  dbType?: null;
  dbUrl?: null;
  wsType?: null;
  wsUrl?: null;
  host?: string;
  user?: string;
  port?: number;
  password?: string;
  containerName?: null;
  image?: null;
  Key_ssh?: SSHKey;
  createdAt: Date;
  updatedAt: Date;
}


// Interface para cada interface de rede
export interface NetworkInterface {
  index: string;
  name: string;
  type: string;
  adminStatus: "up" | "down";
  operStatus: "up" | "down";
  mac: string;
  speed: string;
  inOctets: string;
  outOctets: string;
  ip?: string; // nem todas possuem IP
}

// Interface para métricas do dispositivo
export interface Metrics {
  sysDescr: string;
  sysUpTime: string;
  cpuLoad5sec: string;
  cpuLoad1min: string;
  cpuLoad5min: string;
  memFree: string;
  memTotal: string;
  temperature: string[];
  fanStatus: string[];
  psuStatus: string[];
  powerDraw: string[];
}

// Interface para o bloco "data"
export interface SnmpData {
  serviceId: string;
  timestamp: string; // ou Date, se for convertido
  type: string;
  ip: string;
  sysName: string;
  vendor: string;
  metrics: Metrics;
  interfaces: NetworkInterface[];
}

// Interface raiz
export interface SnmpMessage {
  type: string;
  ip: string;
  data: SnmpData;
}


// types.ts

export interface RootResponse {
  success: boolean
  httpData: HttpData
}

export interface HttpData {
  status: number
  statusText: string
  headers: HeadersMap
  url: string
  method: string
}

export type HeaderValue = string | string[] | undefined

export interface HeadersMap {
  date?: string
  expires?: string
  "cache-control"?: string
  "content-type"?: string
  "content-security-policy-report-only"?: string
  "accept-ch"?: string
  p3p?: string
  server?: string
  "x-xss-protection"?: string
  "x-frame-options"?: string
  "set-cookie"?: string[]
  "alt-svc"?: string
  "transfer-encoding"?: string
  [key: string]: HeaderValue
}

export interface ParsedCookie {
  name: string
  value: string
  expires?: string
  path?: string
  domain?: string
  secure?: boolean
  httpOnly?: boolean
  sameSite?: string
  raw?: string
}

export interface SiteProfile {
  screenshot?: string
  title?: string
  description?: string
}
