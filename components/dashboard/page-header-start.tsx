"use client";

import type { ReactNode } from "react";
import { MobileMenuButton } from "@/components/dashboard/mobile-menu-button";
import styles from "./page-header-start.module.css";

type PageHeaderStartProps = {
  title: ReactNode;
  subtitle?: ReactNode;
  titleClassName?: string;
  subtitleClassName?: string;
};

/** Title block with mobile hamburger — use as left side of page headers. */
export function PageHeaderStart({
  title,
  subtitle,
  titleClassName,
  subtitleClassName,
}: PageHeaderStartProps) {
  return (
    <div className={styles.start}>
      <MobileMenuButton />
      <div className={styles.text}>
        <h1 className={titleClassName}>{title}</h1>
        {subtitle != null ? (
          <p className={subtitleClassName}>{subtitle}</p>
        ) : null}
      </div>
    </div>
  );
}
