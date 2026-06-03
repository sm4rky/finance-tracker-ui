export type BillingPlan = {
  id: "free" | "pro" | "premium";
  name: string;
  features: string[];
};

export const BILLING_PLANS: BillingPlan[] = [
  {
    id: "free",
    name: "Free",
    features: ["Unlimited accounts"],
  },
  {
    id: "pro",
    name: "Pro",
    features: ["Unlimited accounts"],
  },
  {
    id: "premium",
    name: "Premium",
    features: ["Unlimited accounts", "Dev will ask you for new features since lack of ideas"],
  },
];
