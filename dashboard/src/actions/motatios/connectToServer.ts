'use server'

import { prisma } from "@/src/lib/prisma";

export async function connectToServer(data:any) {
  try {
    const { keyId, name, host, port, username, password } = data;

    const server = await prisma.server.create({
      data: {
        keyId,
        name,
        host,
        port: Number(port),
        username,
        password: password ?? null,
      },
    });

    if (!server) {
      throw new Error("Server not found");
    }

    // Aqui você pode adicionar a lógica para se conectar ao servidor
    return { success: true };
  } catch (error) {
    throw new Error("Failed to connect to server");
  }
}
