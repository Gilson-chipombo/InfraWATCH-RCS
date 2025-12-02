import { PrismaClient, NotificationPolicy } from '@prisma/client';
import { Twilio } from 'twilio';
const prisma = new PrismaClient();

const FALLBACK: Pick<
  NotificationPolicy,
  'maxRetries' | 'retryIntervalMinutes' | 'escalateAfterMinutes' | 'cooldownMinutes' | 'recoveryConfirmations' | 'channels' | 'active'
> = {
  maxRetries: 3,
  retryIntervalMinutes: 2,
  escalateAfterMinutes: 10,
  cooldownMinutes: 15,
  recoveryConfirmations: 2,
  channels: ['email', 'slack', 'twilio', 'telegram'],
  active: true,
};

export class NotificationPolicyRepo {
  static async getEffectivePolicy(serviceId: string) {
    const specific = await prisma.notificationPolicy.findFirst({
      where: { serviceId, active: true },
      orderBy: { updatedAt: 'desc' }
    });
    if (specific) return specific;

    const globalDefault = await prisma.notificationPolicy.findFirst({
      where: { isDefault: true, active: true },
      orderBy: { updatedAt: 'desc' }
    });
    if (globalDefault) return globalDefault;

    return {
      id: 'fallback',
      serviceId: null,
      isDefault: false,
      active: true,
      channels: FALLBACK.channels,
      maxRetries: FALLBACK.maxRetries,
      retryIntervalMinutes: FALLBACK.retryIntervalMinutes,
      escalateAfterMinutes: FALLBACK.escalateAfterMinutes,
      cooldownMinutes: FALLBACK.cooldownMinutes,
      recoveryConfirmations: FALLBACK.recoveryConfirmations,
      createdAt: new Date(),
      updatedAt: new Date()
    } as NotificationPolicy;
  }
}
