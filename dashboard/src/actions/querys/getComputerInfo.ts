'use server'

import { sendGrpcCommand } from "../grpc/client";

export const getComputerInfo = async (service: any): Promise<any> => {
    const commands = ["system", "cpu", "process", "memory", "network", "images"];

    const results = await Promise.all(commands.map(async (cmd) => {
        try {
            const res = await sendGrpcCommand(service.host, service.port, service.password, cmd);
            console.log(`Response for ${cmd}:`, res);
            return { cmd, res };
        } catch (err: any) {
            return { cmd, res: { error: err.message || "Erro desconhecido", details: err } };
        }
    }));

    const result: any = {};
    results.forEach(r => result[r.cmd] = r.res);

    return result;
};