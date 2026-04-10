import {z } from "zod"


export const rivalSchema = z.object({
  nickname: z.string().min(1),
  rivalUserId: z.string().min(1 , {
    message: "Rival User ID is required",
  }),
  userId: z.string().min(1 , {
    message: "User ID is required",
  }),
});

export type RivalSchema = z.infer<typeof rivalSchema>;