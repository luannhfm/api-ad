import { z } from 'zod';

export const UpdateStatusSchema = z.object({
  username: z.string().min(3, 'O nome de usuário é obrigatório'),
  enabled: z.boolean()
});

export type UpdateStatusDTO = z.infer<typeof UpdateStatusSchema>;
