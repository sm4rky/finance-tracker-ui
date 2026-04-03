import { z } from "zod";

const YMD_REGEX = /^\d{4}-\d{2}-\d{2}$/;

function isYmdNotAfterTodayUtc(ymd: string): boolean {
  if (!YMD_REGEX.test(ymd)) return false;
  const [ys, ms, ds] = ymd.split("-");
  const y = Number(ys);
  const m = Number(ms);
  const d = Number(ds);
  if (!Number.isFinite(y) || !Number.isFinite(m) || !Number.isFinite(d)) {
    return false;
  }
  const inputDayUtc = Date.UTC(y, m - 1, d);
  const now = new Date();
  const todayUtc = Date.UTC(
    now.getUTCFullYear(),
    now.getUTCMonth(),
    now.getUTCDate(),
  );
  return inputDayUtc <= todayUtc;
}

const nullableUuid = z.union([z.string().uuid(), z.null()]);

export const saveTransactionFormSchema = z
  .object({
    linkedBankAccountId: nullableUuid,
    amount: z.coerce
      .number({ invalid_type_error: "Enter a valid amount" })
      .min(0, "Amount must be at least 0"),
    amountFlow: z.enum(["expense", "income"]),
    date: z
      .string()
      .regex(YMD_REGEX, "Use YYYY-MM-DD"),
    merchantName: z.string(),
    pending: z.boolean(),
    paymentChannel: z.enum(["online", "instore", "other"]),
    pfcPrimary: z.string(),
    pfcDetailed: z.string().optional(),
    website: z.string().optional(),
    clearLogo: z.boolean(),
  })
  .superRefine((data, ctx) => {
    if (!isYmdNotAfterTodayUtc(data.date)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Date cannot be in the future",
        path: ["date"],
      });
    }
    if (Number.isNaN(data.amount)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Enter a valid amount",
        path: ["amount"],
      });
    }
  });

export type SaveTransactionFormValues = z.infer<typeof saveTransactionFormSchema>;
