"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { faFileInvoiceDollar } from "@fortawesome/free-solid-svg-icons";
import { ConnectButton } from "@zama-season3/shared";
import { FaIcon } from "@/components/FaIcon";

export function SiteHeader() {
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();
  const onApp = pathname.startsWith("/app");

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fx-site-header ${scrolled || onApp ? "fx-site-header-scrolled" : !onApp ? "fx-site-header-hero" : ""}`}
    >
      <div className="fx-container fx-site-header-row">
        <Link href="/" className="fx-brand">
          <span className="fx-brand-mark">
            <FaIcon icon={faFileInvoiceDollar} size="sm" />
          </span>
          <span className="fx-brand-name">Factor</span>
        </Link>
        <nav className="fx-nav" aria-label="Sections">
          <Link href="/#how">How it works</Link>
          <Link href="/#privacy">Encryption</Link>
          <Link href="/app" className={onApp ? "fx-nav-active" : undefined}>
            App
          </Link>
        </nav>
        <div className="fx-header-actions">
          {onApp ? (
            <Link href="/" className="fx-btn fx-btn-outline fx-btn-sm">
              Overview
            </Link>
          ) : (
            <Link href="/app" className="fx-btn fx-btn-primary fx-btn-sm">
              Open App
            </Link>
          )}
          <ConnectButton />
        </div>
      </div>
    </header>
  );
}
