import z from "zod";

const formSchema = z.object({
  name: z.string().optional(),
  email: z.string().email().optional(),
  emailVerified: z.date().optional().nullable(),
  image: z.string().optional().nullable(),
});
export type FormData = z.infer<typeof formSchema>;


export const PostSchema = z.object({
  title: z
    .string()
    .min(3, "O título deve ter pelo menos 3 caracteres")
    .max(100, "O título não pode passar de 100 caracteres"),
  capa: z
    .string(),
  description: z
    .string()
    .min(10, "A descrição deve ter pelo menos 10 caracteres")
    .max(300, "A descrição não pode passar de 300 caracteres")
    .optional(),
  content: z
    .string()
    .min(1, "O conteúdo não pode estar vazio"),
});
export type PostFormData = z.infer<typeof PostSchema>;