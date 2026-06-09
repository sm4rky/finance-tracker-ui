import { z } from "zod";

import { BUDGET_PERIOD } from "@/lib/budget-period";

const YMD_REGEX = /^\d{4}-\d{2}-\d{2}$/;

export const createBudgetFormSchema = z
  .object({
    name: z.string().trim().min(1, "Name is required"),
    amountLimit: z.coerce
      .number({
        invalid_type_error: "Enter a valid limit amount",
        required_error: "Limit amount is required",
      })
      .finite("Enter a valid limit amount")
      .positive("Limit amount must be greater than 0"),
    isRecurring: z.boolean(),
    periodType: z.enum(BUDGET_PERIOD),
    startDate: z
      .string()
      .trim()
      .min(1, "Start date is required")
      .regex(YMD_REGEX, "Use YYYY-MM-DD"),
    endDate: z
      .string()
      .trim()
      .refine(
        (value) => value === "" || YMD_REGEX.test(value),
        "Use YYYY-MM-DD",
      ),
    profileCustomCategorySetId: z.string().trim(),
    pfcPrimaryCodes: z.array(z.string().min(1)),
    customCategoryIds: z.array(z.string().min(1)),
    linkedBankAccountIds: z
      .array(z.string().min(1))
      .min(1, "Select at least one account"),
    includeIncome: z.boolean(),
    includeUnlinkedTransactions: z.boolean(),
  })
  .superRefine((data, ctx) => {
    if (!data.isRecurring && data.endDate === "") {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "End date is required for fixed budgets",
        path: ["endDate"],
      });
    }

    if (
      YMD_REGEX.test(data.startDate) &&
      YMD_REGEX.test(data.endDate) &&
      data.endDate <= data.startDate
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "End date must be after start date",
        path: ["endDate"],
      });
    }

    if (data.pfcPrimaryCodes.length === 0 && data.customCategoryIds.length === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Select at least one category",
        path: data.profileCustomCategorySetId
          ? ["customCategoryIds"]
          : ["pfcPrimaryCodes"],
      });
    }
  });

export type CreateBudgetFormValues = z.infer<typeof createBudgetFormSchema>;
