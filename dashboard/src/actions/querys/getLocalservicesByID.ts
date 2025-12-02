"use server"

import { prisma } from "@/src/lib/prisma"

export async function getServiceById(id: string) {
  if (!id) throw new Error("ID do serviço não informado")

  const service = await prisma.service.findUnique({
    where: { id },
    include: {
      Key_ssh: true, // <- nome da relação definido no schema
      GithubWebhook: true // (se também quiser trazer os webhooks relacionados)
    }
  })

  if (!service) throw new Error(`Serviço com id ${id} não encontrado`)

  return service
}
