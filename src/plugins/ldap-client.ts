import fp from 'fastify-plugin';
import ldap from 'ldapjs';
import { FastifyInstance } from 'fastify';
import { env } from 'config/env';

export default fp(async (fastify: FastifyInstance) => {
  const client = ldap.createClient({ url: env.LDAP_URL });

  fastify.decorate('ldap', client);
});

declare module 'fastify' {
  interface FastifyInstance {
    ldap: ldap.Client;
  }
}
