"use client";

import { createContext, useContext } from "react";

export const MobileMenuContext = createContext<() => void>(() => undefined);

export function useOpenMobileMenu() {
  return useContext(MobileMenuContext);
}
