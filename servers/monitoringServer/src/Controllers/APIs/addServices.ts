import { FastifyRequest, FastifyReply } from 'fastify';
import { ServiceType } from '@prisma/client';

export async function addService(request: any, reply: FastifyReply) {
  const { ownerId } = request.params;

  const { name, type, target, contacts } = request.body as {
    name: string;
    type: ServiceType;
    target: string;
    contacts: { channel: string; to: string; active?: boolean; level?: number }[];
  };

  try {
    const service = await request.server.prisma.service.create({
      data: {
        name,
        type,
        target,
        ownerId,
        AlertContact: {
          create: contacts?.map(c => ({
            channel: c.channel,
            to: c.to,
            active: c.active ?? true,
            level: c.level ?? 1,
          })) || []
        }
      },
      include: { AlertContact: true }
    });

    await createDefaultSLIsForService(service.id, type, request.server.prisma);

    return reply.code(201).send(service);
  } catch (error) {
    request.log.error(error);
    return reply.code(400).send({ message: 'Erro ao criar serviço' });
  }
}

async function createDefaultSLIsForService(serviceId: string, type: ServiceType, prisma: any) {
  const defaultSLIs: any[] = [];

  switch (type) {
    case ServiceType.PING:
      defaultSLIs.push({
        serviceId,
        metric: 'PING',
        threshold: 98,
        comparison: 'gte',
      });
      break;

    case ServiceType.HTTP:
      defaultSLIs.push({
        serviceId,
        metric: 'HTTP',
        threshold: 98,
        comparison: 'gte',
      });
      break;

    case ServiceType.SNMP:
      defaultSLIs.push({
        serviceId,
        metric: 'SNMP',
        threshold: 95,
        comparison: 'gte',
      });
      break;
  }

  for (const sli of defaultSLIs) {
    await prisma.sliTarget.create({ data: sli });
  }
}
