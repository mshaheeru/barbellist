import { Logo } from "@/components/brand/logo";

export default function KioskLoading() {
  return (
    <div
      className="flex min-h-screen items-center justify-center bg-[#0F1410] p-6"
      aria-busy="true"
      aria-label="Loading"
    >
      <div className="animate-pulse opacity-90">
        <Logo variant="icon" height={56} href={null} />
      </div>
    </div>
  );
}
