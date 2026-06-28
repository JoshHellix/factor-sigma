"use client";

import { useEffect, useMemo, useState } from "react";
import { parseUnits } from "viem";
import { useWrapUnwrap } from "../hooks/useWrapUnwrap";
import { useConfidentialBalance } from "../hooks/useConfidentialBalance";
import type { EnrichedTokenWrapperPair } from "../constants";
import { formatUnits, resolvePairDecimals, shortenAddress } from "../registry";

interface WrapUnwrapPanelProps {
  pair: EnrichedTokenWrapperPair | null;
}

export function WrapUnwrapPanel({ pair }: WrapUnwrapPanelProps) {
  const decimals = pair ? resolvePairDecimals(pair) : 6;
  const [amount, setAmount] = useState("");
  const { wrap, unwrap, pending, error, lastTx } = useWrapUnwrap(pair?.confidentialTokenAddress);
  const { balance, loading: decryptLoading, error: decryptError, neverShielded, decryptBalance } = useConfidentialBalance(
    pair?.confidentialTokenAddress,
  );

  useEffect(() => {
    setAmount(decimals === 18 ? "0.01" : "1");
  }, [pair?.confidentialTokenAddress, decimals]);

  if (!pair) {
    return (
      <section className="zama-panel">
        <p className="zama-muted">Select a registry pair to wrap or unwrap tokens.</p>
      </section>
    );
  }

  const label = pair.symbol ?? shortenAddress(pair.tokenAddress, 6);

  const parsed = (() => {
    try {
      return parseUnits(amount || "0", decimals);
    } catch {
      return 0n;
    }
  })();

  return (
    <section className="zama-panel">
      <header className="zama-panel-header">
        <div>
          <h2>Wrap / Unwrap</h2>
          <p className="zama-muted">
            {label} · wrapper <code>{shortenAddress(pair.confidentialTokenAddress, 8)}</code>
          </p>
        </div>
      </header>

      <label className="zama-field">
        <span>
          Amount ({decimals} decimals{pair.symbol ? ` · ${pair.symbol}` : ""})
        </span>
        <input
          type="text"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder={decimals === 18 ? "0.01" : "1.0"}
          className="zama-input"
        />
      </label>

      <div className="zama-actions">
        <button type="button" className="zama-btn zama-btn-primary" disabled={pending || parsed === 0n} onClick={() => wrap(parsed)}>
          {pending ? "Processing…" : "Shield (Wrap)"}
        </button>
        <button type="button" className="zama-btn zama-btn-outline" disabled={pending || parsed === 0n} onClick={() => unwrap(parsed)}>
          Unshield (Unwrap)
        </button>
      </div>

      <div className="zama-balance-row">
        <button type="button" className="zama-btn zama-btn-ghost" disabled={decryptLoading} onClick={() => void decryptBalance()}>
          {decryptLoading ? "Decrypting…" : "Decrypt ERC-7984 Balance (EIP-712)"}
        </button>
        {balance !== null && (
          <span className="zama-badge">
            Balance: {formatUnits(balance, decimals)} {pair.symbol ?? "units"}
          </span>
        )}
        {neverShielded && <span className="zama-muted">No confidential balance yet — shield tokens first.</span>}
      </div>

      {error && <p className="zama-error">{error}</p>}
      {decryptError && <p className="zama-error">{decryptError}</p>}
      {lastTx && (
        <p className="zama-muted">
          Last tx: <code>{shortenAddress(lastTx, 10)}</code>
        </p>
      )}
    </section>
  );
}
