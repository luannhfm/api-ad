// src/modules/ad/controllers/get-user.controller.ts
import { FastifyRequest, FastifyReply } from 'fastify';
import { GetUserSchema } from '../dtos/get-user.dto';
import { getUserDetailsService } from '../services/get-user.service';

export async function getUserDetailsController(req: FastifyRequest, reply: FastifyReply) {
  const parsed = GetUserSchema.safeParse(req.body);

  if (!parsed.success) {
    return reply.status(400).send({ error: 'Dados inválidos', details: parsed.error.flatten() });
  }

  const { username } = parsed.data;

  try {
    const userDetails = await getUserDetailsService(username, req.server.ldap);
    return reply.send(userDetails);
  } catch (err: any) {
    return reply.status(404).send({ error: 'Usuário não encontrado', details: err.message });
  }
}
