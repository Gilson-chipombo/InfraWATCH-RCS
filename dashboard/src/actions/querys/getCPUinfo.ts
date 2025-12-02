import os from "os";
import { any } from "zod";

// Função para converter máscara para prefixo CIDR
function netmaskToCIDR(netmask:any) {
  return netmask
    .split(".")
    .map(Number)
    .map((n: any) => n.toString(2).padStart(8, "0"))
    .join("")
    .split("1").length - 1;
}

export function getCIDRs() {
  const interfaces = os.networkInterfaces() as any;
  const results = [];

  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      if (iface.family === "IPv4" && !iface.internal) {
        const cidr = `${iface.address}/${netmaskToCIDR(iface.netmask)}`;
        results.push({
          interface: name,
          address: iface.address,
          netmask: iface.netmask,
          cidr
        });
      }
    }
  }
  return results;
}
