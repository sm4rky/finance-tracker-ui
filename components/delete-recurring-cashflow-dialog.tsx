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
import { deleteProfileRecurringCashflow } from "@/lib/api/profile-recurring-cashflow";

export type DeleteRecurringCashflowDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  recurringId: string | null;
};

export function DeleteRecurringCashflowDialog({
  open,
  onOpenChange,
  recurringId,
}: DeleteRecurringCashflowDialogProps) {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: () => {
      if (!recurringId) throw new Error("Missing subscription id");
      return deleteProfileRecurringCashflow(recurringId);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["profile-recurring-cashflows"],
      });
      await queryClient.invalidateQueries({
        queryKey: ["profile-recurring-calendar-cashflows"],
      });
      toast.success("Subscription removed.");
      onOpenChange(false);
    },
    onError: (e: Error) => {
      toast.error(e.message || "Could not delete subscription.");
    },
  });

  const busy = mutation.isPending;

  const handleOpenChange = (next: boolean) => {
    if (!busy) onOpenChange(next);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md" showCloseButton={!busy}>
        <DialogHeader className="space-y-2 text-left">
          <DialogTitle>Delete this subscription?</DialogTitle>
          <DialogDescription>
            This cannot be undone. The recurring cashflow will be permanently
            removed.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            disabled={busy}
            onClick={() => handleOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            className="gap-2"
            disabled={busy || !recurringId}
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
