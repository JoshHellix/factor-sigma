"use client";

import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useAccount, usePublicClient } from "wagmi";
import { isAddress, parseUnits } from "viem";
import {
  ConnectButton,
  RegistryBrowser,
  WrapUnwrapPanel,
  shortenAddress,
  type TokenWrapperPair,
} from "@zama-season3/shared";
import { ChevronRightIcon, LockIcon, ShieldIcon } from "@/components/icons";
import { SiteHeader } from "@/components/marketing/SiteHeader";
import { InvoiceInspectorPanel } from "@/components/InvoiceInspectorPanel";
import { useInvoiceFactory } from "@/hooks/useInvoiceFactory";
import { INVOICE_FACTORY_ABI, INVOICE_STATUS } from "@/lib/invoiceFactoryAbi";

const INVOICE_FACTORY = process.env.NEXT_PUBLIC_INVOICE_FACTORY as `0x${string}` | undefined;

type ActivityItem = {
  action: string;
  tx?: string;
  time: string;
  status: "success" | "error";
};

function parseUsdc(value: string): bigint {
  return parseUnits(value.trim() || "0", 6);
}

const LEGEND = [
  { label: "Open", dotClass: "factor-dot-open" },
  { label: "Funded", dotClass: "factor-dot-funded" },
  { label: "Repaid", dotClass: "factor-dot-repaid" },
  { label: "Cancelled", dotClass: "factor-dot-cancelled" },
] as const;

