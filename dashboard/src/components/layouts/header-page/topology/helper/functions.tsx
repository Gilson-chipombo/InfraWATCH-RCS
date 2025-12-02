export function uid(prefix = "id") {
    return `${prefix}_${Math.random().toString(36).slice(2, 9)}`;
}

export function isValidIPv4(ip:any) {
    if (!/^\d+\.\d+\.\d+\.\d+$/.test(ip)) return false;
    const parts = ip.split(".").map(Number);
    if (parts.length !== 4) return false;
    return parts.every((n:any) => n >= 0 && n <= 255);
}