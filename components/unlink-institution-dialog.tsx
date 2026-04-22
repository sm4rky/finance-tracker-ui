"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2Icon, Unlink } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { LinkedBankResponse } from "@/interface/plaid";
import { unlinkPlaidInstitution } from "@/lib/api/plaid";
import { cn } from "@/lib/utils";

export type UnlinkInstitutionDialogProps = {
  bank: LinkedBankResponse;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function UnlinkInstitutionDialog({
  bank,
  open,
  onOpenChange,
}: UnlinkInstitutionDialogProps) {
  const queryClient = useQueryClient();
  const [deleteTransactions, setDeleteTransactions] = useState(false);

  const institutionName = bank.institutionName?.trim() || "This institution";

  const unlinkMutation = useMutation({
    mutationFn: () =>
      unlinkPlaidInstitution({
        linkedBankId: bank.id,
        deleteTransactions,
      }),
    onSuccess: async (data) => {
      await queryClient.invalidateQueries({ queryKey: ["list-plaid-connections"] });
      await queryClient.invalidateQueries({ queryKey: ["query-transaction-list"] });
      await queryClient.invalidateQueries({ queryKey: ["get-recent-transactions"] });
      toast.success(
        data.transactionsRemoved > 0
          ? `Institution unlinked. ${data.transactionsRemoved} transaction(s) removed.`
          : "Institution unlinked.",
      );
      onOpenChange(false);
      setDeleteTransactions(false);
    },
    onError: (e: Error) => {
      toast.error(e.message || "Could not unlink institution.");
    },
  });

  const handleOpenChange = (next: boolean) => {
    if (!unlinkMutation.isPending) {
      onOpenChange(next);
      if (!next) setDeleteTransactions(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-lg gap-0 p-0">
        <div className="px-6 pt-5 pb-1">
          <DialogHeader className="space-y-1.5 text-left">
            <DialogTitle className="text-base leading-tight">
              Unlink {institutionName}
            </DialogTitle>
            <DialogDescription className="text-sm leading-snug">
              Disconnects this bank from Plaid. Choose to keep or delete imported transactions.
            </DialogDescription>
          </DialogHeader>
        </div>

        <fieldset
          className="space-y-2 px-6 pb-4 pt-2"
          disabled={unlinkMutation.isPending}
        >
          <legend className="sr-only">Imported transactions</legend>

          <label
            className={cn(
              "flex cursor-pointer items-start gap-3 rounded-lg border px-3 py-2.5 transition-colors",
              !deleteTransactions
                ? "border-primary/50 bg-primary/5"
                : "border-border hover:bg-muted/50",
            )}
          >
            <input
              type="radio"
              name="unlink-tx-mode"
              className="mt-0.5 shrink-0"
              checked={!deleteTransactions}
              onChange={() => setDeleteTransactions(false)}
            />
            <span className="min-w-0">
              <span className="block text-sm font-medium text-foreground leading-tight">
                Keep transactions
              </span>
              <span className="mt-0.5 block text-xs leading-snug text-muted-foreground">
                Transactions are kept and marked as no longer tied to this institution. You can edit
                them later.
              </span>
            </span>
          </label>

          <label
            className={cn(
              "flex cursor-pointer items-start gap-3 rounded-lg border px-3 py-2.5 transition-colors",
              deleteTransactions
                ? "border-destructive/40 bg-destructive/5"
                : "border-border hover:bg-muted/50",
            )}
          >
            <input
              type="radio"
              name="unlink-tx-mode"
              className="mt-0.5 shrink-0"
              checked={deleteTransactions}
              onChange={() => setDeleteTransactions(true)}
            />
            <span className="min-w-0">
              <span className="block text-sm font-medium leading-tight text-destructive">
                Delete transactions
              </span>
              <span className="mt-0.5 block text-xs leading-snug text-muted-foreground">
                Permanently removes all transactions tied to this institution. You won&apos;t be able
                to restore them.
              </span>
            </span>
          </label>
        </fieldset>

        <DialogFooter className="mx-0 mb-0 gap-2 rounded-b-xl border-t bg-muted/30 px-6 py-3 sm:justify-end">
          <Button
            type="button"
            variant="outline"
            disabled={unlinkMutation.isPending}
            onClick={() => handleOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            disabled={unlinkMutation.isPending}
            onClick={() => unlinkMutation.mutate()}
          >
            {unlinkMutation.isPending ? (
              <Loader2Icon className="size-4 animate-spin" aria-hidden />
            ) : (
              <Unlink className="size-4" aria-hidden />
            )}
            Unlink
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
