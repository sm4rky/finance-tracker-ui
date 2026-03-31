"use client";

import { useEffect, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Link2, Loader2Icon } from "lucide-react";
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
import type { LinkedBankResponse } from "@/interface/plaid";
import {
  createPlaidLinkToken,
  exchangePlaidPublicToken,
} from "@/lib/api/plaid";

type PlaidSession = {
  linkToken: string;
  linkSessionId: string;
};

export type RelinkInstitutionDialogProps = {
  bank: LinkedBankResponse;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function RelinkInstitutionDialog({
  bank,
  open,
  onOpenChange,
}: RelinkInstitutionDialogProps) {
  const queryClient = useQueryClient();

  const [plaidSession, setPlaidSession] = useState<PlaidSession | null>(null);
  const [awaitingPlaidOpen, setAwaitingPlaidOpen] = useState(false);

  const institutionName = bank.institutionName?.trim() || "Linked institution";

  const resetPlaidState = () => {
    setPlaidSession(null);
    setAwaitingPlaidOpen(false);
  };

  const invalidateConnections = async () => {
    await queryClient.invalidateQueries({
      queryKey: ["list-plaid-connections"],
    });
    await queryClient.invalidateQueries({
      queryKey: ["query-transaction-list"],
    });
  };

  const linkTokenMutation = useMutation({
    mutationFn: () =>
      createPlaidLinkToken({
        intent: "relink",
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
          : "Could not start reconnection. Please try again.",
      );
      setAwaitingPlaidOpen(false);
    },
  });

  const exchangeMutation = useMutation({
    mutationFn: exchangePlaidPublicToken,
    onSuccess: async () => {
      await invalidateConnections();
      toast.success("Institution reconnected. Sync is available again.");
      onOpenChange(false);
      resetPlaidState();
      linkTokenMutation.reset();
      exchangeMutation.reset();
    },
    onError: (e) => {
      toast.error(
        e instanceof Error ? e.message : "Could not finish reconnection.",
      );
      resetPlaidState();
      linkTokenMutation.reset();
    },
  });

  const resetAll = () => {
    resetPlaidState();
    linkTokenMutation.reset();
    exchangeMutation.reset();
  };

  useEffect(() => {
    if (open) return;
    resetAll();
  }, [open]);

  const handlePlaidExit = () => {
    resetPlaidState();
    linkTokenMutation.reset();
  };

  const handlePublicToken = (
    publicToken: string,
    linkSessionId: string,
  ) => {
    setPlaidSession(null);
    setAwaitingPlaidOpen(false);
    exchangeMutation.mutate({ publicToken, linkSessionId });
  };

  const handleContinue = () => {
    if (busy) return;
    linkTokenMutation.mutate();
  };

  const busy =
    linkTokenMutation.isPending ||
    exchangeMutation.isPending ||
    awaitingPlaidOpen ||
    plaidSession != null;

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

        <div className="flex flex-col gap-4 px-6 pb-6 pt-6">
          <DialogHeader className="gap-2 p-0 text-left">
            <DialogTitle className="text-lg font-semibold tracking-tight">
              Reconnect {institutionName}
            </DialogTitle>
            <DialogDescription className="text-sm leading-relaxed">
              Sign in again at your bank to resume syncing for this connection.
            </DialogDescription>
          </DialogHeader>

          <Button
            type="button"
            className="h-10 w-full gap-2"
            disabled={busy}
            onClick={handleContinue}
          >
            {busy ? (
              <>
                <Loader2Icon className="size-4 animate-spin" aria-hidden />
                Please wait…
              </>
            ) : (
              <>
                <Link2 className="size-4 shrink-0" aria-hidden />
                Reconnect with Plaid
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
