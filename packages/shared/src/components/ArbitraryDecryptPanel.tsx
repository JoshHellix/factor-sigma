"use client";

import { useState } from "react";
import { isAddress } from "viem";
import { useConfidentialBalance } from "../hooks/useConfidentialBalance";
import { formatUnits, shortenAddress } from "../registry";
import type { DecryptTokenOption } from "./WrappedHoldingsPanel";

interface ArbitraryDecryptPanelProps {
  /** Tokens with non-zero balance after “Decrypt My Wrapped Holdings”. */
  walletTokens?: DecryptTokenOption[];
  /** All registry ERC-7984 wrappers on the active network. */
  registryTokens?: DecryptTokenOption[];
}

export function ArbitraryDecryptPanel({ walletTokens = [], registryTokens = [] }: ArbitraryDecryptPanelProps) {
  const [input, setInput] = useState("");
  const [activeToken, setActiveToken] = useState<`0x${string}` | undefined>();
  const [decimals, setDecimals] = useState("6");
  const { balance, loading, error, neverShielded, decryptBalance } = useConfidentialBalance(activeToken);

  const parsedDecimals = (() => {
    const n = Number(decimals);
    return Number.isInteger(n) && n >= 0 && n <= 36 ? n : 6;
  })();

  const hasDropdownOptions = walletTokens.length > 0 || registryTokens.length > 0;

  function resolveTokenAddress(): `0x${string}` | undefined {
    const trimmed = input.trim();
    if (isAddress(trimmed)) return trimmed;
    return activeToken;
  }

  function pickToken(option: DecryptTokenOption) {
    setInput(option.address);
    setActiveToken(option.address);
    if (option.decimals !== undefined) {
      setDecimals(String(option.decimals));
    }
  }

  function applyAddress() {
    const trimmed = input.trim();
    if (!isAddress(trimmed)) {
      return;
    }
    setActiveToken(trimmed);
  }

  async function handleDecrypt() {
    const token = resolveTokenAddress();
    if (!token) return;
    setActiveToken(token);
    await decryptBalance(token);
  }

  return (
    <section className="zama-panel">
      <header className="zama-panel-header">
        <div>
          <h2>Decrypt Any ERC-7984 Token</h2>
          <p className="zama-muted">
            Pick a token from your holdings or the registry, or paste any ERC-7984 address.
          </p>
        </div>
      </header>

      {hasDropdownOptions && (
        <label className="zama-field">
          <span>Choose token</span>
          <select
            className="zama-input"
            defaultValue=""
            onChange={(e) => {
              const value = e.target.value;
              if (!value) return;
              const all = [...walletTokens, ...registryTokens];
              const option = all.find((t) => t.address.toLowerCase() === value.toLowerCase());
              if (option) pickToken(option);
            }}
          >
            <option value="">Select a token…</option>
            {walletTokens.length > 0 && (
              <optgroup label="Your decrypted holdings">
                {walletTokens.map((t) => (
                  <option key={t.address} value={t.address}>
                    {t.label}
                  </option>
                ))}
              </optgroup>
            )}
            {registryTokens.length > 0 && (
              <optgroup label="Registry wrappers">
                {registryTokens.map((t) => (
                  <option key={t.address} value={t.address}>
                    {t.label}
                  </option>
                ))}
              </optgroup>
            )}
          </select>
        </label>
      )}

      <label className="zama-field">
        <span>Or paste ERC-7984 address</span>
        <input
          type="text"
          className="zama-input"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="0x…"
        />
      </label>

      <label className="zama-field">
        <span>Display decimals</span>
        <input
          type="text"
          className="zama-input"
          value={decimals}
          onChange={(e) => setDecimals(e.target.value)}
          placeholder="6"
        />
      </label>

      <div className="zama-actions">
        <button
          type="button"
          className="zama-btn zama-btn-outline"
          disabled={!isAddress(input.trim())}
          onClick={applyAddress}
        >
          Use Address
        </button>
        <button
          type="button"
          className="zama-btn zama-btn-primary"
          disabled={!resolveTokenAddress() || loading}
          onClick={() => void handleDecrypt()}
        >
          {loading ? "Decrypting…" : "Decrypt Balance (EIP-712)"}
        </button>
      </div>

      {walletTokens.length === 0 && registryTokens.length > 0 && (
        <p className="zama-muted">
          Tip: run <strong>Decrypt My Wrapped Holdings</strong> above to populate your holdings here.
        </p>
      )}

      {activeToken && (
        <p className="zama-muted">
          Active token: <code>{shortenAddress(activeToken, 10)}</code>
        </p>
      )}

      {balance !== null && (
        <p className="zama-badge">
          Decrypted balance: {formatUnits(balance, parsedDecimals)}
          {parsedDecimals !== 6 ? ` (${parsedDecimals} decimals)` : ""}
        </p>
      )}
      {neverShielded && (
        <p className="zama-muted">No confidential balance found for this token in your wallet.</p>
      )}
      {input.trim() && !isAddress(input.trim()) && (
        <p className="zama-error">Enter a valid checksummed or lowercase 0x address.</p>
      )}
      {error && <p className="zama-error">{error}</p>}
    </section>
  );
}
