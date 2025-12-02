import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class AlertContactController
{
  async create(req: any, reply: any)
  {
    const { serviceId, channel, to } = req.body;

    if (!serviceId || !channel || !to) {
      return reply.status(400).send({ message: 'Campos obrigatórios ausentes.' });
    }

    try
    {
      const contact = await prisma.alertContact.create({
        data: { serviceId, channel, to },
      });
      return reply.status(201).send(contact);
    }
    catch (err)
    {
      console.error(err);
      return reply.status(500).send({ message: 'Erro ao criar contato.' });
    }
  }

  async list(req: any, reply: any) {
    const { serviceId } = req.params;

    try
    {
      const contacts = await prisma.alertContact.findMany(
      {
        where: { serviceId },
      });
      return reply.send(contacts);
    }
    catch (err)
    {
      console.error(err);
      return reply.status(500).send({ message: 'Erro ao buscar contatos.' });
    }
  }

  // Atualizar um contato
  async update(req: any, reply: any)
  {
    const { id } = req.params;
    const { channel, to, active } = req.body;

    try
    {
      const contact = await prisma.alertContact.update({
        where: { id },
        data: { channel, to, active },
      });
      return reply.send(contact);
    }
    catch (err)
    {
      console.error(err);
      return reply.status(500).send({ message: 'Erro ao atualizar contato.' });
    }
  }

  async delete(req: any, reply: any)
  {
    const { id } = req.params;

    try
    {
      await prisma.alertContact.delete({ where: { id } });
      return reply.send({ message: 'Contato removido com sucesso.' });
    }
    catch (err)
    {
      console.error(err);
      return reply.status(500).send({ message: 'Erro ao remover contato.' });
    }
  }
}
