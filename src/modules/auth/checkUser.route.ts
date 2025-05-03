import { FastifyInstance } from 'fastify';
import { checkUserController } from './checkUser.controller';

export async function authRoutes(fastify: FastifyInstance) {
  fastify.post('/auth', checkUserController);
}
