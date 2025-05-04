// src/modules/ad/services/update-status.service.ts
import ldap from 'ldapjs';
import { UpdateStatusDTO } from '../dtos/update-status.dto';
import { env } from 'config/env';

export async function updateUserStatusService(data: UpdateStatusDTO, client: ldap.Client): Promise<void> {
  const { username, enabled } = data;

  // Realiza bind com credenciais de serviço
  await new Promise<void>((resolve, reject) => {
    client.bind(env.LDAP_BIND_DN, env.LDAP_BIND_PASSWORD, err => {
      if (err) return reject(new Error('Falha no bind com o servidor LDAP'));
      resolve();
    });
  });

  // Define filtros e atributos da busca
  const searchOptions: ldap.SearchOptions = {
    filter: `(sAMAccountName=${username})`,
    scope: 'sub',
    attributes: ['distinguishedName']
  };

  // Busca o DN (distinguishedName) do usuário
  const userDN = await new Promise<string>((resolve, reject) => {
    client.search(env.LDAP_BASE_DN, searchOptions, (err, res) => {
      if (err) return reject(err);

      let found = false;

      res.on('searchEntry', entry => {
        found = true;
        resolve(entry.dn.toString()); // Aqui pegamos corretamente o DN
      });

      res.on('error', reject);

      res.on('end', () => {
        if (!found) reject(new Error('Usuário não encontrado.'));
      });
    });
  });

  // Define status (512 = ativo, 514 = desabilitado)
  const userAccountControl = enabled ? 512 : 514;

  // Cria modificação com classe `Change`
  const change = new ldap.Change({
    operation: 'replace',
    modification: {
      userAccountControl: String(userAccountControl),
    },
  });

  // Aplica a modificação no usuário
  await new Promise<void>((resolve, reject) => {
    client.modify(userDN, change, err => {
      if (err) return reject(new Error(`Erro ao modificar usuário: ${err.message}`));
      resolve();
    });
  });
}
