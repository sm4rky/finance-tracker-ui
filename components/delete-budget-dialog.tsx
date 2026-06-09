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
import { deleteProfileBudget } from "@/lib/api/profile-budget";

export type DeleteBudgetDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  budgetId: string | null;
};

export function DeleteBudgetDialog({
  open,
  onOpenChange,
  budgetId,
}: DeleteBudgetDialogProps) {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: () => {
      if (!budgetId) throw new Error("Missing budget id");
      return deleteProfileBudget(budgetId);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["profile-budgets"],
      });
      toast.success("Budget removed.");
      onOpenChange(false);
    },
    onError: (e: Error) => {
      toast.error(e.message || "Could not delete budget.");
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
          <DialogTitle>Delete this budget?</DialogTitle>
          <DialogDescription>
            This cannot be undone. The budget and its related data will be
            permanently removed.
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
            disabled={busy || !budgetId}
            onClick={() => mutation.mutate()}
          >
            {busy ? (
              <Loader2Icon
                className="size-4 shrink-0 animate-spin"
                aria-hidden
              />
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
