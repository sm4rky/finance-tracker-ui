export interface ProfileNotificationPreferenceResponse {
  id: string;
  profileId: string;
  emailEnabled: boolean;
  dueReminderEnabled: boolean;
  reminderDaysBefore: number;
  budgetAlertEnabled: boolean;
  budgetAlertThreshold: number;
  monthlyStatementEnabled: boolean;
  createdAt: string;
  updatedAt: string;
}
