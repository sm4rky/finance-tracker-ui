"use client";

import { useMemo } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2Icon } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  formValuesToSaveTransactionRequest,
  SaveTransactionForm,
} from "@/components/save-transaction-form";
import type { LinkedBankResponse } from "@/interface/plaid";
import type { TransactionResponse } from "@/interface/transaction";
import { createTransaction, updateTransaction } from "@/lib/api/transaction";
import type { SaveTransactionFormValues } from "@/schema/save-transaction.schema";

export type SaveTransactionSheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: "create" | "edit";
  transaction: TransactionResponse | null;
  banks: LinkedBankResponse[];
};

export function SaveTransactionSheet({
  open,
  onOpenChange,
  mode,
  transaction,
  banks,
}: SaveTransactionSheetProps) {
  const queryClient = useQueryClient();

  const optedOutLinkedAccountId = useMemo(() => {
    const id = transaction?.linkedBankAccount?.id ?? null;
    if (!id) return null;
    const seen = new Set<string>();
    for (const bank of banks) {
      for (const account of bank.accounts) {
        seen.add(account.id);
      }
    }
    return seen.has(id) ? null : id;
  }, [banks, transaction?.linkedBankAccount?.id]);

  const mutation = useMutation({
    mutationFn: async (values: SaveTransactionFormValues) => {
      const payload = formValuesToSaveTransactionRequest(values, {
        includeClearLogo: mode === "edit",
        optedOutLinkedAccountId,
      });
      if (mode === "create") {
        return createTransaction(payload);
      }
      if (!transaction?.id) throw new Error("Missing transaction id");
      return updateTransaction(transaction.id, payload);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["query-transaction-list"],
      });
      await queryClient.invalidateQueries({
        queryKey: ["get-recent-transactions"],
      });
      toast.success(
        mode === "create" ? "Transaction added." : "Transaction updated.",
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
            {mode === "create" ? "Add transaction" : "Edit transaction"}
          </SheetTitle>
          <SheetDescription>
            {mode === "create"
              ? "Create a manual entry. Amount is the magnitude; choose expense or income."
              : "Update this transaction. Changes sync to your data."}
          </SheetDescription>
        </SheetHeader>

        <SaveTransactionForm
          open={open}
          mode={mode}
          transaction={transaction}
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
            form="tx-save-form"
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
