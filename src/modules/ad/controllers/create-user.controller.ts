import { FastifyRequest, FastifyReply } from 'fastify';
import { CreateUserSchema } from '../dtos/create-user.dto';
import { createUserService } from '../services/create-user.service';

export async function createUserController(req: FastifyRequest, reply: FastifyReply) {
  const parsed = CreateUserSchema.safeParse(req.body);

  if (!parsed.success) {
    return reply.status(400).send({ error: 'Dados inválidos', details: parsed.error.flatten() });
  }

  try {
    await createUserService(parsed.data, req.server.ldap);
    return reply.status(201).send({ message: 'Usuário criado com sucesso' });
  } catch (err: any) {
    return reply.status(500).send({ error: 'Erro ao criar usuário', details: err.message });
  }
}
