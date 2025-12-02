import { FastifyInstance } from 'fastify';
import { getSnmpMetrics, getHttpMetrics, getWebhookMetrics, getPingMetrics } from '../../Controllers/APIs/serviceMetrics';

export async function serviceMetricsRoutes(fastify: FastifyInstance)
{
 fastify.get('/api/services/:id/metrics/snmp', {
  schema: {
    description: 'Obter métricas SNMP do serviço (último ponto por categoria)',
    tags: ['Services'],
    params: {
      type: 'object',
      properties: { id: { type: 'string' } },
      required: ['id']
    },
    response: {
      200: {
        type: 'object',
        properties: {
          system: {
            type: ['object', 'null'],
            properties: {
              time: { type: 'string' },
              sysName: { type: 'string' },
              sysDescr: { type: 'string' },
              sysUpTime: { type: 'string' },
              cpuLoad5sec: { type: 'number' },
              cpuLoad5min: { type: 'number' },
              memFreeBytes: { type: 'number' },
              memTotalBytes: { type: 'number' },
              memUsedPercent: { type: 'number' }
            }
          },
          interfaces: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                time: { type: 'string' },
                ifIndex: { type: 'string' },
                ifName: { type: 'string' },
                ifType: { type: 'string' },
                adminStatus: { type: 'string' },
                operStatus: { type: 'string' },
                mac: { type: 'string' },
                speedBps: { type: 'number' },
                inBytes: { type: 'number' },
                outBytes: { type: 'number' },
                inErrors: { type: 'number' },
                outErrors: { type: 'number' },
                ip: { type: ['string', 'null'] }
              }
            }
          },
          summary: {
            type: ['object', 'null'],
            properties: {
              time: { type: 'string' },
              totalInterfaces: { type: 'number' },
              interfacesUp: { type: 'number' },
              interfacesDown: { type: 'number' },
              totalInBytes: { type: 'number' },
              totalOutBytes: { type: 'number' },
              totalErrors: { type: 'number' }
            }
          },
          sensors: {
            type: 'object',
            properties: {
              temperature: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    time: { type: 'string' },
                    index: { type: 'string' },
                    value: { type: 'number' }
                  }
                }
              },
              fanStatus: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    time: { type: 'string' },
                    index: { type: 'string' },
                    status: { type: 'string' }
                  }
                }
              },
              psuStatus: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    time: { type: 'string' },
                    index: { type: 'string' },
                    status: { type: 'string' }
                  }
                }
              },
              powerDraw: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    time: { type: 'string' },
                    index: { type: 'string' },
                    watts: { type: 'number' }
                  }
                }
              }
            }
          }
        }
      }
    }
  }
}, async (request, reply) => {
  try {
    const { id } = request.params as { id: string };
    const metrics = await getSnmpMetrics(id);
    return reply.send(metrics);
  } catch (error) {
    request.log.error(error);
    return reply.status(500).send({ error: 'Erro ao buscar métricas SNMP' });
  }
});


  fastify.get('/api/services/:id/metrics/http', {
    schema: {
      description: 'Obter métricas HTTP do serviço pela última hora',
      tags: ['Services'],
      params: {
        type: 'object',
        properties: { id: { type: 'string' } },
        required: ['id']
      }
    }
  }, async (request, reply) => {
    try {
      const { id } = request.params as { id: string };
      return await getHttpMetrics(id);
    } catch (error) {
      request.log.error(error);
      reply.status(500).send({ error: 'Erro ao buscar métricas HTTP' });
    }
  });

  fastify.get('/api/services/:id/metrics/webhook', {
    schema: {
      description: 'Obter métricas Webhook do serviço pela última hora',
      tags: ['Services'],
      params: {
        type: 'object',
        properties: { id: { type: 'string' } },
        required: ['id']
      }
    }
  }, async (request, reply) => {
    try {
      const { id } = request.params as { id: string };
      return await getWebhookMetrics(id);
    } catch (error) {
      request.log.error(error);
      reply.status(500).send({ error: 'Erro ao buscar métricas Webhook' });
    }
  });

  fastify.get('/api/services/:id/metrics/ping', {
    schema: {
      description: 'Obter métricas de PING do serviço pela última hora',
      tags: ['Services'],
      params: {
        type: 'object',
        properties: { id: { type: 'string' } },
        required: ['id']
      }
    }
  }, async (request, reply) => {
    try {
      const { id } = request.params as { id: string };
      const metrics = await getPingMetrics(id);
      return metrics;
    } catch (error) {
      request.log.error(error);
      reply.status(500).send({ error: 'Erro ao buscar métricas PING' });
    }
  });
}
