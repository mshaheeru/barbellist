import { KioskPageClient } from "@/components/attendance/kiosk/kiosk-page-client";

export const dynamic = "force-dynamic";
export const runtime = "edge";

export default function KioskPage() {
  return <KioskPageClient />;
}
