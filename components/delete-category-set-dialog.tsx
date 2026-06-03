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
import { deleteProfileCustomCategorySet } from "@/lib/api/profile-custom-category";

export type DeleteCategorySetDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  categorySetId: string | null;
  onDeleted: (categorySetId: string) => void;
};

export function DeleteCategorySetDialog({
  open,
  onOpenChange,
  categorySetId,
  onDeleted,
}: DeleteCategorySetDialogProps) {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: () => {
      if (!categorySetId) throw new Error("Missing category set id");
      return deleteProfileCustomCategorySet(categorySetId);
    },
    onSuccess: async () => {
      if (!categorySetId) return;
      await queryClient.invalidateQueries({
        queryKey: ["profile-custom-category-sets"],
      });
      toast.success("Category set deleted.");
      onDeleted(categorySetId);
      onOpenChange(false);
    },
    onError: (e: Error) => {
      toast.error(e.message || "Could not delete category set.");
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
          <DialogTitle>Delete this category set?</DialogTitle>
          <DialogDescription>
            This cannot be undone. The category set and its custom categories
            will be permanently removed.
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
            disabled={busy || !categorySetId}
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
