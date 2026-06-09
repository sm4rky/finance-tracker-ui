"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2Icon } from "lucide-react";
import { toast } from "sonner";

import {
  formValuesToSaveRecurringCashflowRequest,
  SaveRecurringCashflowForm,
} from "@/components/save-recurring-cashflow-form";
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
import type { ProfileRecurringCashflowResponse } from "@/interface/profile-recurring-cashflow";
import {
  createProfileRecurringCashflow,
  updateProfileRecurringCashflow,
} from "@/lib/api/profile-recurring-cashflow";
import type { SaveRecurringCashflowFormValues } from "@/schema/save-recurring-cashflow.schema";

export type SaveRecurringCashflowSheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: "create" | "edit";
  recurring: ProfileRecurringCashflowResponse | null;
  banks: LinkedBankResponse[];
};

export function SaveRecurringCashflowSheet({
  open,
  onOpenChange,
  mode,
  recurring,
  banks,
}: SaveRecurringCashflowSheetProps) {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (values: SaveRecurringCashflowFormValues) => {
      const payload = formValuesToSaveRecurringCashflowRequest(values);
      if (mode === "create") {
        return createProfileRecurringCashflow(payload);
      }
      if (!recurring?.id) throw new Error("Missing recurring cashflow id");
      return updateProfileRecurringCashflow(recurring.id, payload);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["profile-recurring-cashflows"],
      });
      await queryClient.invalidateQueries({
        queryKey: ["profile-recurring-calendar-cashflows"],
      });
      toast.success(
        mode === "create" ? "Subscription added." : "Subscription updated.",
      );
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
          <SheetTitle>
            {mode === "create" ? "Add subscription" : "Edit subscription"}
          </SheetTitle>
          <SheetDescription>
            {mode === "create"
              ? "Track a recurring inflow or outflow linked to an account (optional)."
              : "Update this recurring cashflow."}
          </SheetDescription>
        </SheetHeader>

        <SaveRecurringCashflowForm
          open={open}
          mode={mode}
          recurring={recurring}
          banks={banks}
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
            type="submit"
            form="recurring-cashflow-save-form"
            className="flex-1 gap-2"
            disabled={busy}
          >
            {busy ? (
              <>
                <Loader2Icon className="size-4 animate-spin" aria-hidden />
                Saving…
              </>
            ) : mode === "create" ? (
              "Add"
            ) : (
              "Save"
            )}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
