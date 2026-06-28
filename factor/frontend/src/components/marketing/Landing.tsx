"use client";

import Link from "next/link";
import {
  faArrowRight,
  faChartLine,
  faFileInvoiceDollar,
  faHandHoldingDollar,
  faLock,
  faRotate,
} from "@fortawesome/free-solid-svg-icons";
import { SiteHeader } from "./SiteHeader";
import { ScrollReveal } from "./ScrollReveal";
import { FaIcon } from "@/components/FaIcon";

function HeroVideo() {
  return (
    <div className="fx-hero-media" aria-hidden>
      <div className="fx-hero-video-frame">
        <video className="fx-hero-video" autoPlay muted loop playsInline>
          <source src="/media/hero-bg.mp4" type="video/mp4" />
        </video>
      </div>
      <div className="fx-hero-watermark-shield" />
      <div className="fx-hero-overlay" />
    </div>
  );
}

export function LandingPage() {
  const steps = [
    {
      n: "01",
      icon: faFileInvoiceDollar,
      title: "Issue",
      desc: "Mint a receivable with an encrypted face value — only metadata like debtor and due date is public.",
    },
    {
      n: "02",
      icon: faHandHoldingDollar,
      title: "Fund",
      desc: "Investors purchase the invoice with confidential ERC-7984 tokens at an agreed discount.",
    },
    {
      n: "03",
      icon: faRotate,
      title: "Repay",
      desc: "Debtors record encrypted repayments; authorized parties decrypt balances via EIP-712.",
    },
  ];

  return (
    <main className="fx-landing">
      <SiteHeader />
      <section className="fx-hero">
        <HeroVideo />
        <div className="fx-container fx-hero-inner">
          <ScrollReveal>
            <p className="fx-eyebrow">
              <FaIcon icon={faLock} className="fx-eyebrow-icon" size="sm" />
              Confidential receivables
            </p>
            <h1 className="fx-hero-title">Finance invoices without broadcasting your numbers.</h1>
            <p className="fx-hero-lead">
              Factor turns receivables into onchain assets with FHE-protected face values — issue, fund, and repay on
              Sepolia without exposing amounts on Etherscan.
            </p>
            <div className="fx-hero-cta">
              <Link href="/app" className="fx-btn fx-btn-primary fx-btn-lg fx-btn-icon">
                Open Factoring App
                <FaIcon icon={faArrowRight} size="sm" />
              </Link>
              <a href="#how" className="fx-btn fx-btn-outline fx-btn-lg">
                See the flow
              </a>
            </div>
            <ul className="fx-hero-features">
              <li>
                <FaIcon icon={faFileInvoiceDollar} className="fx-hero-feature-icon" />
                <span>
                  <strong>Encrypted face value</strong>
                  <small>euint64 onchain</small>
                </span>
              </li>
              <li>
                <FaIcon icon={faChartLine} className="fx-hero-feature-icon" />
                <span>
                  <strong>Investor funding</strong>
                  <small>ERC-7984 tokens</small>
                </span>
              </li>
              <li>
                <FaIcon icon={faLock} className="fx-hero-feature-icon" />
                <span>
                  <strong>Authorized decrypt</strong>
                  <small>EIP-712 relayer</small>
                </span>
              </li>
            </ul>
          </ScrollReveal>
        </div>
      </section>

      <section id="how" className="fx-section">
        <div className="fx-container">
          <ScrollReveal className="fx-section-head">
            <h2>Invoice lifecycle</h2>
            <p>From issuer mint to investor fund to debtor repayment — amounts stay confidential throughout.</p>
          </ScrollReveal>
          <div className="row g-4">
            {steps.map((s) => (
              <div key={s.n} className="col-md-4">
                <ScrollReveal>
                  <article className="fx-step-card">
                    <div className="fx-step-icon-wrap">
                      <FaIcon icon={s.icon} />
                    </div>
                    <span className="fx-step-num">{s.n}</span>
                    <h3>{s.title}</h3>
                    <p>{s.desc}</p>
                  </article>
                </ScrollReveal>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="privacy" className="fx-section fx-section-alt">
        <div className="fx-container">
          <div className="row g-4 g-lg-5 align-items-center">
            <div className="col-lg-6">
              <ScrollReveal>
                <h2>Public workflow, private amounts</h2>
                <p className="fx-split-lead">
                  Counterparties, due dates, and invoice status are visible for composability. Face values, funding
                  amounts, and repayments are encrypted with Zama FHE — cleartext never appears onchain.
                </p>
                <ul className="fx-checklist">
                  <li>
                    <FaIcon icon={faFileInvoiceDollar} className="fx-check-icon" />
                    InvoiceFactory on Sepolia
                  </li>
                  <li>
                    <FaIcon icon={faHandHoldingDollar} className="fx-check-icon" />
                    Registry-integrated funding tokens
                  </li>
                  <li>
                    <FaIcon icon={faLock} className="fx-check-icon" />
                    Per-field decrypt for issuer, investor, debtor
                  </li>
                </ul>
              </ScrollReveal>
            </div>
            <div className="col-lg-6">
              <ScrollReveal>
                <div className="fx-mock-panel">
                  <p className="fx-mock-label">
                    <FaIcon icon={faLock} size="sm" /> Face value
                  </p>
                  <p className="fx-mock-value">●●●●●● USDC</p>
                  <p className="fx-mock-caption">Encrypted at mint · decrypt with wallet</p>
                  <div className="fx-status-row" aria-hidden>
                    <span className="fx-status-pill is-open">Open</span>
                    <span className="fx-status-arrow">→</span>
                    <span className="fx-status-pill">Funded</span>
                    <span className="fx-status-arrow">→</span>
                    <span className="fx-status-pill">Repaid</span>
                  </div>
                </div>
              </ScrollReveal>
            </div>
          </div>
        </div>
      </section>

      <section className="fx-section fx-cta-section">
        <div className="fx-container fx-cta-inner">
          <ScrollReveal>
            <h2>Ready to factor a confidential invoice?</h2>
            <p>Connect your wallet on the app page, pick a funding token, and mint your first receivable.</p>
            <Link href="/app" className="fx-btn fx-btn-primary fx-btn-lg fx-btn-icon">
              Go to Factoring App
              <FaIcon icon={faArrowRight} size="sm" />
            </Link>
          </ScrollReveal>
        </div>
      </section>

      <footer className="fx-footer">
        <div className="fx-container">
          <p>Factor · Confidential invoice factoring on Zama FHEVM</p>
          <p className="fx-footer-meta">Zama Developer Program Season 3 · Builder track</p>
        </div>
      </footer>
    </main>
  );
}
