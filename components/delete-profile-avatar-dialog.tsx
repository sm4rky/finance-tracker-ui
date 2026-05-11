"use client";

import { useMutation } from "@tanstack/react-query";
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
import type { UserProfile } from "@/interface/user";
import { updateProfileAvatar } from "@/lib/api/users";
import { removeAvatarObject } from "@/lib/supabase/avatar";
import { useAuthStore } from "@/stores/auth-session";

export type DeleteProfileAvatarDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string | null;
  avatarUrl: string | null;
  onDeleted?: (profile: UserProfile) => void;
  onDeletingChange?: (isDeleting: boolean) => void;
};

export function DeleteProfileAvatarDialog({
  open,
  onOpenChange,
  userId,
  avatarUrl: avatarStoragePath,
  onDeleted,
  onDeletingChange,
}: DeleteProfileAvatarDialogProps) {
  const mutation = useMutation({
    mutationFn: async () => {
      if (!userId || !avatarStoragePath?.trim()) {
        throw new Error("Missing profile photo.");
      }
      const path = avatarStoragePath.trim();
      const nextProfile = await updateProfileAvatar(null);
      await removeAvatarObject(path);
      return nextProfile;
    },
    onMutate: () => {
      onDeletingChange?.(true);
    },
    onSuccess: (nextProfile) => {
      useAuthStore.getState().setUserProfile(nextProfile);
      toast.success("Profile photo removed.");
      onDeleted?.(nextProfile);
      onOpenChange(false);
    },
    onError: (e: Error) => {
      toast.error(e.message || "Could not remove profile photo.");
    },
    onSettled: () => {
      onDeletingChange?.(false);
    },
  });

  const isDeleting = mutation.isPending;
  const canDelete = Boolean(userId && avatarStoragePath?.trim());

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!isDeleting) onOpenChange(next);
      }}
    >
      <DialogContent className="max-w-lg gap-0 p-0" showCloseButton={!isDeleting}>
        <div className="px-6 pt-5 pb-4">
          <DialogHeader className="space-y-1.5 text-left">
            <DialogTitle className="text-base leading-tight">
              Delete profile photo?
            </DialogTitle>
            <DialogDescription className="text-sm leading-snug">
              This removes your current photo from your profile. You can upload
              a new one anytime.
            </DialogDescription>
          </DialogHeader>
        </div>

        <DialogFooter className="mx-0 mb-0 gap-2 rounded-b-xl border-t bg-muted/30 px-6 py-3 sm:justify-end">
          <Button
            type="button"
            variant="outline"
            disabled={isDeleting}
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            className="gap-2"
            disabled={isDeleting || !canDelete}
            onClick={() => mutation.mutate()}
          >
            {isDeleting ? (
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
