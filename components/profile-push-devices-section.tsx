"use client";

import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Loader2,
  Monitor,
  MoreVertical,
  Smartphone,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import type { PushSubscriptionResponse } from "@/interface/push-subscription";
import {
  deleteMyPushSubscription,
  listMyPushSubscriptions,
} from "@/lib/api/push-subscriptions";
import {
  formatPushSubscriptionDateTime,
  getPushSubscriptionDeviceType,
  getPushSubscriptionDeviceLabel,
} from "@/lib/push-subscription-device-label";
import { getCurrentPushSubscription } from "@/lib/pwa/push-subscription";

export function ProfilePushDevicesSection() {
  const queryClient = useQueryClient();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const {
    data: devices,
    isPending,
    isError,
    error,
  } = useQuery({
    queryKey: ["push-subscriptions", "me"],
    queryFn: listMyPushSubscriptions,
  });

  const deleteMutation = useMutation({
    mutationFn: async (device: PushSubscriptionResponse) => {
      const subscription = await getCurrentPushSubscription();
      if (subscription?.endpoint === device.endpoint) {
        await subscription.unsubscribe();
      }

      await deleteMyPushSubscription(device.id);
    },
    onMutate: async (device) => {
      setDeletingId(device.id);
    },
    onSuccess: () => {
      toast.success("Push subscription record removed.");
    },
    onError: (e) => {
      toast.error(
        e instanceof Error
          ? e.message
          : "Could not remove push subscription record.",
      );
    },
    onSettled: () => {
      setDeletingId(null);
      void queryClient.invalidateQueries({
        queryKey: ["push-subscriptions", "me"],
      });
    },
  });

  const deviceList = useMemo(() => devices ?? [], [devices]);

  return (
    <>
      <div className="flex min-w-0 items-center gap-2 text-sm font-medium">
        <Smartphone
          className="size-4 shrink-0 text-muted-foreground"
          aria-hidden
        />
        <span className="min-w-0">Registered Devices</span>
      </div>

      <p className="mt-2 text-xs text-muted-foreground sm:text-sm">
        Browsers and devices that can receive push notifications for your
        account.
      </p>

      <div className="mt-4 space-y-3 sm:mt-5">
        {isPending ? (
          <div className="space-y-3">
            <Skeleton className="h-16 w-full rounded-xl" />
            <Skeleton className="h-16 w-full rounded-xl" />
          </div>
        ) : null}

        {isError ? (
          <p className="text-sm text-destructive" role="alert">
            {error instanceof Error
              ? error.message
              : "Could not load registered devices."}
          </p>
        ) : null}

        {!isPending && !isError && deviceList.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No registered devices yet.
          </p>
        ) : null}

        {!isPending && !isError
          ? deviceList.map((device) => {
              const deviceLabel = getPushSubscriptionDeviceLabel(
                device.userAgent,
              );
              const deviceType = getPushSubscriptionDeviceType(
                device.userAgent,
              );
              const DeviceIcon =
                deviceType === "desktop" ? Monitor : Smartphone;
              const deleting = deletingId === device.id;

              return (
                <article
                  key={device.id}
                  className="rounded-xl border border-border bg-background/50 px-3 py-3 sm:px-4"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-muted"
                      aria-hidden
                    >
                      <DeviceIcon className="size-5 text-muted-foreground" />
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="truncate font-semibold leading-snug text-foreground">
                        {deviceLabel}
                      </p>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        Updated at:{" "}
                        {formatPushSubscriptionDateTime(device.updatedAt)}
                      </p>
                    </div>

                    <div className="flex shrink-0 items-center">
                      <DropdownMenu>
                        <DropdownMenuTrigger
                          type="button"
                          className="inline-flex size-8 shrink-0 items-center justify-center rounded-lg text-muted-foreground outline-none transition-colors hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50"
                          disabled={deleting}
                          aria-label="Push subscription options"
                        >
                          <MoreVertical className="size-4" />
                        </DropdownMenuTrigger>

                        <DropdownMenuContent align="end" className="min-w-40">
                          <DropdownMenuItem
                            variant="destructive"
                            disabled={deleting}
                            onClick={() => deleteMutation.mutate(device)}
                          >
                            {deleting ? (
                              <Loader2 className="size-4 shrink-0 animate-spin" />
                            ) : (
                              <Trash2 className="size-4" />
                            )}
                            Remove device
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </article>
              );
            })
          : null}
      </div>
    </>
  );
}
