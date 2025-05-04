import ldap from 'ldapjs';
import { UpdateStatusDTO } from '../dtos/update-status.dto';
import { env } from 'config/env';

export async function updateUserStatusService(data: UpdateStatusDTO, client: ldap.Client): Promise<void> {
  const { username, enabled } = data;

  // Bind com credenciais administrativas
  await new Promise<void>((resolve, reject) => {
    client.bind(env.LDAP_BIND_DN, env.LDAP_BIND_PASSWORD, err => {
      if (err) return reject(err);
      resolve();
    });
  });

  // Busca o DN do usuário
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
        const dn = entry.dn.toString();
        console.log('DN encontrado:', dn);
        resolve(dn);
      });

      res.on('error', reject);
      res.on('end', () => {
        if (!found) reject(new Error('Usuário não encontrado.'));
      });
    });
  });

  // Define o valor do atributo para ativar (512) ou desativar (514)
  const userAccountControl = enabled ? '512' : '514';

  // Correção: usar `values` ao invés de `vals`
  const change = new ldap.Change({
    operation: 'replace',
    modification: new ldap.Attribute({
      type: 'userAccountControl',
      values: [userAccountControl]
    })
  });

  // Aplica a modificação
  await new Promise<void>((resolve, reject) => {
    client.modify(userDN, change, err => {
      if (err) return reject(err);
      resolve();
    });
  });
}
