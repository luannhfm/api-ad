import { FastifyRequest, FastifyReply } from 'fastify';
import { listUsersService } from '../services/list-users.service';

export async function listUsersController(req: FastifyRequest, reply: FastifyReply) {
  try {
    const users = await listUsersService(req.server.ldap);
    return reply.send(users);
  } catch (err: any) {
    return reply.status(500).send({ error: 'Erro ao listar usuários', details: err.message });
  }
}
