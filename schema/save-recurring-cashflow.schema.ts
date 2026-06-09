import { z } from "zod";

import { RECURRING_CASHFLOW_FREQUENCY } from "@/lib/recurring-cashflow-frequency";

const YMD_REGEX = /^\d{4}-\d{2}-\d{2}$/;

export const saveRecurringCashflowFormSchema = z
  .object({
    linkedBankAccountId: z.union([z.string().uuid(), z.null()]),
    direction: z.enum(["inflow", "outflow"]),
    merchantName: z.string(),
    description: z.string(),
    pfcPrimary: z.string(),
    pfcDetailed: z.string().optional(),
    frequency: z.enum(RECURRING_CASHFLOW_FREQUENCY),
    lastAmount: z.number().finite("Enter a valid amount").min(0).optional(),
    expectedAmount: z.coerce
      .number({
        invalid_type_error: "Enter a valid amount",
        required_error: "Amount is required",
      })
      .finite("Enter a valid amount")
      .min(0, "Amount must be at least 0"),
    firstDate: z
      .string()
      .trim()
      .refine(
        (value) => value === "" || YMD_REGEX.test(value),
        "Use YYYY-MM-DD",
      )
      .optional(),
    lastDate: z
      .string()
      .trim()
      .refine(
        (value) => value === "" || YMD_REGEX.test(value),
        "Use YYYY-MM-DD",
      )
      .optional(),
    predictedNextDate: z
      .string()
      .trim()
      .refine(
        (value) => value === "" || YMD_REGEX.test(value),
        "Use YYYY-MM-DD",
      )
      .optional(),
  });

export type SaveRecurringCashflowFormValues = z.infer<
  typeof saveRecurringCashflowFormSchema
>;