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
  try {
    const change = new ldap.Change({
      operation: 'replace',
      modification: {
        unicodePwd: encodedPwd
      }
    });

    await new Promise<void>((resolve, reject) => {
      client.modify(dn, change, (err) => {
        if (err) {
          if (err.message.includes('Operations Error')) {
            console.warn('Aviso ao definir senha:', err.message);
            return resolve(); // ignora e segue
          }
          return reject(err);
        }
        resolve();
      });
    });
  } catch (err) {
    console.error('Erro ao definir senha:', err);
  }

  // 3. Ativa o usuário
  try {
    const change = new ldap.Change({
      operation: 'replace',
      modification: {
        userAccountControl: '512'
      }
    });

    await new Promise<void>((resolve, reject) => {
      client.modify(dn, change, (err) => {
        if (err) {
          if (err.message.includes('Operations Error')) {
            console.warn('Aviso ao ativar usuário:', err.message);
            return resolve();
          }
          return reject(err);
        }
        resolve();
      });
    });
  } catch (err) {
    console.error('Erro ao ativar usuário:', err);
  }
}
