"use server";

import { prisma } from "@/src/lib/prisma";

export const getGithubEvents = async ({ id, service }: { id: string; service: string }) => {
  try {
    const events = await prisma.githubWebhook.findMany({
      where: {
        service,
        serviceId: id,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return events;
  } catch (error) {
    console.error("Erro ao buscar eventos do GitHub:", error);
    return [];
  }
};
