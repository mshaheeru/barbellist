import { Logo } from "@/components/brand/logo";

export default function AuthLoading() {
  return (
    <div
      className="flex min-h-screen items-center justify-center bg-[#F5F2EC] p-6"
      aria-busy="true"
      aria-label="Loading"
    >
      <div className="animate-pulse">
        <Logo variant="icon" height={56} href={null} />
      </div>
    </div>
  );
}
