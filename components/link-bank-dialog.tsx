"use client";

import { useEffect, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Banknote,
  Building2,
  Loader2Icon,
  Lock,
  ShieldCheck,
  type LucideIcon,
} from "lucide-react";
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
import {
  createPlaidLinkToken,
  exchangePlaidPublicToken,
} from "@/lib/api/plaid";

const PLAID_TERMS_HREF =
  "https://plaid.com/legal/#end-user-terms-of-service";
const PLAID_PRIVACY_HREF =
  "https://plaid.com/legal/#end-user-privacy-policy";

type PlaidSession = {
  linkToken: string;
  linkSessionId: string;
};

export type LinkBankDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onLinked?: () => void;
};

export function LinkBankDialog({
  open,
  onOpenChange,
  onLinked,
}: LinkBankDialogProps) {
  const queryClient = useQueryClient();

  const [plaidSession, setPlaidSession] = useState<PlaidSession | null>(null);
  const [awaitingPlaidOpen, setAwaitingPlaidOpen] = useState(false);

  const resetPlaidState = () => {
    setPlaidSession(null);
    setAwaitingPlaidOpen(false);
  };

  const invalidateLinkedData = async () => {
    await queryClient.invalidateQueries({
      queryKey: ["query-transaction-list"],
    });
    await queryClient.invalidateQueries({
      queryKey: ["list-plaid-connections"],
    });
  };

  const linkTokenMutation = useMutation({
    mutationFn: () => createPlaidLinkToken({ intent: "connect" }),
    onSuccess: (data) => {
      setAwaitingPlaidOpen(true);
      setPlaidSession({
        linkToken: data.linkToken,
        linkSessionId: data.linkSessionId,
      });
    },
    onError: (e) => {
      toast.error(
        e instanceof Error ? e.message : "Could not start linking.",
      );
      setAwaitingPlaidOpen(false);
    },
  });

  const exchangeMutation = useMutation({
    mutationFn: exchangePlaidPublicToken,
    onSuccess: async () => {
      await invalidateLinkedData();
      toast.success(
        "Bank linked. Your transactions were synced when you connected.",
      );
      onOpenChange(false);
      resetPlaidState();
      linkTokenMutation.reset();
      exchangeMutation.reset();
      onLinked?.();
    },
    onError: (e) => {
      toast.error(
        e instanceof Error ? e.message : "Could not finish linking.",
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

  const handleOpenPlaid = () => {
    if (busy) return;
    linkTokenMutation.mutate();
  };

  const busy =
    linkTokenMutation.isPending ||
    exchangeMutation.isPending ||
    awaitingPlaidOpen;

  const statusLine = exchangeMutation.isPending
    ? "Finishing bank link…"
    : null;

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

        <div className="flex flex-col gap-5 p-6 pb-4">
          <DialogHeader className="items-center gap-3 space-y-0 text-center sm:text-center">
            <div
              className="flex size-16 items-center justify-center rounded-full bg-muted"
              aria-hidden
            >
              <Building2 className="size-8 text-foreground" strokeWidth={1.5} />
            </div>

            <div className="space-y-2">
              <DialogTitle className="text-lg font-semibold tracking-tight">
                Link a Bank Account
              </DialogTitle>
              <DialogDescription className="text-sm leading-relaxed">
                Securely connect your bank account to track your finances
                automatically.
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

          <ul className="flex flex-col gap-2" role="list">
            <FeatureRow
              icon={Lock}
              title="Bank-level encryption"
              description="Your data is protected with 256-bit encryption"
            />
            <FeatureRow
              icon={ShieldCheck}
              title="Read-only access"
              description="We can only view your transactions, never move money"
            />
            <FeatureRow
              icon={Banknote}
              title="Credentials never stored"
              description="We use Plaid, a secure third-party service"
            />
          </ul>
        </div>

        <div className="flex flex-col gap-3 bg-muted/30 px-6 py-4">
          <Button
            type="button"
            className="h-10 w-full gap-2 rounded-lg border-0 bg-foreground font-medium text-background hover:bg-foreground/90"
            disabled={busy}
            onClick={handleOpenPlaid}
          >
            {busy ? (
              <>
                <Loader2Icon className="size-4 animate-spin" aria-hidden />
                {exchangeMutation.isPending ? "Working…" : "Please wait…"}
              </>
            ) : (
              <>
                <Building2 className="size-4" aria-hidden />
                Connect with Plaid
              </>
            )}
          </Button>

          <p className="text-center text-[11px] leading-relaxed text-muted-foreground">
            By connecting, you agree to Plaid&apos;s{" "}
            <a
              href={PLAID_TERMS_HREF}
              target="_blank"
              rel="noopener noreferrer"
              className="text-foreground underline underline-offset-2 hover:text-foreground/80"
            >
              Terms of Service
            </a>{" "}
            and{" "}
            <a
              href={PLAID_PRIVACY_HREF}
              target="_blank"
              rel="noopener noreferrer"
              className="text-foreground underline underline-offset-2 hover:text-foreground/80"
            >
              Privacy Policy
            </a>
            .
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function FeatureRow({
  icon: Icon,
  title,
  description,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
}) {
  return (
    <li className="flex gap-3 rounded-lg bg-muted/60 p-3 dark:bg-muted/40">
      <div
        className="flex size-10 shrink-0 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-400"
        aria-hidden
      >
        <Icon className="size-5" strokeWidth={1.75} />
      </div>

      <div className="min-w-0 space-y-0.5 text-left">
        <p className="text-sm font-medium text-foreground">{title}</p>
        <p className="text-xs leading-snug text-muted-foreground">
          {description}
        </p>
      </div>
    </li>
  );
}