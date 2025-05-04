import ldap from 'ldapjs';
import { CreateUserDTO } from '../dtos/create-user.dto';

export async function createUserService(data: CreateUserDTO, client: ldap.Client): Promise<void> {
  const { name, username, password, ou } = data;

  const dn = `CN=${name},${ou}`;
  const encodedPwd = Buffer.from(`"${password}"`, 'utf16le');

  const newUser = {
    cn: name,
    sn: name.split(' ').slice(-1)[0],
    objectClass: ['top', 'person', 'organizationalPerson', 'user'],
    sAMAccountName: username,
    userPrincipalName: `${username}@empresa.com`
  };

  // 1. Adiciona o usuário
  await new Promise<void>((resolve, reject) => {
    client.add(dn, newUser, (err) => {
      if (err) return reject(err);
      resolve();
    });
  });

  // 2. Seta a senha
  await new Promise<void>((resolve, reject) => {
    const change = new ldap.Change({
      operation: 'replace',
      modification: new ldap.Attribute({
        type: 'unicodePwd',
        values: [encodedPwd]
      })
    });

    client.modify(dn, change, (err) => {
      if (err) return reject(err);
      resolve();
    });
  });

  // 3. Ativa o usuário (userAccountControl = 512)
  await new Promise<void>((resolve, reject) => {
    const change = new ldap.Change({
      operation: 'replace',
      modification: new ldap.Attribute({
        type: 'userAccountControl',
        values: ['512']
      })
    });

    client.modify(dn, change, (err) => {
      if (err) return reject(err);
      resolve();
    });
  });
}