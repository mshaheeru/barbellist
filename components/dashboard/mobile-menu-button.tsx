"use client";

import { Menu } from "lucide-react";
import { useOpenMobileMenu } from "@/components/mobile-menu-context";
import styles from "./mobile-menu-button.module.css";

export function MobileMenuButton() {
  const openMobileMenu = useOpenMobileMenu();

  return (
    <button
      type="button"
      onClick={openMobileMenu}
      className={styles.menuBtn}
      aria-label="Open menu"
    >
      <Menu size={20} />
    </button>
  );
}
