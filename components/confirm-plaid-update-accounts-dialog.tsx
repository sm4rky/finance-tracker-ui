"use client";

import { startTransition, useEffect, useMemo, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Building2, Loader2Icon } from "lucide-react";
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
import type { LinkedBankAccountResponse } from "@/interface/plaid";
import { confirmPlaidUpdateAccounts } from "@/lib/api/plaid";
import { cn } from "@/lib/utils";

export type ConfirmPlaidUpdateAccountsDialogProps = {
  linkedBankId: string;
  institutionName: string;
  pendingDeselected: LinkedBankAccountResponse[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

function formatSubtype(subtype: string | null | undefined): string | null {
  const s = subtype?.trim();
  if (!s) return null;
  return s
    .replace(/_/g, " ")
    .split(/\s+/)
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(" ");
}

function accountNameAndMask(a: LinkedBankAccountResponse): string {
  const name = a.officialName?.trim() || a.accountName?.trim() || "Account";
  const mask = a.mask?.trim();
  return mask ? `${name} · ${mask}` : name;
}

function accountSummaryForAria(
  institutionLabel: string,
  a: LinkedBankAccountResponse,
): string {
  const bank = institutionLabel.trim() || "Bank";
  const sub = formatSubtype(a.subtype);
  const who = accountNameAndMask(a);
  if (sub) return `${bank}, ${sub}, ${who}`;
  return `${bank}, ${who}`;
}

export function ConfirmPlaidUpdateAccountsDialog({
  linkedBankId,
  institutionName,
  pendingDeselected,
  open,
  onOpenChange,
}: ConfirmPlaidUpdateAccountsDialogProps) {
  const queryClient = useQueryClient();
  const [deleteByPlaidId, setDeleteByPlaidId] = useState<
    Record<string, boolean>
  >({});

  const invalidateLinkedData = async () => {
    await queryClient.invalidateQueries({
      queryKey: ["list-plaid-connections"],
    });
    await queryClient.invalidateQueries({
      queryKey: ["query-transaction-list"],
    });
    await queryClient.invalidateQueries({
      queryKey: ["get-recent-transactions"],
    });
  };

  const mutation = useMutation({
    mutationFn: () =>
      confirmPlaidUpdateAccounts(linkedBankId, {
        decisions: pendingDeselected.map((a) => ({
          plaidAccountId: a.plaidAccountId,
          deleteTransactions: deleteByPlaidId[a.plaidAccountId] === true,
        })),
      }),
    onSuccess: async () => {
      await invalidateLinkedData();
      toast.success("Choices saved. Your data is up to date.");
      onOpenChange(false);
    },
    onError: (e) => {
      toast.error(e instanceof Error ? e.message : "Could not apply choices.");
    },
  });

  useEffect(() => {
    if (!open) {
      startTransition(() => {
        setDeleteByPlaidId({});
      });
      return;
    }
    const initial: Record<string, boolean> = {};
    for (const a of pendingDeselected) {
      initial[a.plaidAccountId] = false;
    }
    startTransition(() => {
      setDeleteByPlaidId(initial);
    });
  }, [open, pendingDeselected]);

  const busy = mutation.isPending;

  const statusLine = useMemo(() => {
    if (mutation.isPending) return "Applying your choices…";
    return null;
  }, [mutation.isPending]);

  const hasAccounts = pendingDeselected.length > 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="flex max-h-[min(90vh,40rem)] flex-col gap-0 overflow-hidden p-0 sm:max-w-md"
        showCloseButton={!busy}
      >
        <div className="flex min-h-0 flex-1 flex-col gap-5 overflow-hidden p-6 pb-4">
          <DialogHeader className="items-center gap-3 space-y-0 text-center sm:text-center">
            <div
              className="flex size-16 items-center justify-center rounded-full bg-muted"
              aria-hidden
            >
              <Building2 className="size-8 text-foreground" strokeWidth={1.5} />
            </div>
            <div className="space-y-2">
              <DialogTitle className="text-lg font-semibold tracking-tight">
                Accounts no longer linked
              </DialogTitle>
              <DialogDescription className="text-sm leading-relaxed">
                For each account you removed from this bank connection, choose
                whether to keep or remove imported transactions.
              </DialogDescription>
            </div>
          </DialogHeader>

          {statusLine ? (
            <div
              className="flex shrink-0 items-center gap-3 rounded-lg border border-border bg-muted/40 px-3 py-3 text-sm text-foreground"
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

          {hasAccounts ? (
            <ul
              className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto overscroll-contain pr-1 [scrollbar-gutter:stable]"
              role="list"
            >
              {pendingDeselected.map((a) => {
                const group = `opt-out-${a.plaidAccountId}`;
                const removeTx = deleteByPlaidId[a.plaidAccountId] === true;
                const subtypeLabel = formatSubtype(a.subtype);
                return (
                  <li
                    key={a.plaidAccountId}
                    className="shrink-0 rounded-lg border border-border bg-muted/30 p-3"
                  >
                    <div className="min-w-0 space-y-1">
                      <p className="text-sm font-medium leading-snug text-foreground">
                        <span className="wrap-break-word">
                          {institutionName}
                        </span>
                        {subtypeLabel ? (
                          <>
                            <span className="text-muted-foreground"> · </span>
                            <span className="wrap-break-word text-muted-foreground">
                              {subtypeLabel}
                            </span>
                          </>
                        ) : null}
                      </p>
                      <p className="text-sm leading-snug wrap-break-word text-foreground/90">
                        {accountNameAndMask(a)}
                      </p>
                    </div>
                    <fieldset className="mt-3 space-y-2" disabled={busy}>
                      <legend className="sr-only">
                        Imported transactions for{" "}
                        {accountSummaryForAria(institutionName, a)}
                      </legend>
                      <label
                        className={cn(
                          "flex cursor-pointer items-start gap-3 rounded-lg border px-3 py-2.5 transition-colors",
                          !removeTx
                            ? "border-primary/50 bg-primary/5"
                            : "border-border hover:bg-muted/50",
                        )}
                      >
                        <input
                          type="radio"
                          name={group}
                          className="mt-0.5 shrink-0"
                          checked={!removeTx}
                          onChange={() =>
                            setDeleteByPlaidId((prev) => ({
                              ...prev,
                              [a.plaidAccountId]: false,
                            }))
                          }
                        />
                        <span className="min-w-0 text-left">
                          <span className="block text-sm font-medium leading-tight text-foreground">
                            Keep transactions
                          </span>
                          <span className="mt-0.5 block text-xs leading-snug text-muted-foreground">
                            Imported history stays in the app. You can edit
                            entries later.
                          </span>
                        </span>
                      </label>
                      <label
                        className={cn(
                          "flex cursor-pointer items-start gap-3 rounded-lg border px-3 py-2.5 transition-colors",
                          removeTx
                            ? "border-destructive/40 bg-destructive/5"
                            : "border-border hover:bg-muted/50",
                        )}
                      >
                        <input
                          type="radio"
                          name={group}
                          className="mt-0.5 shrink-0"
                          checked={removeTx}
                          onChange={() =>
                            setDeleteByPlaidId((prev) => ({
                              ...prev,
                              [a.plaidAccountId]: true,
                            }))
                          }
                        />
                        <span className="min-w-0 text-left">
                          <span className="block text-sm font-medium leading-tight text-destructive">
                            Delete transactions
                          </span>
                          <span className="mt-0.5 block text-xs leading-snug text-muted-foreground">
                            Permanently removes imported transactions for this
                            account. You won&apos;t be able to restore them.
                          </span>
                        </span>
                      </label>
                    </fieldset>
                  </li>
                );
              })}
            </ul>
          ) : (
            <p className="text-sm text-muted-foreground">
              No accounts pending confirmation.
            </p>
          )}
        </div>

        <DialogFooter className="mx-0 mb-0 flex-col gap-2 rounded-b-xl border-t bg-muted/30 px-6 py-3 sm:flex-col sm:justify-stretch">
          <Button
            type="button"
            className="h-10 w-full gap-2 rounded-lg border-0 bg-foreground font-medium text-background hover:bg-foreground/90"
            disabled={busy || !hasAccounts}
            onClick={() => mutation.mutate()}
          >
            {mutation.isPending ? (
              <>
                <Loader2Icon className="size-4 animate-spin" aria-hidden />
                Applying…
              </>
            ) : (
              "Apply and finish"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
