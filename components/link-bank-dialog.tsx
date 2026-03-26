"use client";

import { useEffect, useRef, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import {
  Banknote,
  Building2,
  Loader2Icon,
  Lock,
  ShieldCheck,
  type LucideIcon,
} from "lucide-react";
import { usePlaidLink } from "react-plaid-link";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { createPlaidLinkToken, exchangePlaidPublicToken } from "@/lib/api/plaid";

const PLAID_TERMS_HREF =
  "https://plaid.com/legal/#end-user-terms-of-service";
const PLAID_PRIVACY_HREF =
  "https://plaid.com/legal/#end-user-privacy-policy";

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
  const [linkToken, setLinkToken] = useState<string | null>(null);
  const [awaitingPlaidOpen, setAwaitingPlaidOpen] = useState(false);

  const linkSessionIdRef = useRef<string | null>(null);
  const shouldAutoOpenRef = useRef(false);

  const resetPlaidState = () => {
    setLinkToken(null);
    linkSessionIdRef.current = null;
    shouldAutoOpenRef.current = false;
    setAwaitingPlaidOpen(false);
  };

  const exchangeMutation = useMutation({
    mutationFn: (input: { publicToken: string; linkSessionId: string }) =>
      exchangePlaidPublicToken(input),
    onSuccess: () => {
      toast.success("Bank linked.");
      onOpenChange(false);
      onLinked?.();
      resetPlaidState();
    },
    onError: (e) => {
      toast.error(
        e instanceof Error ? e.message : "Could not finish linking.",
      );
      resetPlaidState();
    },
  });

  const linkTokenMutation = useMutation({
    mutationFn: () => createPlaidLinkToken({ intent: "connect" }),
    onSuccess: (data) => {
      linkSessionIdRef.current = data.linkSessionId;
      shouldAutoOpenRef.current = true;
      setAwaitingPlaidOpen(true);
      setLinkToken(data.linkToken);
    },
    onError: (e) => {
      toast.error(
        e instanceof Error ? e.message : "Could not start linking.",
      );
      shouldAutoOpenRef.current = false;
      setAwaitingPlaidOpen(false);
    },
  });

  const { open: openPlaid, ready } = usePlaidLink({
    token: linkToken,
    onSuccess: (publicToken) => {
      const linkSessionId = linkSessionIdRef.current;

      if (!linkSessionId) {
        toast.error("Session expired. Please try again.");
        return;
      }

      exchangeMutation.mutate({ publicToken, linkSessionId });
    },
    onExit: () => {
      resetPlaidState();
      linkTokenMutation.reset();
    },
  });

  useEffect(() => {
    if (!linkToken || !ready || !shouldAutoOpenRef.current) return;

    shouldAutoOpenRef.current = false;
    openPlaid();
    setAwaitingPlaidOpen(false);
  }, [linkToken, ready, openPlaid]);

  useEffect(() => {
    if (open) return;

    resetPlaidState();
    linkTokenMutation.reset();
    exchangeMutation.reset();
  }, [open]);

  const handleOpenPlaid = () => {
    if (
      linkTokenMutation.isPending ||
      exchangeMutation.isPending ||
      awaitingPlaidOpen
    ) {
      return;
    }

    linkTokenMutation.mutate();
  };

  const busy =
    linkTokenMutation.isPending ||
    exchangeMutation.isPending ||
    awaitingPlaidOpen;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="gap-0 overflow-hidden p-0 sm:max-w-md"
        showCloseButton={!busy}
      >
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
                Please wait…
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