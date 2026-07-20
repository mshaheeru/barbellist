# WhatsApp Reminder Cron (Prompt 14)

Reminder schedule is stored on each gym as JSONB under `gyms.settings.reminders`:

```json
{
  "days_before_due": 3,
  "on_due_date": true,
  "overdue_every_days": 3,
  "max_per_due": 5
}
```

Defaults match [`DEFAULT_REMINDER_SCHEDULE`](../app/actions/whatsapp.ts). Update via `updateReminderSchedule` (Settings UI in Prompt 12).

## Manual triggers (available now)

- Fees page: per-row **Send Reminder** and **Send Reminders to Selected**
- Dashboard Fee Alerts: per-row **Remind** and **Send All Overdue Reminders**
- Member profile payments: **Send Receipt**

These call `sendFeeReminder`, `sendBulkReminders`, and `sendPaymentReceipt` in `app/actions/whatsapp.ts`.

## Edge Function cron (Prompt 14)

Deploy a Supabase Edge Function on a daily schedule (e.g. `0 4 * * *` gym-local or UTC) that for each active gym:

1. Read `gym.settings.reminders` (fall back to defaults above).
2. Select matching `fee_dues` where `reminder_count < max_per_due` and status is not `paid` / `waived`:
   - **Before due:** `due_date = today + days_before_due`, status in (`pending`, `partial`)
   - **On due date:** if `on_due_date`, `due_date = today`
   - **Overdue cadence:** status `overdue`, and either never reminded or `last_reminder_sent_at` older than `overdue_every_days`
3. Call `sendFeeReminder(fee_due_id)` (or `sendBulkReminders`) with a **1 second delay** between sends.
4. Skip members with no WhatsApp/phone; log rows in `reminders`.

### Env required on the server / Edge runtime

- `WHATSAPP_API_TOKEN`
- `WHATSAPP_PHONE_NUMBER_ID`

Templates must be approved in Meta Business Manager with these names:

- `fee_reminder_before_due`
- `fee_reminder_overdue`
- `payment_receipt`
- `welcome_new_member`

Until the cron is deployed, owners rely on the manual buttons above.
