'use server'

import { prisma } from "@/src/lib/prisma";

export async function createCluster(name: string) {
  try {
    const server = await prisma.cluster.create({
      data: { name },
    });

    if (!server) {
      throw new Error("Erro ao criar cluster");
    }

    return {
      id: server.id,
      name: server.name,
      type: "cluster", 
    };
  } catch (error) {
    console.error("Erro no createCluster:", error);
    return { error: "Falha ao criar cluster" };
  }
}
