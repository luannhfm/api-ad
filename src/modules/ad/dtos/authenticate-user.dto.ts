import { z } from 'zod';

export const AuthenticateUserSchema = z.object({
  username: z.string().min(3, 'O nome de usuário é obrigatório'),
  password: z.string().min(1, 'A senha é obrigatória')
});

export type AuthenticateUserDTO = z.infer<typeof AuthenticateUserSchema>;
