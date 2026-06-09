"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2Icon } from "lucide-react";
import { toast } from "sonner";

import {
  CreateBudgetForm,
  formValuesToCreateBudgetRequest,
} from "@/components/create-budget-form";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import type { LinkedBankResponse } from "@/interface/plaid";
import type { ProfileCustomCategorySetResponse } from "@/interface/profile-custom-category";
import { createProfileBudget } from "@/lib/api/profile-budget";
import type { CreateBudgetFormValues } from "@/schema/create-budget.schema";

export type CreateBudgetSheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  banks: LinkedBankResponse[];
  categorySets: ProfileCustomCategorySetResponse[];
};

export function CreateBudgetSheet({
  open,
  onOpenChange,
  banks,
  categorySets,
}: CreateBudgetSheetProps) {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (values: CreateBudgetFormValues) =>
      createProfileBudget(formValuesToCreateBudgetRequest(values)),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["profile-budgets"],
      });
      toast.success("Budget added.");
      onOpenChange(false);
    },
  });

  const busy = mutation.isPending;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        showCloseButton={!busy}
        className="flex w-full flex-col gap-0 overflow-hidden p-0 sm:max-w-xl"
      >
        <SheetHeader className="border-b border-border/60 px-4 py-4 text-left">
          <SheetTitle>Add budget</SheetTitle>
          <SheetDescription>
            Create a budget from categories and linked accounts.
          </SheetDescription>
        </SheetHeader>

        <CreateBudgetForm
          open={open}
          banks={banks}
          categorySets={categorySets}
          busy={busy}
          error={mutation.error}
          onSubmit={(values) => mutation.mutate(values)}
        />

        <SheetFooter className="mt-auto flex-row gap-2 border-t border-border/60 bg-muted/30 px-4 py-3">
          <Button
            type="button"
            variant="outline"
            className="flex-1"
            disabled={busy}
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            type="button"
            className="flex-1 gap-2"
            disabled={busy}
            onClick={() => {
              const form = document.getElementById("create-budget-form");
              if (form instanceof HTMLFormElement) {
                form.requestSubmit();
              }
            }}
          >
            {busy ? (
              <>
                <Loader2Icon className="size-4 animate-spin" aria-hidden />
                Saving...
              </>
            ) : (
              "Add"
            )}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
