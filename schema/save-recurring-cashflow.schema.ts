import { z } from "zod";

const YMD_REGEX = /^\d{4}-\d{2}-\d{2}$/;

export const RECURRING_FREQUENCY_VALUES = [
  "UNKNOWN",
  "WEEKLY",
  "BIWEEKLY",
  "SEMI_MONTHLY",
  "MONTHLY",
  "ANNUALLY",
  "ONE_TIME",
] as const;

export const RECURRING_FREQUENCY_LABEL: Record<
  (typeof RECURRING_FREQUENCY_VALUES)[number],
  string
> = {
  UNKNOWN: "Unknown",
  ONE_TIME: "One time",
  WEEKLY: "Weekly",
  BIWEEKLY: "Biweekly",
  SEMI_MONTHLY: "Semi monthly",
  MONTHLY: "Monthly",
  ANNUALLY: "Annually",
};

export const RECURRING_FREQUENCY_SELECT_ORDER: (typeof RECURRING_FREQUENCY_VALUES)[number][] =
  [
    "UNKNOWN",
    "ONE_TIME",
    "WEEKLY",
    "BIWEEKLY",
    "SEMI_MONTHLY",
    "MONTHLY",
    "ANNUALLY",
  ];

const nullableUuid = z.union([z.string().uuid(), z.null()]);

const optionalYmd = z.union([
  z.literal(""),
  z.string().regex(YMD_REGEX, "Use YYYY-MM-DD"),
]).optional();

export const saveRecurringCashflowFormSchema = z
  .object({
    linkedBankAccountId: nullableUuid,
    direction: z.enum(["inflow", "outflow"]),
    merchantName: z.string(),
    description: z.string(),
    pfcPrimary: z.string(),
    pfcDetailed: z.string().optional(),
    frequency: z.enum(RECURRING_FREQUENCY_VALUES),
    lastAmount: z.number().min(0).optional(),
    expectedAmount: z.coerce.number({
      invalid_type_error: "Enter a valid amount",
    }),
    firstDate: optionalYmd,
    lastDate: optionalYmd,
    predictedNextDate: optionalYmd,
  })
  .superRefine((data, ctx) => {
    if (Number.isNaN(data.expectedAmount)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Enter a valid amount",
        path: ["expectedAmount"],
      });
      return;
    }

    if (data.expectedAmount < 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Amount must be at least 0",
        path: ["expectedAmount"],
      });
    }
  });

export type SaveRecurringCashflowFormValues = z.infer<
  typeof saveRecurringCashflowFormSchema
>;