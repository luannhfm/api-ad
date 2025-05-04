import ldap from 'ldapjs';
import { env } from 'config/env';

export async function listUsersService(client: ldap.Client): Promise<any[]> {
  await new Promise<void>((resolve, reject) => {
    client.bind(env.LDAP_BIND_DN, env.LDAP_BIND_PASSWORD, err => {
      if (err) return reject(err);
      resolve();
    });
  });

  const searchOptions: ldap.SearchOptions = {
    filter: '(objectClass=user)',
    scope: 'sub',
    attributes: ['cn', 'sAMAccountName', 'mail', 'userAccountControl']
  };

  return new Promise<any[]>((resolve, reject) => {
    const users: any[] = [];

    client.search(env.LDAP_BASE_DN, searchOptions, (err, res) => {
      if (err) return reject(err);

      res.on('searchEntry', entry => {
        const attrs = entry.attributes.reduce((acc, attr) => {
          acc[attr.type] = attr.vals[0];
          return acc;
        }, {} as Record<string, string>);

        const uac = parseInt(attrs['userAccountControl'] || '0', 10);
        const isDisabled = (uac & 2) !== 0;

        users.push({
          name: attrs['cn'],
          username: attrs['sAMAccountName'],
          email: attrs['mail'],
          active: !isDisabled
        });
      });

      res.on('end', () => resolve(users));
      res.on('error', reject);
    });
  });
}
