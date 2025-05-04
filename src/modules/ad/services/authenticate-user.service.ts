import ldap from 'ldapjs';
import { env } from 'config/env';

export async function authenticateUserService(username: string, password: string): Promise<boolean> {
  const adminClient = ldap.createClient({ url: env.LDAP_URL });

  // Primeiro, faz bind com o admin para buscar o DN do usuário
  await new Promise<void>((resolve, reject) => {
    adminClient.bind(env.LDAP_BIND_DN, env.LDAP_BIND_PASSWORD, err => {
      if (err) return reject(err);
      resolve();
    });
  });

  const userDN = await new Promise<string>((resolve, reject) => {
    const searchOptions: ldap.SearchOptions = {
      filter: `(sAMAccountName=${username})`,
      scope: 'sub',
      attributes: ['distinguishedName']
    };

    adminClient.search(env.LDAP_BASE_DN, searchOptions, (err, res) => {
      if (err) return reject(err);

      let found = false;

      res.on('searchEntry', entry => {
        found = true;
        resolve(entry.dn.toString());
      });

      res.on('error', reject);
      res.on('end', () => {
        if (!found) reject(new Error('Usuário não encontrado.'));
      });
    });
  });

  // Agora tenta autenticar com o DN e a senha informada
  const userClient = ldap.createClient({ url: env.LDAP_URL });

  return await new Promise<boolean>((resolve, reject) => {
    userClient.bind(userDN, password, err => {
      if (err) return resolve(false); // senha incorreta
      resolve(true); // autenticado com sucesso
    });
  });
}
