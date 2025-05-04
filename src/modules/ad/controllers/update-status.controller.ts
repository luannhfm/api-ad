import { FastifyRequest, FastifyReply } from 'fastify';
import { UpdateStatusSchema } from '../dtos/update-status.dto';
import { updateUserStatusService } from '../services/update-status.service';

export async function updateUserStatusController(req: FastifyRequest, reply: FastifyReply) {
  const parsed = UpdateStatusSchema.safeParse(req.body);

  if (!parsed.success) {
    return reply.status(400).send({ error: 'Dados inválidos', details: parsed.error.flatten() });
  }

  try {
    await updateUserStatusService(parsed.data, req.server.ldap);
    return reply.send({ message: `Usuário ${parsed.data.enabled ? 'ativado' : 'desativado'} com sucesso.` });
  } catch (err: any) {
    return reply.status(500).send({ error: 'Erro ao atualizar status do usuário', details: err.message });
  }
}
