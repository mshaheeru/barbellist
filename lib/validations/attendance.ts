import { z } from "zod";

export const attendanceDateRangeSchema = z.enum(["today", "week", "month"]);
export const attendancePersonFilterSchema = z.enum(["all", "member", "staff"]);
export const checkInMethodSchema = z.enum(["qr", "fingerprint", "manual"]);

export const attendanceFeedFilterSchema = z.object({
  date_range: attendanceDateRangeSchema.default("today"),
  person_filter: attendancePersonFilterSchema.default("all"),
});

export const checkInMemberSchema = z.object({
  member_id: z.string().uuid(),
  method: checkInMethodSchema,
});

export const checkInStaffSchema = z.object({
  staff_id: z.string().uuid(),
  method: checkInMethodSchema,
});

export const checkInByQrTokenSchema = z.object({
  token: z.string().min(10),
});

export const kioskSearchSchema = z.object({
  query: z.string().min(1).max(100),
});

export type AttendanceDateRange = z.infer<typeof attendanceDateRangeSchema>;
export type AttendancePersonFilter = z.infer<
  typeof attendancePersonFilterSchema
>;
