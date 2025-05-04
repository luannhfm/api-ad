import { z } from 'zod';

export const GetUserSchema = z.object({
  username: z.string().min(3, 'O nome de usuário é obrigatório')
});

export type GetUserDTO = z.infer<typeof GetUserSchema>;
