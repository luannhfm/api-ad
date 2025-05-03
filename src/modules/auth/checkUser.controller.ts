import { FastifyRequest, FastifyReply } from 'fastify';
import { checkUserStatus } from './checkUser.service';

export async function checkUserController(req: FastifyRequest, reply: FastifyReply) {
  const { username } = req.body as any;

  try {
    const isActive = await checkUserStatus(username, req.server.ldap);
    return reply.send({ username, active: isActive });
  } catch (err: any) {
    return reply.status(500).send({ error: 'Erro ao consultar usuário no AD', details: err.message });
  }
}
