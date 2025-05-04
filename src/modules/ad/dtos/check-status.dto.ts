import { z } from 'zod';

export const CheckStatusSchema = z.object({
  username: z.string().min(3, 'O nome de usuário é obrigatório')
});

export type CheckStatusDTO = z.infer<typeof CheckStatusSchema>;