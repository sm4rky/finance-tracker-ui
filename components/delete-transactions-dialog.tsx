"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2Icon, Trash2 } from "lucide-react";
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
import { deleteTransactions } from "@/lib/api/transactions";

export type DeleteTransactionsDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  transactionIds: string[];
  onDeleted?: () => void;
};

export function DeleteTransactionsDialog({
  open,
  onOpenChange,
  transactionIds,
  onDeleted,
}: DeleteTransactionsDialogProps) {
  const queryClient = useQueryClient();
  const count = transactionIds.length;

  const title =
    count === 1
      ? "Delete this transaction?"
      : `Delete ${count} transactions?`;

  const description =
    count === 1
      ? "This cannot be undone."
      : "This cannot be undone. Selected transactions will be permanently removed.";

  const mutation = useMutation({
    mutationFn: () => deleteTransactions(transactionIds),
    onSuccess: async ({ deletedCount }) => {
      await queryClient.invalidateQueries({
        queryKey: ["query-transaction-list"],
      });
      await queryClient.invalidateQueries({
        queryKey: ["get-recent-transactions"],
      });

      toast.success(
        deletedCount === 1
          ? "Successfully deleted 1 transaction."
          : `Successfully deleted ${deletedCount} transactions.`,
      );

      onDeleted?.();
      onOpenChange(false);
    },
    onError: (error: Error) => {
      toast.error(error.message || "Could not delete transactions.");
    },
  });

  const busy = mutation.isPending;

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!busy) onOpenChange(next);
      }}
    >
      <DialogContent className="max-w-lg gap-0 p-0" showCloseButton={!busy}>
        <div className="px-6 pt-5 pb-4">
          <DialogHeader className="space-y-1.5 text-left">
            <DialogTitle className="text-base leading-tight">
              {title}
            </DialogTitle>
            <DialogDescription className="text-sm leading-snug">
              {description}
            </DialogDescription>
          </DialogHeader>
        </div>

        <DialogFooter className="mx-0 mb-0 gap-2 rounded-b-xl border-t bg-muted/30 px-6 py-3 sm:justify-end">
          <Button
            type="button"
            variant="outline"
            disabled={busy}
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>

          <Button
            type="button"
            variant="destructive"
            className="gap-2"
            disabled={busy || count === 0}
            onClick={() => mutation.mutate()}
          >
            {busy ? (
              <Loader2Icon className="size-4 shrink-0 animate-spin" aria-hidden />
            ) : (
              <Trash2 className="size-4 shrink-0" aria-hidden />
            )}
            Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}