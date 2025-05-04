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
    userPrincipalName: `${username}@empresa.com`,
    userAccountControl: '544', // NORMAL_ACCOUNT + PASSWD_NOTREQD
    unicodePwd: encodedPwd
  };

  await new Promise<void>((resolve, reject) => {
    client.add(dn, newUser, (err) => {
      if (err) return reject(err);
      resolve();
    });
  });
}