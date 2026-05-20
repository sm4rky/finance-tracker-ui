"use client";

import { useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { PlusIcon } from "lucide-react";

import { LinkBankDialog } from "@/components/link-bank-dialog";
import { LinkedBankRow } from "@/components/linked-bank-row";
import { Accordion } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { TabsContent } from "@/components/ui/tabs";
import { listPlaidConnections } from "@/lib/api/plaid";

export type ProfileAccountsTabProps = {
  active: boolean;
};

export function ProfileAccountsTab({ active }: ProfileAccountsTabProps) {
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);

  const {
    data: plaidConnections,
    isPending,
    isError,
    error,
  } = useQuery({
    queryKey: ["list-plaid-connections"],
    queryFn: listPlaidConnections,
    enabled: active,
  });

  const allBanks = useMemo(() => plaidConnections ?? [], [plaidConnections]);

  const activeBanks = useMemo(
    () =>
      allBanks.filter(
        (bank) => bank.status === "active" || bank.status === "relink_required",
      ),
    [allBanks],
  );

  const handleLinked = () => {
    queryClient.invalidateQueries({
      queryKey: ["list-plaid-connections"],
    });
  };

  const errorMessage =
    isError && error instanceof Error
      ? error.message
      : isError
        ? "Could not load linked accounts."
        : null;

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

      {!active ? null : isPending ? (
        <div className="space-y-2">
          <Skeleton className="h-14 w-full rounded-lg" />
          <Skeleton className="h-14 w-full rounded-lg" />
        </div>
      ) : errorMessage ? (
        <p className="text-sm text-destructive">{errorMessage}</p>
      ) : activeBanks.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          No linked accounts yet. Use Link Bank to connect a bank.
        </p>
      ) : (
        <Accordion type="multiple" className="flex flex-col gap-3">
          {activeBanks.map((bank) => (
            <LinkedBankRow key={bank.id} bank={bank} />
          ))}
        </Accordion>
      )}

      <LinkBankDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onLinked={handleLinked}
      />
    </TabsContent>
  );
}