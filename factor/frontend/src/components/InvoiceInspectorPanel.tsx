"use client";

import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { usePublicClient } from "wagmi";
import { formatUnits, shortenAddress } from "@zama-season3/shared";
import { useInvoiceDecrypt } from "@/hooks/useInvoiceDecrypt";
import { INVOICE_FACTORY_ABI, INVOICE_STATUS } from "@/lib/invoiceFactoryAbi";

interface InvoiceInspectorPanelProps {
  factoryAddress?: `0x${string}`;
}

export function InvoiceInspectorPanel({ factoryAddress }: InvoiceInspectorPanelProps) {
  const publicClient = usePublicClient();
  const [invoiceId, setInvoiceId] = useState("0");
  const [decrypted, setDecrypted] = useState<Record<string, bigint>>({});
  const { decryptField, loading, error } = useInvoiceDecrypt(factoryAddress);

  const id = (() => {
    try {
      return BigInt(invoiceId.trim() || "0");
    } catch {
      return null;
    }
  })();

  const { data: invoice, isLoading } = useQuery({
    queryKey: ["invoice", factoryAddress, id?.toString()],
    queryFn: async () => {
      if (!publicClient || !factoryAddress || id === null) return null;
      const row = (await publicClient.readContract({
        address: factoryAddress,
        abi: INVOICE_FACTORY_ABI,
        functionName: "getInvoice",
        args: [id],
      })) as readonly [
        `0x${string}`,
        `0x${string}`,
        `0x${string}`,
        `0x${string}`,
        bigint,
        `0x${string}`,
        `0x${string}`,
        `0x${string}`,
        number,
      ];
      return {
        issuer: row[0],
        debtor: row[1],
        fundingToken: row[2],
        investor: row[3],
        dueDate: row[4],
        status: INVOICE_STATUS[row[8]] ?? "Unknown",
      };
    },
    enabled: !!publicClient && !!factoryAddress && id !== null,
    retry: false,
  });

  async function handleDecrypt(field: "faceValue" | "fundedAmount" | "repaidAmount") {
    if (id === null || !factoryAddress) return;
    const value = await decryptField(id, field);
    setDecrypted((prev) => ({ ...prev, [field]: value }));
  }

  return (
    <section className="factor-card">
      <h2>Inspect &amp; Decrypt Invoice</h2>
      <p className="factor-card-sub">
        Public metadata onchain; face value, fund, and repay amounts decrypt via EIP-712 (ACL-gated).
      </p>

      {!factoryAddress && (
        <p className="factor-toast err" style={{ marginTop: 0 }}>
          Set <code>NEXT_PUBLIC_INVOICE_FACTORY</code> to inspect invoices.
        </p>
      )}

      <label className="factor-field">
        <span>Invoice ID</span>
        <input
          className="factor-input"
          value={invoiceId}
          onChange={(e) => {
            setInvoiceId(e.target.value);
            setDecrypted({});
          }}
          placeholder="0"
        />
      </label>

      {isLoading && <p style={{ fontSize: "0.75rem", color: "var(--muted)" }}>Loading invoice…</p>}

      {invoice && (
        <div className="factor-invoice-meta">
          <p>
            <strong>Status:</strong> {invoice.status}
          </p>
          <p>
            <strong>Issuer:</strong> <code>{shortenAddress(invoice.issuer, 6)}</code>
          </p>
          <p>
            <strong>Debtor:</strong> <code>{shortenAddress(invoice.debtor, 6)}</code>
          </p>
          <p>
            <strong>Investor:</strong>{" "}
            {invoice.investor === "0x0000000000000000000000000000000000000000"
              ? "—"
              : shortenAddress(invoice.investor, 6)}
          </p>
          <p>
            <strong>Funding token:</strong> <code>{shortenAddress(invoice.fundingToken, 6)}</code>
          </p>
          <p>
            <strong>Due:</strong> {new Date(Number(invoice.dueDate) * 1000).toLocaleDateString()}
          </p>
        </div>
      )}

      <div className="factor-decrypt-row">
        {(["faceValue", "fundedAmount", "repaidAmount"] as const).map((field) => (
          <button
            key={field}
            type="button"
            className="factor-btn factor-btn-outline"
            disabled={loading || !factoryAddress || id === null}
            onClick={() => void handleDecrypt(field)}
          >
            {loading ? "…" : `Decrypt ${field.replace(/([A-Z])/g, " $1").trim()}`}
          </button>
        ))}
      </div>

      {Object.entries(decrypted).map(([field, value]) => (
        <p key={field} className="factor-toast ok" style={{ marginBottom: "0.5rem" }}>
          {field}: {formatUnits(value, 6)} USDC (6 decimals)
        </p>
      ))}

      {error && <p className="factor-toast err">{error}</p>}
    </section>
  );
}
