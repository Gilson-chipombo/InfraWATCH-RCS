import { PrismaClient } from "@prisma/client";
import { getIO } from "../../socket";
import { writeSlaRecordToInflux } from "../../Influxdb/WriteMetrics/WriteSlaRecord";
import { writeServiceStatus } from "../../Influxdb/WriteMetrics/WriteServiceStatus";
import { NotificationPolicyRepo } from "../../Repositories/notificationPolicyRepo";
import {
  findOrOpenIncident,
  closeIncidentIfRecovered,
  updateIncidentNotification,
  notifyContacts,
} from "../Incidents/incidentManager";

export const prisma = new PrismaClient();

const lastStatusCache: Record<string, ServiceStatus> = {};

export function hasStatusChanged(serviceId: string, newStatus: ServiceStatus): boolean {
  const lastStatus = lastStatusCache[serviceId];

  if (lastStatus !== newStatus) {
    // Atualiza cache
    lastStatusCache[serviceId] = newStatus;
    return true;
  }

  return false; // não mudou
}

function minutesAgo(date: Date, minutes: number): boolean {
  return new Date(Date.now() - minutes * 60 * 1000) > date;
}

export async function processSlaAndAlerts(
  serviceId: string,
  issues: {
    serviceId: string;
    serviceName: string;
    description: string;
    severity: string;
  }[] = []
) {
  const io = getIO();
  const downNow = issues.length > 0;

  if (downNow) {
    for (const issue of issues) {
      await writeServiceStatus({
        serviceId: issue.serviceId,
        status: "DOWN",
      });

      const policy = await NotificationPolicyRepo.getEffectivePolicy(
        issue.serviceId
      );

      const incident = await findOrOpenIncident(issue.serviceId);
      if (!incident) {
        console.error(
          `Falha ao criar ou obter incidente para serviço ${issue.serviceId}`
        );
        continue;
      }

      await writeSlaRecordToInflux({
        serviceId: issue.serviceId,
        serviceName: issue.serviceName,
        metric: "availability",
        value: 0,
        status: false,
        criticality: issue.severity,
      });

      const canNotify =
        !incident.lastNotificationAt ||
        minutesAgo(incident.lastNotificationAt, policy.cooldownMinutes);

      if (canNotify) {
        const nextRetry = (incident.retryCount ?? 0) + 1;

        const notified = await notifyContacts(
          {
            id: incident.id,
            serviceId: issue.serviceId,
            openedAt: incident.openedAt,
            retryCount: incident.retryCount ?? 0,
          },
          `🚨 ALERTA ${issue.severity.toUpperCase()} 🚨\n` +
            `${issue.serviceName} - ${issue.description}\n` +
            `(retry ${nextRetry}/${policy.maxRetries})`,
          policy.channels,
          policy
        );

        await updateIncidentNotification(incident.id, nextRetry);

           io.emit("slaViolation", {
             serviceId: issue.serviceId,
             serviceName: issue.serviceName,
             description: issue.description,
             severity: issue.severity,
             retry: nextRetry,
             notified,
           });
      }
    }
  } else {
    await writeServiceStatus({ serviceId, status: "UP" });

    const policy = await NotificationPolicyRepo.getEffectivePolicy(serviceId);
    await closeIncidentIfRecovered(serviceId, policy.recoveryConfirmations);
  }
}
