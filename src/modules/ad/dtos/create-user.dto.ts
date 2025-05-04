import { z } from 'zod';

export const CreateUserSchema = z.object({
  name: z.string().min(3, 'O nome é obrigatório'),
  username: z.string().min(3, 'O nome de usuário é obrigatório'),
  password: z.string()
    .min(8, 'A senha deve ter pelo menos 8 caracteres')
    .regex(/[A-Z]/, 'A senha deve conter ao menos uma letra maiúscula')
    .regex(/[a-z]/, 'A senha deve conter ao menos uma letra minúscula')
    .regex(/[0-9]/, 'A senha deve conter ao menos um número')
    .regex(/[^A-Za-z0-9]/, 'A senha deve conter ao menos um caractere especial'),
  ou: z.string().min(1, 'A OU (unidade organizacional) é obrigatória')
});
export type CreateUserDTO = z.infer<typeof CreateUserSchema>;