import type { ReactNode } from "react";

/**
 * Dark body on /home from first paint (avoids cream flash before client hydrate).
 */
export default function HomeLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <style>{`body { background: #0A0A0A !important; }`}</style>
      {children}
    </>
  );
}
