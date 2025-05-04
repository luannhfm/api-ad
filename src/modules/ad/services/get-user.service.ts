// src/modules/ad/services/get-user.service.ts
import ldap from 'ldapjs';
import { env } from 'config/env';

export async function getUserDetailsService(username: string, client: ldap.Client): Promise<any> {
  await new Promise<void>((resolve, reject) => {
    client.bind(env.LDAP_BIND_DN, env.LDAP_BIND_PASSWORD, err => {
      if (err) return reject(err);
      resolve();
    });
  });

  const searchOptions: ldap.SearchOptions = {
    filter: `(sAMAccountName=${username})`,
    scope: 'sub',
    attributes: [
      'cn',
      'givenName',
      'sn',
      'mail',
      'userPrincipalName',
      'whenCreated',
      'userAccountControl'
    ]
  };

  return new Promise((resolve, reject) => {
    client.search(env.LDAP_BASE_DN, searchOptions, (err, res) => {
      if (err) return reject(err);

      let found = false;

      res.on('searchEntry', (entry:any ) => {
        found = true;
        const user = entry.object;
        const uac = parseInt(user.userAccountControl || '0', 10);
        const isDisabled = (uac & 2) !== 0;

        resolve({
          name: user.cn,
          email: user.mail,
          username: user.userPrincipalName,
          createdAt: user.whenCreated,
          active: !isDisabled
        });
      });

      res.on('error', reject);
      res.on('end', () => {
        if (!found) reject(new Error('Usuário não encontrado.'));
      });
    });
  });
}
