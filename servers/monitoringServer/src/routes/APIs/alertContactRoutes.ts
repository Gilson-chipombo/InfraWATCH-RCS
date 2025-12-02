import { FastifyInstance } from 'fastify';
import { AlertContactController } from '../../Controllers/APIs/alertContact';

export async function alertContactRoutes(fastify: FastifyInstance)
{
  const controller = new AlertContactController();

  fastify.post('/api/alert-contact', {
    schema: {
      description: 'Criar um novo contato de alerta para um serviço',
      tags: ['AlertContact'],
      body: {
        type: 'object',
        required: ['serviceId', 'channel', 'to'],
        properties: {
          serviceId: { type: 'string' },
          channel: { type: 'string', enum: ['email', 'slack', 'telegram', 'twilio'] },
          to: { type: 'string' },
        },
      },
    },
  }, async (request, reply) => {
    try {
      return await controller.create(request, reply);
    } catch (error) {
      request.log.error(error);
      reply.status(500).send({ error: 'Erro ao criar contato' });
    }
  });

  fastify.get('/api/alert-contact/:serviceId', {
    schema: {
      description: 'Listar todos os contatos de alerta de um serviço',
      tags: ['AlertContact'],
      params: {
        type: 'object',
        properties: { serviceId: { type: 'string' } },
        required: ['serviceId'],
      },
    },
  }, async (request, reply) => {
    try {
      return await controller.list(request, reply);
    } catch (error) {
      request.log.error(error);
      reply.status(500).send({ error: 'Erro ao buscar contatos' });
    }
  });

  fastify.put('/api/alert-contact/:id', {
    schema: {
      description: 'Atualizar um contato de alerta',
      tags: ['AlertContact'],
      params: {
        type: 'object',
        properties: { id: { type: 'string' } },
        required: ['id'],
      },
      body: {
        type: 'object',
        properties: {
          channel: { type: 'string', enum: ['email', 'slack', 'telegram', 'twilio'] },
          to: { type: 'string' },
          active: { type: 'boolean' },
        },
      },
    },
  }, async (request, reply) => {
    try {
      return await controller.update(request, reply);
    } catch (error) {
      request.log.error(error);
      reply.status(500).send({ error: 'Erro ao atualizar contato' });
    }
  });

  fastify.delete('/api/alert-contact/:id', {
    schema: {
      description: 'Deletar um contato de alerta',
      tags: ['AlertContact'],
      params: {
        type: 'object',
        properties: { id: { type: 'string' } },
        required: ['id'],
      },
    },
  }, async (request, reply) => {
    try {
      return await controller.delete(request, reply);
    } catch (error) {
      request.log.error(error);
      reply.status(500).send({ error: 'Erro ao remover contato' });
    }
  });
}