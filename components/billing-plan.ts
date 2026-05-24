export type BillingPlan = {
  id: "free" | "pro" | "premium";
  name: string;
  features: string[];
};

export const BILLING_PLANS: BillingPlan[] = [
  {
    id: "free",
    name: "Free",
    features: ["2 bank accounts", "2 years history", "Basic charts"],
  },
  {
    id: "pro",
    name: "Pro",
    features: ["5 bank accounts", "5 years history", "PDF reports", "AI Support"],
  },
  {
    id: "premium",
    name: "Premium",
    features: ["Unlimited accounts", "Full history", "PDF reports", "AI Support"],
  },
];
