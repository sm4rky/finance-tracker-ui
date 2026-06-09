import { z } from "zod";

export const updateBudgetFormSchema = z.object({
  name: z.string().trim().min(1, "Name is required"),
  amountLimit: z.coerce
    .number({
      invalid_type_error: "Enter a valid limit amount",
      required_error: "Limit amount is required",
    })
    .finite("Enter a valid limit amount")
    .positive("Limit amount must be greater than 0"),
});

export type UpdateBudgetFormValues = z.infer<typeof updateBudgetFormSchema>;
