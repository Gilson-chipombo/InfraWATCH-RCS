"use server"

import { prisma } from "@/src/lib/prisma"

export async function listServices() {
  try {
    const services = await prisma.service.findMany({
      orderBy: { id: "desc" }, // opcional: lista do mais recente pro mais antigo
    })
    return services
  } catch (error) {
    console.error("Erro ao listar serviços:", error)
    throw new Error("Não foi possível carregar os serviços")
  }
}
