import ldap from 'ldapjs';
import { UpdateStatusDTO } from '../dtos/update-status.dto';
import { env } from 'config/env';

export async function updateUserStatusService(data: UpdateStatusDTO, client: ldap.Client): Promise<void> {
  const { username, enabled } = data;

  await new Promise<void>((resolve, reject) => {
    client.bind(env.LDAP_BIND_DN, env.LDAP_BIND_PASSWORD, err => {
      if (err) return reject(err);
      resolve();
    });
  });

  const searchOptions: ldap.SearchOptions = {
    filter: `(sAMAccountName=${username})`,
    scope: 'sub',
    attributes: ['distinguishedName']
  };

  const userDN = await new Promise<string>((resolve, reject) => {
    client.search(env.LDAP_BASE_DN, searchOptions, (err, res) => {
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

  const userAccountControl = enabled ? '512' : '514';

  // Aqui está o ajuste essencial
  const change = new ldap.Change({
    operation: 'replace',
    modification: new ldap.Attribute({
      type: 'userAccountControl',
      vals: [userAccountControl]
    })
  });

  await new Promise<void>((resolve, reject) => {
    client.modify(userDN, change, err => {
      if (err) return reject(err);
      resolve();
    });
  });
}
