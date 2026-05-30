"use client";

import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Bell } from "lucide-react";
import { toast } from "sonner";

import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import type { ProfileNotificationPreferenceResponse } from "@/interface/notification-preferences";
import type { PushSubscriptionResponse } from "@/interface/push-subscription";
import {
  getMyNotificationPreferences,
  patchBudgetAlertEnabled,
  patchBudgetAlertThreshold,
  patchDueReminderEnabled,
  patchEmailEnabled,
  patchMonthlyStatementEnabled,
  patchReminderDaysBefore,
} from "@/lib/api/notification-preferences";
import {
  deleteMyPushSubscription,
  listMyPushSubscriptions,
  upsertMyPushSubscription,
} from "@/lib/api/push-subscriptions";
import {
  getCurrentPushSubscription,
  pushSubscriptionToUpsertRequest,
  subscribeCurrentDeviceToPushNotifications,
  unsubscribeCurrentPushSubscription,
} from "@/lib/pwa/push-subscription";
import { useNotificationPreferenceStore } from "@/stores/notification-preference";

const REMINDER_DAY_OPTIONS = [1, 2, 3, 5, 7] as const;

export function ProfileNotificationPreferencesSection() {
  const queryClient = useQueryClient();
  const setNotificationPreferences = useNotificationPreferenceStore(
    (s) => s.setPreferences,
  );
  const updateNotificationPreferences = useNotificationPreferenceStore(
    (s) => s.updatePreferences,
  );
  const [thresholdDraft, setThresholdDraft] = useState<string | null>(null);
  const [currentPushEndpoint, setCurrentPushEndpoint] = useState<string | null>(
    null,
  );
  const [isCheckingPushSubscription, setIsCheckingPushSubscription] =
    useState(true);
  const [isUpdatingPushSubscription, setIsUpdatingPushSubscription] =
    useState(false);

  const {
    data: preferences,
    isPending,
    isError,
    error,
  } = useQuery({
    queryKey: ["notification-preferences", "me"],
    queryFn: getMyNotificationPreferences,
  });

  const { data: pushDevices, isPending: arePushDevicesPending } = useQuery({
    queryKey: ["push-subscriptions", "me"],
    queryFn: listMyPushSubscriptions,
  });

  useEffect(() => {
    if (preferences) {
      setNotificationPreferences(preferences);
    }
  }, [preferences, setNotificationPreferences]);

  useEffect(() => {
    if (isError) {
      setNotificationPreferences(null);
    }
  }, [isError, setNotificationPreferences]);

  useEffect(() => {
    let cancelled = false;

    async function checkCurrentPushSubscription() {
      try {
        const subscription = await getCurrentPushSubscription();
        if (!cancelled) {
          setCurrentPushEndpoint(subscription?.endpoint ?? null);
        }
      } catch {
        if (!cancelled) {
          setCurrentPushEndpoint(null);
        }
      } finally {
        if (!cancelled) {
          setIsCheckingPushSubscription(false);
        }
      }
    }

    void checkCurrentPushSubscription();

    return () => {
      cancelled = true;
    };
  }, []);

  const emailEnabledMutation = useMutation({
    mutationFn: patchEmailEnabled,
    onMutate: async (enabled) => {
      await queryClient.cancelQueries({
        queryKey: ["notification-preferences", "me"],
      });
      const previous =
        queryClient.getQueryData<ProfileNotificationPreferenceResponse>([
          "notification-preferences",
          "me",
        ]);

      if (previous) {
        const optimisticPreferences = {
          ...previous,
          emailEnabled: enabled,
        };
        queryClient.setQueryData(
          ["notification-preferences", "me"],
          optimisticPreferences,
        );
        updateNotificationPreferences(optimisticPreferences);
      }

      return { previous };
    },
    onSuccess: (updated) => {
      queryClient.setQueryData(["notification-preferences", "me"], updated);
      updateNotificationPreferences(updated);
    },
    onError: (e, _enabled, context) => {
      if (context?.previous) {
        queryClient.setQueryData(
          ["notification-preferences", "me"],
          context.previous,
        );
        updateNotificationPreferences(context.previous);
      }
      toast.error(e.message || "Could not update notification preference.");
    },
  });

  const dueReminderEnabledMutation = useMutation({
    mutationFn: patchDueReminderEnabled,
    onMutate: async (enabled) => {
      await queryClient.cancelQueries({
        queryKey: ["notification-preferences", "me"],
      });
      const previous =
        queryClient.getQueryData<ProfileNotificationPreferenceResponse>([
          "notification-preferences",
          "me",
        ]);

      if (previous) {
        const optimisticPreferences = {
          ...previous,
          dueReminderEnabled: enabled,
        };
        queryClient.setQueryData(
          ["notification-preferences", "me"],
          optimisticPreferences,
        );
        updateNotificationPreferences(optimisticPreferences);
      }

      return { previous };
    },
    onSuccess: (updated) => {
      queryClient.setQueryData(["notification-preferences", "me"], updated);
      updateNotificationPreferences(updated);
    },
    onError: (e, _enabled, context) => {
      if (context?.previous) {
        queryClient.setQueryData(
          ["notification-preferences", "me"],
          context.previous,
        );
        updateNotificationPreferences(context.previous);
      }
      toast.error(e.message || "Could not update notification preference.");
    },
  });

  const reminderDaysBeforeMutation = useMutation({
    mutationFn: patchReminderDaysBefore,
    onMutate: async (days) => {
      await queryClient.cancelQueries({
        queryKey: ["notification-preferences", "me"],
      });
      const previous =
        queryClient.getQueryData<ProfileNotificationPreferenceResponse>([
          "notification-preferences",
          "me",
        ]);

      if (previous) {
        const optimisticPreferences = {
          ...previous,
          reminderDaysBefore: days,
        };
        queryClient.setQueryData(
          ["notification-preferences", "me"],
          optimisticPreferences,
        );
        updateNotificationPreferences(optimisticPreferences);
      }

      return { previous };
    },
    onSuccess: (updated) => {
      queryClient.setQueryData(["notification-preferences", "me"], updated);
      updateNotificationPreferences(updated);
    },
    onError: (e, _days, context) => {
      if (context?.previous) {
        queryClient.setQueryData(
          ["notification-preferences", "me"],
          context.previous,
        );
        updateNotificationPreferences(context.previous);
      }
      toast.error(e.message || "Could not update notification preference.");
    },
  });

  const budgetAlertEnabledMutation = useMutation({
    mutationFn: patchBudgetAlertEnabled,
    onMutate: async (enabled) => {
      await queryClient.cancelQueries({
        queryKey: ["notification-preferences", "me"],
      });
      const previous =
        queryClient.getQueryData<ProfileNotificationPreferenceResponse>([
          "notification-preferences",
          "me",
        ]);

      if (previous) {
        const optimisticPreferences = {
          ...previous,
          budgetAlertEnabled: enabled,
        };
        queryClient.setQueryData(
          ["notification-preferences", "me"],
          optimisticPreferences,
        );
        updateNotificationPreferences(optimisticPreferences);
      }

      return { previous };
    },
    onSuccess: (updated) => {
      queryClient.setQueryData(["notification-preferences", "me"], updated);
      updateNotificationPreferences(updated);
    },
    onError: (e, _enabled, context) => {
      if (context?.previous) {
        queryClient.setQueryData(
          ["notification-preferences", "me"],
          context.previous,
        );
        updateNotificationPreferences(context.previous);
      }
      toast.error(e.message || "Could not update notification preference.");
    },
  });

  const budgetAlertThresholdMutation = useMutation({
    mutationFn: patchBudgetAlertThreshold,
    onMutate: async (threshold) => {
      await queryClient.cancelQueries({
        queryKey: ["notification-preferences", "me"],
      });
      const previous =
        queryClient.getQueryData<ProfileNotificationPreferenceResponse>([
          "notification-preferences",
          "me",
        ]);

      if (previous) {
        const optimisticPreferences = {
          ...previous,
          budgetAlertThreshold: threshold,
        };
        queryClient.setQueryData(
          ["notification-preferences", "me"],
          optimisticPreferences,
        );
        updateNotificationPreferences(optimisticPreferences);
      }

      return { previous };
    },
    onSuccess: (updated) => {
      queryClient.setQueryData(["notification-preferences", "me"], updated);
      updateNotificationPreferences(updated);
    },
    onError: (e, _threshold, context) => {
      if (context?.previous) {
        queryClient.setQueryData(
          ["notification-preferences", "me"],
          context.previous,
        );
        updateNotificationPreferences(context.previous);
      }
      toast.error(e.message || "Could not update notification preference.");
    },
  });

  const monthlyStatementEnabledMutation = useMutation({
    mutationFn: patchMonthlyStatementEnabled,
    onMutate: async (enabled) => {
      await queryClient.cancelQueries({
        queryKey: ["notification-preferences", "me"],
      });
      const previous =
        queryClient.getQueryData<ProfileNotificationPreferenceResponse>([
          "notification-preferences",
          "me",
        ]);

      if (previous) {
        const optimisticPreferences = {
          ...previous,
          monthlyStatementEnabled: enabled,
        };
        queryClient.setQueryData(
          ["notification-preferences", "me"],
          optimisticPreferences,
        );
        updateNotificationPreferences(optimisticPreferences);
      }

      return { previous };
    },
    onSuccess: (updated) => {
      queryClient.setQueryData(["notification-preferences", "me"], updated);
      updateNotificationPreferences(updated);
    },
    onError: (e, _enabled, context) => {
      if (context?.previous) {
        queryClient.setQueryData(
          ["notification-preferences", "me"],
          context.previous,
        );
        updateNotificationPreferences(context.previous);
      }
      toast.error(e.message || "Could not update notification preference.");
    },
  });

  function handleEmailNotificationsToggle(enabled: boolean) {
    emailEnabledMutation.mutate(enabled);
  }

  function handleDueRemindersToggle(enabled: boolean) {
    dueReminderEnabledMutation.mutate(enabled);
  }

  function handleBudgetAlertsToggle(enabled: boolean) {
    budgetAlertEnabledMutation.mutate(enabled);
  }

  function handleMonthlyStatementsToggle(enabled: boolean) {
    monthlyStatementEnabledMutation.mutate(enabled);
  }

  function handleReminderDaysChange(days: number) {
    reminderDaysBeforeMutation.mutate(days);
  }

  function commitThresholdDraft() {
    if (!preferences || thresholdDraft === null) return;

    const parsed = Number.parseInt(thresholdDraft, 10);
    if (
      Number.isNaN(parsed) ||
      parsed <= 0 ||
      parsed > 100 ||
      parsed === preferences.budgetAlertThreshold
    ) {
      setThresholdDraft(null);
      return;
    }

    budgetAlertThresholdMutation.mutate(parsed);
    setThresholdDraft(null);
  }

  const thresholdValue =
    thresholdDraft ?? String(preferences?.budgetAlertThreshold ?? 80);

  const currentPushDevice = pushDevices?.find(
    (device) => device.endpoint === currentPushEndpoint,
  );

  const isCurrentDevicePushEnabled = Boolean(
    currentPushEndpoint && currentPushDevice,
  );

  async function handlePushNotificationsToggle(enabled: boolean) {
    setIsUpdatingPushSubscription(true);

    try {
      if (enabled) {
        const subscription = await subscribeCurrentDeviceToPushNotifications();
        const updated = await upsertMyPushSubscription(
          pushSubscriptionToUpsertRequest(subscription),
        );

        setCurrentPushEndpoint(subscription.endpoint);
        queryClient.setQueryData<PushSubscriptionResponse[]>(
          ["push-subscriptions", "me"],
          (current) => {
            const list = current ?? [];
            const next = list.map((device) =>
              device.id === updated.id || device.endpoint === updated.endpoint
                ? updated
                : device,
            );
            return list.some(
              (device) =>
                device.id === updated.id ||
                device.endpoint === updated.endpoint,
            )
              ? next
              : [updated, ...next];
          },
        );
        toast.success("Push notifications enabled for this device.");
      } else {
        const subscription = await unsubscribeCurrentPushSubscription();
        const endpoint = subscription?.endpoint ?? currentPushEndpoint;
        const device = pushDevices?.find((item) => item.endpoint === endpoint);

        setCurrentPushEndpoint(null);

        if (device) {
          await deleteMyPushSubscription(device.id);
          queryClient.setQueryData<PushSubscriptionResponse[]>(
            ["push-subscriptions", "me"],
            (current) => current?.filter((item) => item.id !== device.id) ?? [],
          );
        }

        toast.success("Push notifications disabled for this device.");
      }

      void queryClient.invalidateQueries({
        queryKey: ["push-subscriptions", "me"],
      });
    } catch (e) {
      toast.error(
        e instanceof Error
          ? e.message
          : "Could not update push notification setting.",
      );
      void queryClient.invalidateQueries({
        queryKey: ["push-subscriptions", "me"],
      });
    } finally {
      setIsUpdatingPushSubscription(false);
    }
  }

  return (
    <>
      <div className="flex min-w-0 items-center gap-2 text-sm font-medium">
        <Bell className="size-4 shrink-0 text-muted-foreground" aria-hidden />
        <span className="min-w-0">Notification Settings</span>
      </div>

      <div className="mt-4 space-y-4 sm:mt-5">
        {isPending ? (
          <div className="space-y-4">
            <Skeleton className="h-9 w-full" />
            <Skeleton className="h-9 w-full" />
            <Skeleton className="h-9 w-full" />
          </div>
        ) : null}

        {isError ? (
          <p className="text-sm text-destructive" role="alert">
            {error instanceof Error
              ? error.message
              : "Could not load notification preferences."}
          </p>
        ) : null}

        {preferences ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-4">
              <Label className="min-w-0 text-sm font-medium text-foreground">
                Email notifications
              </Label>
              <Switch
                checked={preferences.emailEnabled}
                disabled={emailEnabledMutation.isPending}
                onCheckedChange={handleEmailNotificationsToggle}
                aria-label="Email notifications"
              />
            </div>

            <div className="flex items-center justify-between gap-4">
              <Label className="min-w-0 text-sm font-medium text-foreground">
                Push notifications
              </Label>
              <Switch
                checked={isCurrentDevicePushEnabled}
                disabled={
                  isCheckingPushSubscription ||
                  isUpdatingPushSubscription ||
                  arePushDevicesPending
                }
                onCheckedChange={(checked) =>
                  void handlePushNotificationsToggle(checked)
                }
                aria-label="Push notifications"
              />
            </div>

            <div className="flex items-center justify-between gap-4">
              <Label className="min-w-0 text-sm font-medium text-foreground">
                Due reminders
              </Label>
              <Switch
                checked={preferences.dueReminderEnabled}
                disabled={dueReminderEnabledMutation.isPending}
                onCheckedChange={handleDueRemindersToggle}
                aria-label="Due reminders"
              />
            </div>

            <div className="flex items-center justify-between gap-4">
              <Label className="min-w-0 text-sm font-medium text-foreground">
                Reminder days before
              </Label>
              <Select
                value={String(preferences.reminderDaysBefore)}
                disabled={
                  !preferences.dueReminderEnabled ||
                  reminderDaysBeforeMutation.isPending
                }
                onValueChange={(value) => {
                  if (value == null) return;
                  const days = Number.parseInt(value, 10);
                  if (!Number.isNaN(days)) {
                    handleReminderDaysChange(days);
                  }
                }}
              >
                <SelectTrigger
                  className="w-full sm:w-36"
                  aria-label="Reminder days before"
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {REMINDER_DAY_OPTIONS.map((days) => (
                    <SelectItem key={days} value={String(days)}>
                      {days} {days === 1 ? "day" : "days"}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between gap-4">
              <Label className="min-w-0 text-sm font-medium text-foreground">
                Budget alerts
              </Label>
              <Switch
                checked={preferences.budgetAlertEnabled}
                disabled={budgetAlertEnabledMutation.isPending}
                onCheckedChange={handleBudgetAlertsToggle}
                aria-label="Budget alerts"
              />
            </div>

            <div className="flex items-center justify-between gap-4">
              <Label className="min-w-0 text-sm font-medium text-foreground">
                Budget alert threshold
              </Label>
              <div className="relative w-full sm:w-36">
                <Input
                  type="number"
                  min={1}
                  max={100}
                  inputMode="numeric"
                  value={thresholdValue}
                  disabled={
                    !preferences.budgetAlertEnabled ||
                    budgetAlertThresholdMutation.isPending
                  }
                  className="pr-8"
                  aria-label="Budget alert threshold"
                  onChange={(e) => setThresholdDraft(e.target.value)}
                  onBlur={commitThresholdDraft}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.currentTarget.blur();
                    }
                  }}
                />
                <span className="pointer-events-none absolute top-1/2 right-2.5 -translate-y-1/2 text-xs text-muted-foreground">
                  %
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between gap-4">
              <Label className="min-w-0 text-sm font-medium text-foreground">
                Monthly statements
              </Label>
              <Switch
                checked={preferences.monthlyStatementEnabled}
                disabled={monthlyStatementEnabledMutation.isPending}
                onCheckedChange={handleMonthlyStatementsToggle}
                aria-label="Monthly statements"
              />
            </div>
          </div>
        ) : null}
      </div>
    </>
  );
}
