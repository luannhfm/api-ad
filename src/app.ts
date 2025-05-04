import Fastify from 'fastify';
import ldapPlugin from 'plugins/ldap-client';
import { adRoutes } from 'routes/ad.routes';

export async function buildApp() {
  const app = Fastify({ logger: true });

  await app.register(ldapPlugin);
  await app.register(adRoutes);

  return app;
}