export function FactorApp() {
  const [selectedPair, setSelectedPair] = useState<TokenWrapperPair | null>(null);
  const [debtor, setDebtor] = useState("");
  const [faceValue, setFaceValue] = useState("1.00");
  const [dueDays, setDueDays] = useState("30");
  const [fundInvoiceId, setFundInvoiceId] = useState("0");
  const [fundAmount, setFundAmount] = useState("0.80");
  const [repayInvoiceId, setRepayInvoiceId] = useState("0");
  const [repayAmount, setRepayAmount] = useState("0.85");
  const [status, setStatus] = useState<string | null>(null);
  const [activity, setActivity] = useState<ActivityItem[]>([]);

  const { address } = useAccount();
  const publicClient = usePublicClient();
  const queryClient = useQueryClient();
  const { createInvoice, fundInvoice, recordRepayment, pending, error, lastTx } =
    useInvoiceFactory(INVOICE_FACTORY);

  const { data: invoiceCount = 0n } = useQuery({
    queryKey: ["invoice-count", INVOICE_FACTORY],
    queryFn: async () => {
      if (!publicClient || !INVOICE_FACTORY) return 0n;
      return publicClient.readContract({
        address: INVOICE_FACTORY,
        abi: INVOICE_FACTORY_ABI,
        functionName: "nextInvoiceId",
      }) as Promise<bigint>;
    },
    enabled: !!publicClient && !!INVOICE_FACTORY,
  });

  function pushActivity(action: string, tx: string | undefined, ok: boolean) {
    const item: ActivityItem = {
      action,
      tx,
      time: "Just now",
      status: ok ? "success" : "error",
    };
    setActivity((prev) => [item, ...prev].slice(0, 5));
  }

  async function handleCreateInvoice() {
    setStatus(null);
    if (!INVOICE_FACTORY) {
      setStatus("Deploy factory first");
      return;
    }
    if (!isAddress(debtor)) {
      setStatus("Invalid debtor address");
      return;
    }
    if (!selectedPair) {
      setStatus("Select a funding token from the registry");
      return;
    }
    try {
      const dueDate = BigInt(Math.floor(Date.now() / 1000) + Number(dueDays) * 86400);
      const hash = await createInvoice(
        debtor as `0x${string}`,
        selectedPair.confidentialTokenAddress,
        dueDate,
        parseUsdc(faceValue),
      );
      setStatus("Invoice minted with encrypted face value");
      pushActivity("Confidential invoice created", hash, true);
      queryClient.invalidateQueries({ queryKey: ["invoice-count"] });
    } catch {
      pushActivity("Create invoice failed", undefined, false);
    }
  }

  async function handleFund() {
    setStatus(null);
    try {
      const hash = await fundInvoice(BigInt(fundInvoiceId), parseUsdc(fundAmount));
      setStatus(`Invoice #${fundInvoiceId} funded`);
      pushActivity(`Invoice #${fundInvoiceId} funded`, hash, true);
    } catch {
      pushActivity("Fund invoice failed", undefined, false);
    }
  }

  async function handleRepay() {
    setStatus(null);
    try {
      const hash = await recordRepayment(BigInt(repayInvoiceId), parseUsdc(repayAmount));
      setStatus(`Invoice #${repayInvoiceId} repaid`);
      pushActivity(`Invoice #${repayInvoiceId} repayment recorded`, hash, true);
    } catch {
      pushActivity("Repayment failed", undefined, false);
    }
  }

  return (
    <div className="factor-page factor-app-page">
      <SiteHeader />
      <div className="factor-app-bar">
        <div className="fx-container factor-app-bar-inner">
          <div>
            <h1 className="factor-app-title">Factoring console</h1>
            <p className="factor-app-sub">Issue invoices, fund with confidential tokens, and inspect encrypted fields.</p>
            {INVOICE_FACTORY ? (
              <p className="factor-factory-meta">
                Factory <code>{shortenAddress(INVOICE_FACTORY, 8)}</code>
              </p>
            ) : (
              <p className="factor-factory-meta">
                Set <code>NEXT_PUBLIC_INVOICE_FACTORY</code> after deploy
              </p>
            )}
          </div>
          <div className="factor-header-actions">
            <ConnectButton />
            {address && (
              <div className="factor-wallet-stat">
                <div>{shortenAddress(address, 4)}</div>
                <div className="factor-stat-value">{invoiceCount.toString()} invoice(s)</div>
              </div>
            )}
          </div>
        </div>
      </div>

      <main className="factor-main">
        <div className="factor-grid">
          <div className="factor-col">
            <section className="factor-card">
              <h2>Create Invoice (Issuer)</h2>
              <p className="factor-card-sub">Face value stays encrypted onchain. Due date and debtor are public.</p>

              <label className="factor-field">
                <span>Debtor Address</span>
                <input
                  className="factor-input mono"
                  value={debtor}
                  onChange={(e) => setDebtor(e.target.value)}
                  placeholder="0x…"
                />
              </label>

              <div className="factor-row-2">
                <label className="factor-field">
                  <span>Face Value (USDC)</span>
                  <input
                    className="factor-input"
                    value={faceValue}
                    onChange={(e) => setFaceValue(e.target.value)}
                    placeholder="1.00"
                  />
                </label>
                <label className="factor-field">
                  <span>Due in (days)</span>
                  <input
                    className="factor-input"
                    value={dueDays}
                    onChange={(e) => setDueDays(e.target.value)}
                    placeholder="30"
                  />
                </label>
              </div>

              <label className="factor-field">
                <span>
                  Face value encrypted onchain{" "}
                  <span className="factor-badge">
                    <LockIcon size={12} />
                    euint64
                  </span>
                </span>
                <div className="factor-encrypted-box">Encrypted at mint via Zama relayer</div>
              </label>

              <label className="factor-field">
                <span>Selected Funding Token</span>
                <div className="factor-token-select">
                  {selectedPair ? (
                    <>
                      <ShieldIcon size={16} />
                      <span>{shortenAddress(selectedPair.confidentialTokenAddress, 6)} (Sepolia)</span>
                    </>
                  ) : (
                    <span style={{ color: "var(--muted)" }}>Select from registry below</span>
                  )}
                  <ChevronRightIcon size={16} />
                </div>
              </label>

              <button
                type="button"
                className="factor-btn factor-btn-primary"
                disabled={pending || !INVOICE_FACTORY}
                onClick={handleCreateInvoice}
              >
                {pending ? "Submitting…" : "Mint Confidential Invoice"}
              </button>
            </section>

            <section className="factor-card">
              <h2>Fund &amp; Repay</h2>
              <p className="factor-card-sub">Investor funds at discount; debtor repays with encrypted amounts.</p>

              <div className="factor-fund-repay">
                <div>
                  <h3 className="factor-step-title" style={{ marginBottom: "1rem" }}>
                    Fund
                  </h3>
                  <label className="factor-field">
                    <span>Invoice ID</span>
                    <input
                      className="factor-input"
                      value={fundInvoiceId}
                      onChange={(e) => setFundInvoiceId(e.target.value)}
                      placeholder="0"
                    />
                  </label>
                  <label className="factor-field">
                    <span>Fund Amount (USDC)</span>
                    <input
                      className="factor-input"
                      value={fundAmount}
                      onChange={(e) => setFundAmount(e.target.value)}
                      placeholder="0.80"
                    />
                  </label>
                  <button
                    type="button"
                    className="factor-btn factor-btn-outline"
                    disabled={pending || !INVOICE_FACTORY}
                    onClick={handleFund}
                  >
                    Fund Invoice
                  </button>
                </div>

                <div>
                  <div className="factor-section-label">
                    <h3>Repay</h3>
                    <span>Debtor only</span>
                  </div>
                  <label className="factor-field">
                    <span>Invoice ID</span>
                    <input
                      className="factor-input"
                      value={repayInvoiceId}
                      onChange={(e) => setRepayInvoiceId(e.target.value)}
                      placeholder="0"
                    />
                  </label>
                  <label className="factor-field">
                    <span>Repay Amount (USDC)</span>
                    <input
                      className="factor-input"
                      value={repayAmount}
                      onChange={(e) => setRepayAmount(e.target.value)}
                      placeholder="0.85"
                    />
                  </label>
                  <button
                    type="button"
                    className="factor-btn factor-btn-accent"
                    disabled={pending || !INVOICE_FACTORY}
                    onClick={handleRepay}
                  >
                    Record Repayment
                  </button>
                </div>
              </div>

              <div className="factor-legend">
                <h4>Status Legend</h4>
                <div className="factor-legend-grid">
                  {LEGEND.map((item) => (
                    <div key={item.label} className="factor-legend-item">
                      <span className={`factor-dot ${item.dotClass}`} />
                      {item.label}
                    </div>
                  ))}
                </div>
                <p className="factor-card-sub" style={{ marginTop: "0.75rem", marginBottom: 0 }}>
                  Flow: {INVOICE_STATUS.join(" → ")}
                </p>
              </div>
            </section>

            <RegistryBrowser
              chainKey="sepolia"
              selected={selectedPair}
              onSelect={setSelectedPair}
              previewRows={8}
            />
          </div>

          <div className="factor-col">
            <WrapUnwrapPanel pair={selectedPair} />
            <InvoiceInspectorPanel factoryAddress={INVOICE_FACTORY} />

            <section className="factor-card">
              <h2>Activity</h2>
              <p className="factor-card-sub">Recent onchain actions from this session</p>

              {activity.length === 0 ? (
                <p style={{ fontSize: "0.75rem", color: "var(--muted)", margin: 0 }}>
                  Create, fund, or repay an invoice to see activity here.
                </p>
              ) : (
                <div>
                  {activity.map((item, idx) => (
                    <div key={`${item.action}-${idx}`} className="factor-activity-item">
                      <div className="factor-activity-row">
                        <div>
                          <p className="factor-activity-action">{item.action}</p>
                          {item.tx && <p className="factor-activity-tx">{shortenAddress(item.tx, 6)}</p>}
                        </div>
                        <span
                          className={`factor-status-dot ${item.status === "success" ? "ok" : "err"}`}
                          aria-hidden
                        />
                      </div>
                      <p className="factor-activity-time">{item.time}</p>
                    </div>
                  ))}
                </div>
              )}

              {lastTx && (
                <p className="factor-activity-tx" style={{ marginTop: "1rem" }}>
                  Last tx: {shortenAddress(lastTx, 8)}
                </p>
              )}
            </section>
          </div>
        </div>

        {status && <p className="factor-toast ok">{status}</p>}
        {error && <p className="factor-toast err">{error}</p>}
      </main>
    </div>
  );
}
