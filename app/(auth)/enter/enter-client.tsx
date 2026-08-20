"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { IgnitionSequence } from "@/components/brand/ignition-sequence";
import { resolveEnterDestination } from "@/lib/auth/post-login-enter";
import { createClient } from "@/lib/supabase/client";

export default function EnterClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const navigated = useRef(false);
  const [ready, setReady] = useState(false);
  const [play, setPlay] = useState(false);

  const destination = useMemo(
    () => resolveEnterDestination(searchParams.get("to")),
    [searchParams],
  );

  const go = useCallback(() => {
    if (navigated.current) return;
    navigated.current = true;
    window.location.assign(destination);
  }, [destination]);

  useEffect(() => {
    let cancelled = false;

    async function gate() {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (cancelled) return;

      if (!user) {
        window.location.replace("/login");
        return;
      }

      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

      if (reduced) {
        window.location.assign(destination);
        return;
      }

      router.prefetch(destination);
      setReady(true);
      setPlay(true);
    }

    void gate();
    return () => {
      cancelled = true;
    };
  }, [destination, router]);

  if (!ready || !play) {
    return (
      <div
        style={{
          position: "fixed",
          inset: 0,
          background: "#06140e",
        }}
        aria-busy="true"
        aria-label="Signing you in"
      />
    );
  }

  return <IgnitionSequence onComplete={go} onSkip={go} />;
}
