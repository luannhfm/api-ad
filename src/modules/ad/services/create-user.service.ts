import ldap from 'ldapjs';
import { CreateUserDTO } from '../dtos/create-user.dto';

export async function createUserService(data: CreateUserDTO, client: ldap.Client): Promise<void> {
  const { name, username, password, ou } = data;

  const dn = `CN=${name},${ou}`;

  // 1. Criação do usuário sem senha
  const newUser = {
    cn: name,
    sn: name.split(' ').slice(-1)[0],
    objectClass: ['top', 'person', 'organizationalPerson', 'user'],
    sAMAccountName: username,
    userPrincipalName: `${username}@empresa.com`
  };

  await new Promise<void>((resolve, reject) => {
    client.add(dn, newUser, (err) => {
      if (err) return reject(err);
      resolve();
    });
  });

  // 2. Modificação para adicionar senha e ativar a conta
  const changes = [
    new ldap.Change({
      operation: 'replace',
      modification: {
        unicodePwd: Buffer.from(`"${password}"`, 'utf16le')
      }
    }),
    new ldap.Change({
      operation: 'replace',
      modification: {
        userAccountControl: '512' // NORMAL_ACCOUNT
      }
    })
  ];

  await new Promise<void>((resolve, reject) => {
    client.modify(dn, changes, (err) => {
      if (err) return reject(err);
      resolve();
    });
  });
}
