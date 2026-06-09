"use client";

import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Building2, PlusIcon } from "lucide-react";

import { LinkBankDialog } from "@/components/link-bank-dialog";
import { LinkedBankRow } from "@/components/linked-bank-row";
import { Accordion } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { TabsContent } from "@/components/ui/tabs";
import { useLinkedBanks } from "@/hooks/use-linked-banks";

export type ProfileAccountsTabProps = {
  active: boolean;
};

export function ProfileAccountsTab({ active }: ProfileAccountsTabProps) {
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);

  const { banks, isLoading, isError } = useLinkedBanks();

  const handleLinked = () => {
    queryClient.invalidateQueries({
      queryKey: ["list-plaid-connections"],
    });
  };

  return (
    <TabsContent
      value="accounts"
      className="flex flex-col gap-4 text-sm text-muted-foreground focus-visible:outline-none"
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
        <div className="min-w-0 space-y-1">
          <h3 className="font-heading text-base font-semibold text-foreground sm:text-lg">
            Linked Accounts
          </h3>
          <p className="text-xs text-muted-foreground sm:text-sm">
            Manage your connected financial institutions
          </p>
        </div>

        <Button
          type="button"
          className="w-full shrink-0 sm:w-auto"
          onClick={() => setDialogOpen(true)}
        >
          <PlusIcon className="size-4" aria-hidden />
          Link Bank
        </Button>
      </div>

      {!active ? null : (
        <div className="flex flex-col gap-3">
          {isLoading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <div
                key={`linked-bank-sk-${i}`}
                className="relative flex min-h-18 flex-wrap items-start gap-2 rounded-xl border border-border bg-background/50 px-3 py-3 pr-20 sm:min-h-0 sm:flex-nowrap sm:items-center sm:gap-3 sm:px-4 sm:pr-24"
              >
                <div className="flex min-w-0 flex-1 basis-full items-center gap-3 sm:basis-auto">
                  <Skeleton className="size-10 shrink-0 rounded-lg" />
                  <div className="min-w-0 flex-1 space-y-2">
                    <Skeleton className="h-4 w-44 max-w-full" />
                    <Skeleton className="h-3 w-32 max-w-full" />
                  </div>
                </div>

                <div className="flex w-full items-center justify-between gap-2 pl-13 sm:w-auto sm:flex-1 sm:justify-end sm:pl-0">
                  <Skeleton className="h-6 w-20 rounded-full" />
                  <div className="space-y-1 text-right">
                    <Skeleton className="ml-auto h-3 w-20" />
                    <Skeleton className="ml-auto h-4 w-24" />
                  </div>
                </div>

                <div className="absolute inset-y-0 right-10 flex items-center sm:right-12">
                  <Skeleton className="size-8 rounded-lg" />
                </div>
                <Skeleton className="absolute right-3 top-1/2 size-4 -translate-y-1/2" />
              </div>
            ))
          ) : isError ? (
            <p className="text-sm text-destructive">
              Could not load linked accounts.
            </p>
          ) : banks.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center gap-3 py-10 text-center">
                <Building2
                  className="size-10 text-muted-foreground"
                  aria-hidden
                />
                <div>
                  <div className="font-medium text-foreground">
                    No linked accounts yet
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Connect a bank to start syncing accounts and balances.
                  </p>
                </div>
                <Button variant="outline" onClick={() => setDialogOpen(true)}>
                  <PlusIcon className="size-4 shrink-0" aria-hidden />
                  Link Bank
                </Button>
              </CardContent>
            </Card>
          ) : (
            <Accordion type="multiple" className="flex flex-col gap-3">
              {banks.map((bank) => (
                <LinkedBankRow key={bank.id} bank={bank} />
              ))}
            </Accordion>
          )}
        </div>
      )}

      <LinkBankDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onLinked={handleLinked}
      />
    </TabsContent>
  );
}
