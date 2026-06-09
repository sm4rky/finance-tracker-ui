"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2Icon } from "lucide-react";
import { toast } from "sonner";

import {
  formValuesToUpdateBudgetRequest,
  UpdateBudgetForm,
} from "@/components/update-budget-form";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import type { ProfileBudgetResponse } from "@/interface/profile-budget";
import { updateProfileBudget } from "@/lib/api/profile-budget";
import type { UpdateBudgetFormValues } from "@/schema/update-budget.schema";

export type UpdateBudgetSheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  budget: ProfileBudgetResponse | null;
};

export function UpdateBudgetSheet({
  open,
  onOpenChange,
  budget,
}: UpdateBudgetSheetProps) {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (values: UpdateBudgetFormValues) => {
      if (!budget?.id) throw new Error("Missing budget id");
      return updateProfileBudget(
        budget.id,
        formValuesToUpdateBudgetRequest(values, budget),
      );
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["profile-budgets"],
      });
      toast.success("Budget updated.");
      onOpenChange(false);
    },
  });

  const busy = mutation.isPending;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        showCloseButton={!busy}
        className="flex w-full flex-col gap-0 overflow-hidden p-0 sm:max-w-md"
      >
        <SheetHeader className="border-b border-border/60 px-4 py-4 text-left">
          <SheetTitle>Edit budget</SheetTitle>
          <SheetDescription>
            Update this budget&apos;s name and limit amount.
          </SheetDescription>
        </SheetHeader>

        <UpdateBudgetForm
          open={open}
          budget={budget}
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
              const form = document.getElementById("update-budget-form");
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
              "Save"
            )}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
