import dotenv from 'dotenv';
dotenv.config();

export const env = {
  PORT: process.env.PORT || 3000,
  LDAP_URL: process.env.LDAP_URL || '',
  LDAP_BASE_DN: process.env.LDAP_BASE_DN || '',
  LDAP_BIND_DN: process.env.LDAP_BIND_DN || '',           // ⬅ login usado para buscar
  LDAP_BIND_PASSWORD: process.env.LDAP_BIND_PASSWORD || '' // ⬅ senha do login
};
