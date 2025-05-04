import ldap from 'ldapjs';
import { env } from 'config/env';

export async function checkUserStatusService(username: string, client: ldap.Client): Promise<boolean> {
  await new Promise<void>((resolve, reject) => {
    client.bind(env.LDAP_BIND_DN, env.LDAP_BIND_PASSWORD, err => {
      if (err) return reject(err);
      resolve();
    });
  });

  const searchOptions: ldap.SearchOptions = {
    filter: `(sAMAccountName=${username})`,
    scope: 'sub',
    attributes: ['cn', 'userAccountControl']
  };

  return new Promise<boolean>((resolve, reject) => {
    client.search(env.LDAP_BASE_DN, searchOptions, (err, res) => {
      if (err) return reject(err);

      let userFound = false;

      res.on('searchEntry', entry => {
        userFound = true;
        const uac = parseInt(entry.attributes.find(attr => attr.type === 'userAccountControl')?.vals[0] || '0', 10);
        const isDisabled = (uac & 2) !== 0;
        resolve(!isDisabled);
      });

      res.on('error', reject);
      res.on('end', () => {
        if (!userFound) resolve(false);
      });
    });
  });
}