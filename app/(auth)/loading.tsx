export default function AuthLoading() {
  return (
    <div
      className="flex min-h-screen items-center justify-center bg-[#F5F2EC] p-6"
      aria-busy="true"
      aria-label="Loading"
    >
      <div className="w-full max-w-md space-y-4">
        <div className="h-8 w-40 animate-pulse rounded bg-[#E8E4DC]" />
        <div className="h-48 w-full animate-pulse rounded-lg bg-[#E8E4DC]" />
        <div className="h-10 w-full animate-pulse rounded bg-[#E8E4DC]" />
      </div>
    </div>
  );
}
