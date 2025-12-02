import { FastifyInstance } from 'fastify';
import { NotificationController } from '../../Notifications/Notification';

const controller = new NotificationController();

export async function notificationRoutes(fastify: FastifyInstance)
{
  fastify.post('/api/notifications/send', {
    schema: {
      description: 'Enviar notificação por canal',
      tags: ['Notifications'],
      body: {
        type: 'object',
        required: ['channel', 'to', 'message'],
        properties: {
          channel: { type: 'string', enum: ['email', 'slack', 'telegram', 'twilio'] },
          to: { type: 'string' },
          message: { type: 'string' }
        }
      },
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' }
          }
        }
      }
    }
  }, async (request, reply) => {
    try {
      const { channel, to, message } = request.body as { channel: string; to: string; message: string };
      await controller.send(channel as any, to, message);
      return { success: true };
    } catch (error) {
      request.log.error(error);
      reply.status(500).send({ error: 'Erro ao enviar notificação' });
    }
  });
}
