"use client";

import { useEffect, useMemo, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Building2, Loader2Icon, SlidersHorizontal } from "lucide-react";
import { toast } from "sonner";

import { PlaidLinkSession } from "@/components/plaid-link-session";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { LinkedBankAccountResponse, LinkedBankResponse } from "@/interface/plaid";
import {
  createPlaidLinkToken,
  exchangePlaidPublicToken,
} from "@/lib/api/plaid";

type PlaidSession = {
  linkToken: string;
  linkSessionId: string;
};

export type AccountOptOutPayload = {
  linkedBankId: string;
  pendingDeselectedAccounts: LinkedBankAccountResponse[];
};

export type UpdateLinkedAccountsDialogProps = {
  bank: LinkedBankResponse;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAccountOptOutRequired?: (payload: AccountOptOutPayload) => void;
};

export function UpdateLinkedAccountsDialog({
  bank,
  open,
  onOpenChange,
  onAccountOptOutRequired,
}: UpdateLinkedAccountsDialogProps) {
  const queryClient = useQueryClient();
  const [plaidSession, setPlaidSession] = useState<PlaidSession | null>(null);
  const [awaitingPlaidOpen, setAwaitingPlaidOpen] = useState(false);

  const institutionName = bank.institutionName?.trim() || "Linked institution";

  const resetLocal = () => {
    setPlaidSession(null);
    setAwaitingPlaidOpen(false);
  };

  const invalidateLinkedData = async () => {
    await queryClient.invalidateQueries({ queryKey: ["list-plaid-connections"] });
    await queryClient.invalidateQueries({ queryKey: ["query-transaction-list"] });
    await queryClient.invalidateQueries({ queryKey: ["get-recent-transactions"] });
    await queryClient.invalidateQueries({ queryKey: ["profile-recurring-cashflows"] });
    await queryClient.invalidateQueries({ queryKey: ["profile-recurring-calendar-cashflows"] });
  };

  const linkTokenMutation = useMutation({
    mutationFn: () =>
      createPlaidLinkToken({
        intent: "update",
        linkedBankId: bank.id,
      }),
    onSuccess: (data) => {
      setAwaitingPlaidOpen(true);
      setPlaidSession({
        linkToken: data.linkToken,
        linkSessionId: data.linkSessionId,
      });
    },
    onError: (e) => {
      toast.error(
        e instanceof Error
          ? e.message
          : "Could not start account update. Please try again.",
      );
      setAwaitingPlaidOpen(false);
    },
  });

  const exchangeMutation = useMutation({
    mutationFn: exchangePlaidPublicToken,
    onSuccess: async (data) => {
      await invalidateLinkedData();
      if (
        data.requiresAccountOptOutHandling &&
        data.pendingDeselectedAccounts?.length
      ) {
        toast.message("Choose what to do with removed accounts.", {
          description:
            "You stopped sharing one or more accounts. Confirm in the next step.",
        });
        onAccountOptOutRequired?.({
          linkedBankId: data.linkedBankId,
          pendingDeselectedAccounts: data.pendingDeselectedAccounts,
        });
        onOpenChange(false);
        resetLocal();
        linkTokenMutation.reset();
        exchangeMutation.reset();
      } else {
        toast.success("Accounts updated. Transactions were synced.");
        onOpenChange(false);
        resetLocal();
        linkTokenMutation.reset();
        exchangeMutation.reset();
      }
    },
    onError: (e) => {
      toast.error(
        e instanceof Error ? e.message : "Could not finish updating accounts.",
      );
      resetLocal();
      linkTokenMutation.reset();
    },
  });

  useEffect(() => {
    if (open) return;
    resetLocal();
    linkTokenMutation.reset();
    exchangeMutation.reset();
  }, [open]);

  const handlePlaidExit = () => {
    setPlaidSession(null);
    linkTokenMutation.reset();
  };

  const handlePublicToken = (publicToken: string, linkSessionId: string) => {
    setPlaidSession(null);
    setAwaitingPlaidOpen(false);
    exchangeMutation.mutate({ publicToken, linkSessionId });
  };

  const handleStart = () => {
    if (busy) return;
    linkTokenMutation.mutate();
  };

  const busy =
    linkTokenMutation.isPending ||
    exchangeMutation.isPending ||
    awaitingPlaidOpen;

  const statusLine = useMemo(() => {
    if (exchangeMutation.isPending) return "Updating connection…";
    return null;
  }, [exchangeMutation.isPending]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="gap-0 overflow-hidden p-0 sm:max-w-md"
        showCloseButton={!busy}
      >
        {plaidSession ? (
          <PlaidLinkSession
            key={plaidSession.linkSessionId}
            token={plaidSession.linkToken}
            linkSessionId={plaidSession.linkSessionId}
            onPublicToken={handlePublicToken}
            onExit={handlePlaidExit}
            onOpened={() => setAwaitingPlaidOpen(false)}
          />
        ) : null}

        {!plaidSession ? (
          <>
            <div className="flex flex-col gap-5 p-6 pb-4">
              <DialogHeader className="items-center gap-3 space-y-0 text-center sm:text-center">
                <div
                  className="flex size-16 items-center justify-center rounded-full bg-muted"
                  aria-hidden
                >
                  <Building2
                    className="size-8 text-foreground"
                    strokeWidth={1.5}
                  />
                </div>
                <div className="space-y-2">
                  <DialogTitle className="text-lg font-semibold tracking-tight">
                    Manage linked accounts
                  </DialogTitle>
                  <DialogDescription className="text-sm leading-relaxed">
                    Change which accounts you share from{" "}
                    <span className="font-medium text-foreground">
                      {institutionName}
                    </span>{" "}
                    (same connection; opens Plaid).
                  </DialogDescription>
                </div>
              </DialogHeader>

              {statusLine ? (
                <div
                  className="flex items-center gap-3 rounded-lg border border-border bg-muted/40 px-3 py-3 text-sm text-foreground"
                  role="status"
                  aria-live="polite"
                >
                  <Loader2Icon
                    className="size-5 shrink-0 animate-spin text-muted-foreground"
                    aria-hidden
                  />
                  <span>{statusLine}</span>
                </div>
              ) : null}
            </div>

            <div className="shrink-0 bg-muted/30 px-6 py-4">
              <Button
                type="button"
                className="h-10 w-full gap-2 rounded-lg border-0 bg-foreground font-medium text-background hover:bg-foreground/90"
                disabled={busy}
                onClick={handleStart}
              >
                {busy ? (
                  <>
                    <Loader2Icon className="size-4 animate-spin" aria-hidden />
                    {exchangeMutation.isPending
                      ? "Working…"
                      : "Please wait…"}
                  </>
                ) : (
                  <>
                    <SlidersHorizontal className="size-4 shrink-0" aria-hidden />
                    Continue with Plaid
                  </>
                )}
              </Button>
            </div>
          </>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
