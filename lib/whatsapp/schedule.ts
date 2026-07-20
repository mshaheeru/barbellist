export type ReminderScheduleSettings = {
  days_before_due: number;
  on_due_date: boolean;
  overdue_every_days: number;
  max_per_due: number;
};

export const DEFAULT_REMINDER_SCHEDULE: ReminderScheduleSettings = {
  days_before_due: 3,
  on_due_date: true,
  overdue_every_days: 3,
  max_per_due: 5,
};

export type BulkReminderFilter =
  | "overdue"
  | "due_soon"
  | { ids: string[] };
