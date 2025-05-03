import ldap from 'ldapjs';
import { env } from 'config/env';

export async function checkUserStatus(username: string, client: ldap.Client): Promise<boolean> {
  const bindDN = env.LDAP_BIND_DN;
  const bindPassword = env.LDAP_BIND_PASSWORD;
  const baseDN = env.LDAP_BASE_DN;

  await new Promise<void>((resolve, reject) => {
    client.bind(bindDN, bindPassword, (err) => {
      if (err) return reject(err);
      resolve();
    });
  });

  const searchOptions : any  = {
    filter: `(sAMAccountName=${username})`,
    scope: 'sub',
    attributes: ['cn', 'userAccountControl']
  };

  return new Promise<boolean>((resolve, reject) => {
    client.search(baseDN, searchOptions, (err, res: ldap.SearchCallbackResponse) => {
      if (err) return reject(err);

      let userFound = false;

      res.on('searchEntry', (entry) => {
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
