import { z } from "zod";

export const profileUsernameSchema = z.object({
  username: z
    .string()
    .trim()
    .min(1, "Username is required.")
    .pipe(
      z
        .string()
        .min(8, "Username must be at least 8 characters.")
        .max(30, "Username must be at most 30 characters.")
        .regex(
          /^[a-zA-Z0-9._]+$/,
          "Only letters, numbers, periods, and underscores are allowed.",
        ),
    ),
});

export type ProfileUsernameFormValues = z.infer<typeof profileUsernameSchema>;
