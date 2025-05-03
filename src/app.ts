import Fastify from 'fastify';
import ldapPlugin from 'plugins/ldap-client';
import { authRoutes } from 'modules/auth/checkUser.route';

export async function buildApp() {
  const app = Fastify({ logger: true });

  await app.register(ldapPlugin);
  await app.register(authRoutes);

  return app;
}
