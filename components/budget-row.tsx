"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ChevronDown,
  CreditCard,
  Loader2Icon,
  MoreHorizontal,
  Pencil,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";

import {
  Accordion,
  AccordionContent,
  AccordionHeader,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import type {
  LinkedBankAccountResponse,
  LinkedBankResponse,
} from "@/interface/plaid";
import type {
  ProfileBudgetCategoryResponse,
  ProfileBudgetResponse,
} from "@/interface/profile-budget";
import {
  listProfileBudgetPeriods,
  updateProfileBudgetActive,
} from "@/lib/api/profile-budget";
import { BUDGET_PERIOD_LABEL } from "@/lib/budget-period";
import { getCustomCategoryMeta } from "@/lib/custom-category";
import { getPfcPrmaryMeta } from "@/lib/pfc-primary";
import { useNotificationPreferences } from "@/hooks/use-notification-preferences";
import { cn } from "@/lib/utils";

function formatCurrencyUsd(amount: number): string {
  try {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency: "USD",
    }).format(amount);
  } catch {
    return amount.toFixed(0);
  }
}

function getSpentPercent(spentAmount: number, amountLimit: number): number {
  if (amountLimit <= 0) return 0;
  const value = (spentAmount / amountLimit) * 100;
  if (!Number.isFinite(value)) return 0;
  return Math.min(100, Math.max(0, value));
}

function getAccountLabel(account: LinkedBankAccountResponse): string {
  const base =
    account.officialName?.trim() || account.accountName?.trim() || "Account";
  return account.mask ? `${base} ••••${account.mask}` : base;
}

function getAccountLabels(
  banks: LinkedBankResponse[],
  linkedBankAccountIds: string[],
): string {
  const accounts = banks.flatMap((bank) => bank.accounts);
  return (
    linkedBankAccountIds
      .map((accountId) => {
        const account = accounts.find((item) => item.id === accountId);
        return account ? getAccountLabel(account) : "Unknown account";
      })
      .join(" · ") || "No linked accounts"
  );
}

function getCategoryMeta(category: ProfileBudgetCategoryResponse) {
  return category.customCategory
    ? getCustomCategoryMeta(category.customCategory)
    : getPfcPrmaryMeta(category.pfcPrimaryCode);
}

export type BudgetRowProps = {
  budget: ProfileBudgetResponse;
  banks: LinkedBankResponse[];
  onEdit: (budget: ProfileBudgetResponse) => void;
  onDelete: (budgetId: string) => void;
};

