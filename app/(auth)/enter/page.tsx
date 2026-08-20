import type { Metadata } from "next";
import { Suspense } from "react";
import EnterClient from "./enter-client";

export const metadata: Metadata = {
  title: "Entering",
  robots: { index: false, follow: false },
};

export default function EnterPage() {
  return (
    <Suspense
      fallback={
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "#06140e",
          }}
          aria-busy="true"
          aria-label="Signing you in"
        />
      }
    >
      <EnterClient />
    </Suspense>
  );
}
