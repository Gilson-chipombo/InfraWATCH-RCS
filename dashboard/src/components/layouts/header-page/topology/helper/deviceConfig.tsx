import { Antenna, Cctv, Computer, Laptop, PcCaseIcon, Satellite, Smartphone, Tv } from "lucide-react";
import { CloudIcon, FirewallIcon, RouterIcon, SwitchIcon } from "./icons";

export const SystemO = ['Laptop', 'PC','Server','Smart TV','Switch','Firewall','Smartphone']
export const ServerType = ['Laptop', 'PC','Server']

export const OperatingSystems = [
  "Linux",
  "Windows",
  "macOS",
  "Android",
  "iOS",
  "FreeBSD",
  "Chrome OS",
  "Unix",
  "Solaris",
] as any;

export const ConnectionTypes = [
  "Ethernet",
  "Wi-Fi",
  "Bluetooth",
  "5G",
  "4G LTE",
  "3G",
  "Satellite",
  "Fiber",
  "DSL",
  "VPN",
] as any;


export const DEVICE_KINDS = {
    router:     { label: "Router",     color: "red-500",    icon: RouterIcon },
    switch:     { label: "Switch",     color: "blue-500",   icon: SwitchIcon },
    pc:         { label: "PC",         color: "green-500",  icon: Computer },
    firewall:   { label: "Firewall",   color: "amber-500",  icon: FirewallIcon },
    cloud:      { label: "Cloud",      color: "indigo-500", icon: CloudIcon },
    server:     { label: "Server",     color: "slate-500",  icon: PcCaseIcon },
    laptop:     { label: "Laptop",     color: "emerald-500",icon: Laptop },
    antenna:    { label: "Antenna",    color: "cyan-500",   icon: Antenna },
    smartPhone: { label: "Smartphone", color: "pink-500",   icon: Smartphone },
    SmartTV:    { label: "Smart TV",   color: "violet-500", icon: Tv },
    satellite:  { label: "Satellite",  color: "teal-500",   icon: Satellite },
    cctv:       { label: "CCTV",       color: "rose-500",   icon: Cctv },
} as any;

export const COLOR_CLASSES = {
    "red-500": {
        border: "border-red-500",
        text: "text-red-500",
        bg: "bg-red-500",
        ring: "ring-red-500",
    },
    "blue-500": {
        border: "border-blue-500",
        text: "text-blue-500",
        bg: "bg-blue-500",
        ring: "ring-blue-500",
    },
    "green-500": {
        border: "border-green-500",
        text: "text-green-500",
        bg: "bg-green-500",
        ring: "ring-green-500",
    },
    "amber-500": {
        border: "border-amber-500",
        text: "text-amber-500",
        bg: "bg-amber-500",
        ring: "ring-amber-500",
    },
    "indigo-500": {
        border: "border-indigo-500",
        text: "text-indigo-500",
        bg: "bg-indigo-500",
        ring: "ring-indigo-500",
    },
    "slate-500": {
        border: "border-slate-500",
        text: "text-slate-500",
        bg: "bg-slate-500",
        ring: "ring-slate-500",
    },
    "emerald-500": {
        border: "border-emerald-500",
        text: "text-emerald-500",
        bg: "bg-emerald-500",
        ring: "ring-emerald-500",
    },
    "cyan-500": {
        border: "border-cyan-500",
        text: "text-cyan-500",
        bg: "bg-cyan-500",
        ring: "ring-cyan-500",
    },
    "pink-500": {
        border: "border-pink-500",
        text: "text-pink-500",
        bg: "bg-pink-500",
        ring: "ring-pink-500",
    },
    "violet-500": {
        border: "border-violet-500",
        text: "text-violet-500",
        bg: "bg-violet-500",
        ring: "ring-violet-500",
    },
    "teal-500": {
        border: "border-teal-500",
        text: "text-teal-500",
        bg: "bg-teal-500",
        ring: "ring-teal-500",
    },
    "rose-500": {
        border: "border-rose-500",
        text: "text-rose-500",
        bg: "bg-rose-500",
        ring: "ring-rose-500",
    },
} as any;

export interface ServiceOption {
  readonly value: string;
  readonly label: string;
  readonly isDisabled?: boolean;
}

export const serviceOptions: readonly ServiceOption[] = [
  // 🌍 Web Servers
  { value: "http", label: "HTTP" },
  { value: "https", label: "HTTPS" },
  { value: "ftp", label: "FTP" },
  { value: "sftp", label: "SFTP" },
  { value: "ssh", label: "SSH" },
  { value: "telnet", label: "Telnet" },

  // 📧 Email
  { value: "smtp", label: "SMTP" },
  { value: "imap", label: "IMAP" },
  { value: "pop3", label: "POP3" },

  // 💾 Databases
  { value: "mysql", label: "MySQL" },
  { value: "postgresql", label: "PostgreSQL" },
  { value: "mongodb", label: "MongoDB" },
  { value: "redis", label: "Redis" },
  { value: "mssql", label: "Microsoft SQL Server" },
  { value: "oracle", label: "Oracle DB" },
  { value: "sqlite", label: "SQLite" },

  // 💬 Mensageria
  { value: "mqtt", label: "MQTT" },
  { value: "amqp", label: "AMQP (RabbitMQ)" },
  { value: "kafka", label: "Apache Kafka" },
  { value: "nats", label: "NATS" },

  // 📡 APIs & Cloud
  { value: "graphql", label: "GraphQL" },
  { value: "rest", label: "REST API" },
  { value: "grpc", label: "gRPC" },

  // ⚙️ Outros Serviços
  { value: "dns", label: "DNS" },
  { value: "dhcp", label: "DHCP" },
  { value: "ldap", label: "LDAP" },
  { value: "ntp", label: "NTP" },
  { value: "snmp", label: "SNMP" },
  { value: "smb", label: "SMB" },
  { value: "nfs", label: "NFS" },

  // 🔒 Segurança
  { value: "vpn", label: "VPN" },
  { value: "ipsec", label: "IPSec" },
  { value: "openvpn", label: "OpenVPN" },
  { value: "wireguard", label: "WireGuard" },

  // 📊 Monitoramento & Logs
  { value: "prometheus", label: "Prometheus" },
  { value: "grafana", label: "Grafana" },
  { value: "elasticsearch", label: "Elasticsearch" },
  { value: "logstash", label: "Logstash" },
  { value: "kibana", label: "Kibana" },
];
