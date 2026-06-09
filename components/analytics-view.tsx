"use client";

import { useState } from "react";

import { AccountExpenseBarChart } from "@/components/account-expense-bar-chart";
import { CashflowSection } from "@/components/cashflow-section";
import { CategoryExpenseBarChart } from "@/components/category-expense-bar-chart";
import { CategoryExpensePieChart } from "@/components/category-expense-pie-chart";
import { CategorySetDropdown } from "@/components/category-set-dropdown";
import { TransactionsDateFilter } from "@/components/transactions-date-filter";
import {
  TransactionsFilterPanels,
  TransactionsFilterTrigger,
} from "@/components/transactions-filter";

export function AnalyticsView() {
  const [filtersOpen, setFiltersOpen] = useState(false);

  return (
    <div className="flex w-full min-w-0 flex-col gap-3 p-4 sm:gap-5 sm:p-6 md:p-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-heading text-2xl font-semibold">Analytics</h1>
          <p className="text-sm text-muted-foreground">
            Analyze spending across categories and accounts.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <TransactionsDateFilter />
          <CategorySetDropdown />
          <TransactionsFilterTrigger
            open={filtersOpen}
            onOpenChange={setFiltersOpen}
          />
        </div>
      </div>

      <TransactionsFilterPanels
        open={filtersOpen}
        onOpenChange={setFiltersOpen}
      />

      <div className="grid w-full min-w-0 shrink-0 grid-cols-1 gap-3 lg:grid-cols-[20rem_1fr] lg:items-stretch lg:gap-5 *:min-w-0">
        <CashflowSection />
        <CategoryExpensePieChart />
      </div>

      <div className="grid w-full min-w-0 shrink-0 grid-cols-1 gap-3 lg:grid-cols-2 lg:items-stretch lg:gap-5 *:min-w-0">
        <CategoryExpenseBarChart />
        <AccountExpenseBarChart />
      </div>
    </div>
  );
}
