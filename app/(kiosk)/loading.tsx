export default function KioskLoading() {
  return (
    <div
      className="flex min-h-screen items-center justify-center bg-[#0F1410] p-6"
      aria-busy="true"
      aria-label="Loading"
    >
      <div className="w-full max-w-lg space-y-4">
        <div className="mx-auto h-10 w-48 animate-pulse rounded bg-[#1C2420]" />
        <div className="h-64 w-full animate-pulse rounded-xl bg-[#1C2420]" />
        <div className="mx-auto h-12 w-56 animate-pulse rounded bg-[#1C2420]" />
      </div>
    </div>
  );
}
