import { FastifyRequest, FastifyReply } from 'fastify';
import { CheckStatusSchema } from '../dtos/check-status.dto';
import { checkUserStatusService } from '../services/check-status.service';

export async function checkUserStatusController(req: FastifyRequest, reply: FastifyReply) {
  const parsed = CheckStatusSchema.safeParse(req.body);

  if (!parsed.success) {
    return reply.status(400).send({ error: 'Dados inválidos', details: parsed.error.flatten() });
  }

  const { username } = parsed.data;

  try {
    const isActive = await checkUserStatusService(username, req.server.ldap);
    return reply.send({ username, active: isActive });
  } catch (err: any) {
    return reply.status(500).send({ error: 'Erro ao consultar usuário no AD', details: err.message });
  }
}
