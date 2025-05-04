import { FastifyRequest, FastifyReply } from 'fastify';
import { AuthenticateUserSchema } from '../dtos/authenticate-user.dto';
import { authenticateUserService } from '../services/authenticate-user.service';

export async function authenticateUserController(req: FastifyRequest, reply: FastifyReply) {
  const parsed = AuthenticateUserSchema.safeParse(req.body);

  if (!parsed.success) {
    return reply.status(400).send({ error: 'Dados inválidos', details: parsed.error.flatten() });
  }

  const { username, password } = parsed.data;

  try {
    const authenticated = await authenticateUserService(username, password);
    if (authenticated) {
      return reply.send({ authenticated: true });
    } else {
      return reply.status(401).send({ authenticated: false, error: 'Credenciais inválidas' });
    }
  } catch (err: any) {
    return reply.status(500).send({ error: 'Erro na autenticação', details: err.message });
  }
}
