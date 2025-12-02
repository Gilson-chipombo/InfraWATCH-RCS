import { PrismaClient } from "@prisma/client";
import { sendAlert } from "../../Notifications/Notification";

const prisma = new PrismaClient();

/**
 * Abre incidente se não houver um já aberto
 */
export async function findOrOpenIncident(serviceId: string, reason?: string) {
  let incident = await prisma.incident.findFirst({
    where: { serviceId, closedAt: null },
  });

  if (!incident) {
    incident = await prisma.incident.create({
      data: { serviceId, reason: reason ?? "auto-open" },
    });
  }

  return incident;
}

/**
 * Fecha incidentes abertos se o serviço recuperou
 */
export async function closeIncidentIfRecovered(
  serviceId: string,
  recoveryConfirmations: number
) {
  try {
    const openIncidents = await prisma.incident.findMany({
      where: { serviceId, closedAt: null },
    });

    if (openIncidents.length > 0) {
      await prisma.incident.updateMany({
        where: { serviceId, closedAt: null },
        data: { closedAt: new Date(), reason: "auto-recovery" },
      });
    }
  } catch (err) {
    console.error(
      `Erro ao verificar recuperação do serviço ${serviceId}:`,
      err
    );
  }
}

/**
 * Atualiza info de notificação no incidente
 */
export async function updateIncidentNotification(
  incidentId: string,
  retryCount: number
) {
  await prisma.incident.update({
    where: { id: incidentId },
    data: { lastNotificationAt: new Date(), retryCount },
  });
}

/**
 * Escalonamento de notificações baseado no tempo aberto
 */
export async function notifyContacts(
  incident: { id: string; serviceId: string; openedAt: Date; retryCount: number },
  message: string,
  channels: string[],
  policy: {
    escalateAfterMinutes: number;
    channels: string[];
  }
) {
  const contacts = await prisma.alertContact.findMany({
    where: { serviceId: incident.serviceId, active: true },
    orderBy: { level: "asc" },
  });

  const elapsedMinutes =
    (Date.now() - incident.openedAt.getTime()) / (60 * 1000);

  // Até qual nível já podemos escalar
  const allowedLevel =
    Math.floor(elapsedMinutes / policy.escalateAfterMinutes) + 1;

  const notified: { channel: string; to: string; level: number }[] = [];

  for (const c of contacts) {
    if (c.level <= allowedLevel) {
      if (channels.length === 0 || channels.includes(c.channel)) {
        await sendAlert(c.channel as any, c.to, message);
        notified.push({ channel: c.channel, to: c.to, level: c.level });
      }
    }
  }

  return notified;
}
