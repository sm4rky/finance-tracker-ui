"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { PiggyBank, Plus } from "lucide-react";

import { BudgetRow } from "@/components/budget-row";
import { CreateBudgetSheet } from "@/components/create-budget-sheet";
import { DeleteBudgetDialog } from "@/components/delete-budget-dialog";
import { UpdateBudgetSheet } from "@/components/update-budget-sheet";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useLinkedBanks } from "@/hooks/use-linked-banks";
import { useSelectedCategorySet } from "@/hooks/use-selected-category-set";
import type { ProfileBudgetResponse } from "@/interface/profile-budget";
import { listProfileBudgets } from "@/lib/api/profile-budget";

export function BudgetsView() {
  const { banks } = useLinkedBanks();
  const { categorySets } = useSelectedCategorySet();
  const [createSheetOpen, setCreateSheetOpen] = useState(false);
  const [editingBudget, setEditingBudget] =
    useState<ProfileBudgetResponse | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteBudgetId, setDeleteBudgetId] = useState<string | null>(null);

  const { data, isPending, isError } = useQuery({
    queryKey: ["profile-budgets"],
    queryFn: listProfileBudgets,
  });
  const budgets = data ?? [];

  function openCreateBudgetSheet() {
    setCreateSheetOpen(true);
  }

  function openDeleteBudgetDialog(budgetId: string) {
    setDeleteBudgetId(budgetId);
    setDeleteDialogOpen(true);
  }

  return (
    <div className="flex min-h-0 min-w-0 w-full flex-1 flex-col gap-6 p-6 md:p-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-heading text-2xl font-semibold">Budgets</h1>
          <p className="text-sm text-muted-foreground">
            Manage spending limits across categories and accounts.
          </p>
        </div>
        <Button variant="outline" onClick={openCreateBudgetSheet}>
          <Plus className="size-4 shrink-0" aria-hidden />
          Add budget
        </Button>
      </div>

      <div className="flex min-h-0 min-w-0 w-full flex-col gap-3">
        {isPending ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div
              key={`budget-sk-${i}`}
              className="relative flex flex-col gap-3 rounded-xl border border-border bg-card px-3 py-3"
            >
              <div className="flex min-h-8 min-w-0 items-center gap-2 pr-28">
                <Skeleton className="h-5 w-40" />
                <Skeleton className="h-5 w-16 rounded-full" />
              </div>
              <div className="absolute right-4 top-3 flex h-8 items-center gap-2">
                <Skeleton className="h-[1.15rem] w-8 rounded-full" />
                <Skeleton className="size-8 rounded-lg" />
                <Skeleton className="size-4" />
              </div>
              <div className="flex flex-wrap items-center gap-1.5">
                <Skeleton className="h-5 w-24 rounded-full" />
                <Skeleton className="h-5 w-28 rounded-full" />
              </div>
              <div className="flex min-w-0 items-center gap-1.5">
                <Skeleton className="h-4 w-56 max-w-full" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-2 w-full rounded-full" />
                <div className="grid grid-cols-3 gap-2">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="mx-auto h-4 w-24" />
                  <Skeleton className="ml-auto h-4 w-20" />
                </div>
              </div>
            </div>
          ))
        ) : isError ? (
          <p className="text-sm text-destructive">Could not load budgets.</p>
        ) : budgets.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center gap-3 py-10 text-center">
              <PiggyBank
                className="size-10 text-muted-foreground"
                aria-hidden
              />
              <div>
                <div className="font-medium">No budgets yet</div>
                <p className="text-sm text-muted-foreground">
                  Create your first budget to start tracking progress.
                </p>
              </div>
              <Button variant="outline" onClick={openCreateBudgetSheet}>
                <Plus className="size-4 shrink-0" aria-hidden />
                Add budget
              </Button>
            </CardContent>
          </Card>
        ) : (
          budgets.map((budget) => (
            <BudgetRow
              key={budget.id}
              budget={budget}
              banks={banks}
              onEdit={setEditingBudget}
              onDelete={openDeleteBudgetDialog}
            />
          ))
        )}
      </div>

      <CreateBudgetSheet
        open={createSheetOpen}
        onOpenChange={setCreateSheetOpen}
        banks={banks}
        categorySets={categorySets}
      />
      <DeleteBudgetDialog
        open={deleteDialogOpen}
        onOpenChange={(next) => {
          setDeleteDialogOpen(next);
          if (!next) setDeleteBudgetId(null);
        }}
        budgetId={deleteBudgetId}
      />
      <UpdateBudgetSheet
        open={editingBudget !== null}
        onOpenChange={(next) => {
          if (!next) setEditingBudget(null);
        }}
        budget={editingBudget}
      />
    </div>
  );
}
