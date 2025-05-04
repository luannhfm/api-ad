// src/routes/ad.routes.ts
import { FastifyInstance } from 'fastify';
import { checkUserStatusController } from 'modules/ad/controllers/check-status.controller';
import { createUserController } from 'modules/ad/controllers/create-user.controller';
import { getUserDetailsController } from 'modules/ad/controllers/get-user.controller';
import { listUsersController } from 'modules/ad/controllers/list-users.controller';
import { updateUserStatusController } from 'modules/ad/controllers/update-status.controller';

export async function adRoutes(app: FastifyInstance) {
  app.post('/ad/status', checkUserStatusController);
  app.post('/ad/user', createUserController);
  app.patch('/ad/user/status', updateUserStatusController);
  app.post('/ad/user/details', getUserDetailsController);
  app.get('/ad/users', listUsersController);
}
