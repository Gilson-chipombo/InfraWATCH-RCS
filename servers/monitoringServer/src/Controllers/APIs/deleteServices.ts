import { FastifyRequest, FastifyReply } from 'fastify';

interface DeleteServiceParams {
  ownerId: string;
  serviceId: string;
}

export async function deleteService(
  request: FastifyRequest<{ Params: DeleteServiceParams }>,
  reply: FastifyReply
) {
  const { ownerId, serviceId } = request.params;

  try {
    const existingService = await request.server.prisma.service.findUnique({
      where: { id: serviceId },
    });

    if (!existingService || existingService.ownerId !== ownerId) {
      return reply
        .code(404)
        .send({ message: 'Serviço não encontrado ou não pertence a este usuário.' });
    }

    const deletedService = await request.server.prisma.service.delete({
      where: { id: serviceId },
    });

    return reply.code(200).send(deletedService);
  } catch (error) {
    console.error('Erro ao deletar serviço:', error);

    return reply.code(500).send({
      message: 'Erro interno ao tentar deletar o serviço.',
    });
  }
}
