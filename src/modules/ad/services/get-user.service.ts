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
    attributes: ['cn', 'sAMAccountName', 'mail', 'userAccountControl']
  };
  

  return new Promise((resolve, reject) => {
    client.search(env.LDAP_BASE_DN, searchOptions, (err, res) => {
      if (err) return reject(err);

      let found = false;

      res.on('searchEntry', entry => {
        found = true;
      
        const attrs = entry.attributes.reduce((acc, attr) => {
          acc[attr.type] = attr.vals[0];
          return acc;
        }, {} as Record<string, string>);
      
        const uacRaw = attrs['userAccountControl'];
        const isDisabled = (parseInt(uacRaw || '0', 10) & 2) !== 0;
      
        resolve({
          name: attrs['cn'],
          username: attrs['sAMAccountName'],
          email: attrs['mail'],
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
