// src/routes/ad.routes.ts
import { FastifyInstance } from 'fastify';
import { checkUserStatusController } from 'modules/ad/controllers/check-status.controller';

export async function adRoutes(app: FastifyInstance) {
  app.post('/ad/status', checkUserStatusController);
}
