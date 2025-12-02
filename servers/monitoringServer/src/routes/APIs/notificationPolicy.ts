import { FastifyInstance } from 'fastify';
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export async function notificationPolicyRoutes(app: FastifyInstance)
{
  // 🔹 Prefixo fixo em todas as rotas
  const routePrefix = '/api/policies';

  app.get(`${routePrefix}/:serviceId/effective`, {
    schema: {
      tags: ['NotificationPolicy'],
      summary: 'Buscar política efetiva para um serviço',
      params: {
        type: 'object',
        properties: {
          serviceId: { type: 'string' },
        },
        required: ['serviceId'],
      },
      response: {
        200: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            serviceId: { type: 'string', nullable: true },
            isDefault: { type: 'boolean' },
            active: { type: 'boolean' },
            channels: { type: 'array', items: { type: 'string' } },
            maxRetries: { type: 'integer' },
            retryIntervalMinutes: { type: 'integer' },
            escalateAfterMinutes: { type: 'integer' },
            cooldownMinutes: { type: 'integer' },
            recoveryConfirmations: { type: 'integer' },
          },
        },
      },
    },
    handler: async (req) => {
      const { serviceId } = req.params as { serviceId: string };
      const specific = await prisma.notificationPolicy.findFirst({
        where: { serviceId, active: true },
      });
      if (specific) return specific;

      const def = await prisma.notificationPolicy.findFirst({
        where: { isDefault: true, active: true },
      });

      return (
        def ?? {
          channels: ['email'],
          maxRetries: 3,
          retryIntervalMinutes: 2,
          escalateAfterMinutes: 10,
          cooldownMinutes: 15,
          recoveryConfirmations: 2,
        }
      );
    },
  });

  app.get(`${routePrefix}/default`, {
    schema: {
      tags: ['NotificationPolicy'],
      summary: 'Buscar política padrão',
      response: {
        200: {
          type: 'object',
          nullable: true,
        },
      },
    },
    handler: async () => {
      return prisma.notificationPolicy.findFirst({
        where: { isDefault: true, active: true },
      });
    },
  });

  app.post(`${routePrefix}`, {
    schema: {
      tags: ['NotificationPolicy'],
      summary: 'Criar nova política de notificação',
      body: {
        type: 'object',
        properties: {
          serviceId: { type: 'string', nullable: true },
          isDefault: { type: 'boolean' },
          active: { type: 'boolean' },
          channels: { type: 'array', items: { type: 'string' } },
          maxRetries: { type: 'integer' },
          retryIntervalMinutes: { type: 'integer' },
          escalateAfterMinutes: { type: 'integer' },
          cooldownMinutes: { type: 'integer' },
          recoveryConfirmations: { type: 'integer' },
        },
        required: ['channels', 'maxRetries', 'retryIntervalMinutes'],
      },
      response: {
        200: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            serviceId: { type: 'string', nullable: true },
            isDefault: { type: 'boolean' },
            active: { type: 'boolean' },
            channels: { type: 'array', items: { type: 'string' } },
            maxRetries: { type: 'integer' },
            retryIntervalMinutes: { type: 'integer' },
            escalateAfterMinutes: { type: 'integer' },
            cooldownMinutes: { type: 'integer' },
            recoveryConfirmations: { type: 'integer' },
          },
        },
      },
    },
    handler: async (req) => {
      const body = req.body as any;
      return prisma.notificationPolicy.create({ data: body });
    },
  });

  app.put(`${routePrefix}/:id`, {
    schema: {
      tags: ['NotificationPolicy'],
      summary: 'Atualizar uma política existente',
      params: {
        type: 'object',
        properties: {
          id: { type: 'string' },
        },
        required: ['id'],
      },
      body: {
        type: 'object',
        properties: {
          serviceId: { type: 'string', nullable: true },
          isDefault: { type: 'boolean' },
          active: { type: 'boolean' },
          channels: { type: 'array', items: { type: 'string' } },
          maxRetries: { type: 'integer' },
          retryIntervalMinutes: { type: 'integer' },
          escalateAfterMinutes: { type: 'integer' },
          cooldownMinutes: { type: 'integer' },
          recoveryConfirmations: { type: 'integer' },
        },
      },
      response: {
        200: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            serviceId: { type: 'string', nullable: true },
            isDefault: { type: 'boolean' },
            active: { type: 'boolean' },
            channels: { type: 'array', items: { type: 'string' } },
            maxRetries: { type: 'integer' },
            retryIntervalMinutes: { type: 'integer' },
            escalateAfterMinutes: { type: 'integer' },
            cooldownMinutes: { type: 'integer' },
            recoveryConfirmations: { type: 'integer' },
          },
        },
      },
    },
    handler: async (req) => {
      const { id } = req.params as { id: string };
      const body = req.body as any;
      return prisma.notificationPolicy.update({ where: { id }, data: body });
    },
  });

  app.delete(`${routePrefix}/:id`, {
    schema: {
      tags: ['NotificationPolicy'],
      summary: 'Excluir uma política de notificação',
      params: {
        type: 'object',
        properties: {
          id: { type: 'string' },
        },
        required: ['id'],
      },
      response: {
        200: {
          type: 'object',
          properties: { ok: { type: 'boolean' } },
        },
      },
    },
    handler: async (req) => {
      const { id } = req.params as { id: string };
      await prisma.notificationPolicy.delete({ where: { id } });
      return { ok: true };
    },
  });
}