export function BudgetRow({ budget, banks, onEdit, onDelete }: BudgetRowProps) {
  const queryClient = useQueryClient();
  const { preferences } = useNotificationPreferences();
  const budgetAlertThreshold = preferences?.budgetAlertThreshold;
  const [expandBudgetId, setExpandBudgetId] = useState<string>("");
  const [showAllCategories, setShowAllCategories] = useState(false);

  const {
    data = [],
    isPending,
    isError,
  } = useQuery({
    queryKey: ["profile-budget-periods", budget.id],
    queryFn: () => listProfileBudgetPeriods(budget.id),
    enabled: expandBudgetId === budget.id,
  });

  const activeMutation = useMutation({
    mutationFn: (isActive: boolean) =>
      updateProfileBudgetActive(budget.id, { isActive }),
    onSuccess: async (updatedBudget) => {
      await queryClient.invalidateQueries({ queryKey: ["profile-budgets"] });
      toast.success(
        updatedBudget.isActive
          ? "Budget enabled successfully."
          : "Budget disabled successfully.",
      );
    },
    onError: (e: Error) => {
      toast.error(e.message || "Could not update budget.");
    },
  });

  const currentPeriod = budget.currentPeriod;
  const spentAmount = currentPeriod?.spentAmount ?? 0;
  const amountLimit = currentPeriod?.amountLimit ?? budget.amountLimit;
  const percent = getSpentPercent(spentAmount, amountLimit);
  const remaining = amountLimit - spentAmount;
  const atAlertThreshold =
    budgetAlertThreshold != null && percent >= budgetAlertThreshold;

  return (
    <Accordion
      type="single"
      collapsible
      value={expandBudgetId}
      onValueChange={setExpandBudgetId}
      className="w-full"
    >
      <AccordionItem
        value={budget.id}
        className="rounded-xl border border-border bg-card px-3 py-3 shadow-sm transition-colors hover:border-primary/40"
      >
        <AccordionHeader className="relative border-0 p-0">
          <AccordionTrigger
            className="w-full flex-col items-stretch gap-3 py-0"
            aria-label={`${expandBudgetId === budget.id ? "Collapse" : "Expand"} ${budget.name}`}
          >
            <div className="w-full min-h-8">
              <div className="flex min-w-0 items-center gap-2">
                <p className="min-w-0 truncate text-base font-semibold leading-snug text-foreground">
                  {budget.name}
                </p>
                {budget.periodType ? (
                  <Badge
                    variant="secondary"
                    className="shrink-0 border font-normal text-xs"
                  >
                    {BUDGET_PERIOD_LABEL[budget.periodType]}
                  </Badge>
                ) : null}
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-1.5">
              {(() => {
                const categoryMetas = budget.categories.map(getCategoryMeta);
                const visibleCategoryMetas = showAllCategories
                  ? categoryMetas
                  : categoryMetas.slice(0, 3);

                return categoryMetas.length > 0 ? (
                  <>
                    {visibleCategoryMetas.map((meta) => (
                      <Badge
                        key={meta.displayName}
                        variant="outline"
                        className={cn(
                          "max-w-40 truncate border font-normal text-xs",
                          meta.badgeClassName,
                        )}
                      >
                        {meta.displayName}
                      </Badge>
                    ))}
                    {categoryMetas.length > 3 ? (
                      <button
                        type="button"
                        className="text-xs font-medium text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
                        onClick={(event) => {
                          event.preventDefault();
                          event.stopPropagation();
                          setShowAllCategories((current) => !current);
                        }}
                      >
                        {showAllCategories ? "Hide" : "Display more"}
                      </button>
                    ) : null}
                  </>
                ) : (
                  <span className="text-sm text-muted-foreground">
                    No categories
                  </span>
                );
              })()}
            </div>

            <p className="flex min-w-0 items-center gap-1.5 text-sm text-muted-foreground">
              <CreditCard className="size-4 shrink-0" aria-hidden />
              <span className="min-w-0 truncate">
                {getAccountLabels(banks, budget.linkedBankAccountIds)}
              </span>
            </p>

            <div className="space-y-2">
              <Progress
                value={percent}
                className={cn(atAlertThreshold && "bg-destructive/20")}
                indicatorClassName={cn(atAlertThreshold && "bg-destructive")}
              />
              <div className="grid grid-cols-3 gap-2 text-sm">
                <p
                  className={cn(
                    "truncate text-destructive",
                    atAlertThreshold && "text-destructive",
                  )}
                >
                  {formatCurrencyUsd(spentAmount)} spent
                </p>
                <p className="truncate text-center text-muted-foreground">
                  of{" "}
                  <span className="font-semibold text-foreground">
                    {formatCurrencyUsd(amountLimit)}
                  </span>
                </p>
                <p
                  className={cn(
                    "truncate text-right font-medium",
                    remaining >= 0 && !atAlertThreshold
                      ? "text-emerald-600"
                      : "text-destructive",
                  )}
                >
                  {formatCurrencyUsd(remaining)} left
                </p>
              </div>
            </div>
          </AccordionTrigger>

          <div className="pointer-events-none absolute right-4 top-0 z-10 flex h-8 items-center gap-2">
            <Switch
              className="pointer-events-auto"
              checked={budget.isActive}
              disabled={activeMutation.isPending}
              onCheckedChange={(checked) =>
                activeMutation.mutate(checked === true)
              }
              aria-label={`Toggle ${budget.name} active state`}
            />
            <DropdownMenu>
              <DropdownMenuTrigger
                type="button"
                className={cn(
                  "pointer-events-auto inline-flex size-8 items-center justify-center rounded-lg text-muted-foreground outline-none transition-colors",
                  "hover:bg-muted hover:text-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50",
                )}
                aria-label={`Actions for ${budget.name}`}
              >
                {activeMutation.isPending ? (
                  <Loader2Icon className="size-4 animate-spin" />
                ) : (
                  <MoreHorizontal className="size-4" />
                )}
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="min-w-36">
                <DropdownMenuItem onClick={() => onEdit(budget)}>
                  <Pencil className="size-4 text-muted-foreground" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem
                  variant="destructive"
                  onClick={() => onDelete(budget.id)}
                >
                  <Trash2 className="size-4" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <ChevronDown
              className={cn(
                "pointer-events-none size-4 shrink-0 text-muted-foreground transition-transform",
                expandBudgetId === budget.id && "rotate-180",
              )}
              aria-hidden
            />
          </div>
        </AccordionHeader>

        <AccordionContent className="pt-4">
          <div className="border-t border-border/60 pt-4">
            <p className="mb-3 text-sm font-semibold text-muted-foreground">
              Spending History
            </p>
            {isPending ? (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2Icon className="size-4 animate-spin" aria-hidden />
                Loading history...
              </div>
            ) : isError ? (
              <p className="text-sm text-destructive">
                Could not load budget history.
              </p>
            ) : data.length === 0 ? (
              <p className="text-sm text-muted-foreground">No history found.</p>
            ) : (
              <div className="space-y-2">
                {data.map((period) => {
                  const periodPercent = getSpentPercent(
                    period.spentAmount,
                    period.amountLimit,
                  );
                  const periodAtAlertThreshold =
                    budgetAlertThreshold != null &&
                    periodPercent >= budgetAlertThreshold;

                  return (
                    <div
                      key={period.id}
                      className="grid grid-cols-[minmax(0,1fr)_7rem_8.5rem] items-center gap-3 text-sm sm:grid-cols-[minmax(0,1fr)_12rem_10rem]"
                    >
                      <p className="min-w-0 truncate text-muted-foreground">
                        {period.periodName}
                      </p>
                      <Progress
                        value={periodPercent}
                        className={cn(
                          "h-1.5",
                          periodAtAlertThreshold && "bg-destructive/20",
                        )}
                        indicatorClassName={cn(
                          periodAtAlertThreshold && "bg-destructive",
                        )}
                      />
                      <p
                        className={cn(
                          "min-w-0 truncate text-right font-medium tabular-nums",
                          periodAtAlertThreshold && "text-destructive",
                        )}
                        title={`${formatCurrencyUsd(period.spentAmount)} / ${formatCurrencyUsd(period.amountLimit)}`}
                      >
                        {formatCurrencyUsd(period.spentAmount)}
                        <span className="text-muted-foreground">
                          {" "}
                          / {formatCurrencyUsd(period.amountLimit)}
                        </span>
                      </p>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
