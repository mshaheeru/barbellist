/** Destinations allowed after the post-login Ignition Sequence. */
export const ENTER_DESTINATION_ALLOWLIST = ["/dashboard"] as const;

export type EnterDestination = (typeof ENTER_DESTINATION_ALLOWLIST)[number];

export function isAllowedEnterDestination(
  value: string | null | undefined,
): value is EnterDestination {
  return (
    typeof value === "string" &&
    (ENTER_DESTINATION_ALLOWLIST as readonly string[]).includes(value)
  );
}

/**
 * Resolve a safe post-ignition destination from a query param.
 * Falls back to /dashboard when missing or not allowlisted.
 */
export function resolveEnterDestination(
  value: string | null | undefined,
): EnterDestination {
  return isAllowedEnterDestination(value) ? value : "/dashboard";
}

/**
 * Build the `/enter` URL for destinations that should play the Ignition Sequence.
 * Returns the destination unchanged when ignition should be skipped
 * (e.g. /select-branch).
 */
export function buildEnterUrl(destination: string): string {
  if (!isAllowedEnterDestination(destination)) {
    return destination;
  }
  return `/enter?to=${encodeURIComponent(destination)}`;
}
