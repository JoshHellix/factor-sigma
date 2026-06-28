"use client";

import { useConfidentialBalances } from "@zama-fhe/react-sdk";
import { useEffect, useMemo, useState } from "react";
import { useAccount } from "wagmi";
import { useZamaReady } from "../providers/Web3Providers";
import { formatUnits, resolvePairDecimals, shortenAddress } from "../registry";
import type { EnrichedTokenWrapperPair } from "../constants";

export interface DecryptTokenOption {
  address: `0x${string}`;
  label: string;
  decimals?: number;
}

interface WrappedHoldingsPanelProps {
  pairs: EnrichedTokenWrapperPair[];
  onSelect?: (pair: EnrichedTokenWrapperPair) => void;
  onWalletTokensChange?: (tokens: DecryptTokenOption[]) => void;
}

const EMPTY_WALLET_TOKENS: DecryptTokenOption[] = [];

export function WrappedHoldingsPanel({ pairs, onSelect, onWalletTokensChange }: WrappedHoldingsPanelProps) {
  const { address } = useAccount();
  const zamaReady = useZamaReady();
  const [scanned, setScanned] = useState(false);

  const tokenAddresses = useMemo(
    () => pairs.map((p) => p.confidentialTokenAddress),
    [pairs],
  );

  const { data, isFetching, error, refetch, isSuccess } = useConfidentialBalances(
    { tokenAddresses },
    { enabled: scanned && zamaReady && tokenAddresses.length > 0 },
  );

  const rows = useMemo(() => {
    if (!data) return [];
    return pairs
      .map((pair) => ({
        pair,
        decimals: resolvePairDecimals(pair),
        balance: data.results.get(pair.confidentialTokenAddress) ?? 0n,
        failed: data.errors.has(pair.confidentialTokenAddress),
      }))
      .sort((a, b) => (a.balance === b.balance ? 0 : a.balance > b.balance ? -1 : 1));
  }, [data, pairs]);

  const withBalance = useMemo(() => rows.filter((r) => r.balance > 0n), [rows]);
  const holdingsCount = withBalance.length;

  const walletTokenOptions = useMemo(
    () =>
      withBalance.map(({ pair, balance, decimals }) => ({
        address: pair.confidentialTokenAddress,
        label: pair.symbol
          ? `${pair.symbol} (${formatUnits(balance, decimals)})`
          : `${shortenAddress(pair.confidentialTokenAddress, 6)} (${formatUnits(balance, decimals)})`,
        decimals,
      })),
    [withBalance],
  );

  useEffect(() => {
    if (!onWalletTokensChange) return;
    onWalletTokensChange(isSuccess ? walletTokenOptions : EMPTY_WALLET_TOKENS);
  }, [onWalletTokensChange, isSuccess, walletTokenOptions]);

  useEffect(() => {
    function onWrapComplete() {
      if (scanned) void refetch();
    }
    window.addEventListener("zama:wrap-complete", onWrapComplete);
    return () => window.removeEventListener("zama:wrap-complete", onWrapComplete);
  }, [scanned, refetch]);

  async function handleScan() {
    if (!address) return;
    setScanned(true);
    if (isSuccess) await refetch();
  }

  return (
    <div className="holdings-panel">
      {!address && (
        <p className="zama-muted">Connect wallet to view your encrypted ERC-7984 balances.</p>
      )}

      {address && (
        <>
          <div className="holdings-summary">
            {isSuccess ? (
              <>
                <span className="holdings-stat">
                  <strong>{holdingsCount}</strong>
                  {holdingsCount === 1 ? " wrapped token" : " wrapped tokens"}
                </span>
                {holdingsCount === 0 && (
                  <span className="zama-muted"> — shield tokens to see holdings here</span>
                )}
              </>
            ) : (
              <span className="zama-muted">
                Decrypt balances across all {pairs.length} registry wrappers (one EIP-712 batch).
              </span>
            )}
          </div>

          <div className="holdings-actions">
            <button
              type="button"
              className="zama-btn zama-btn-primary"
              disabled={!zamaReady || isFetching || pairs.length === 0}
              onClick={() => void handleScan()}
            >
              {isFetching ? "Decrypting…" : scanned ? "Refresh Holdings" : "Decrypt My Wrapped Holdings"}
            </button>
          </div>

          {error && <p className="zama-error">{error.message}</p>}

          {isSuccess && withBalance.length > 0 && (
            <div className="zama-table-wrap holdings-table-wrap">
              <table className="zama-table">
                <thead>
                  <tr>
                    <th>Token</th>
                    <th>Decrypted Balance</th>
                    {onSelect && <th />}
                  </tr>
                </thead>
                <tbody>
                  {withBalance.map(({ pair, balance, decimals }) => (
                    <tr key={pair.confidentialTokenAddress}>
                      <td>
                        <strong>{pair.symbol ?? shortenAddress(pair.confidentialTokenAddress, 6)}</strong>
                        <div className="zama-muted">
                          <code>{shortenAddress(pair.confidentialTokenAddress, 8)}</code>
                        </div>
                      </td>
                      <td>
                        <span className="holdings-balance">{formatUnits(balance, decimals)}</span>
                        {pair.symbol && <span className="holdings-units"> {pair.symbol}</span>}
                      </td>
                      {onSelect && (
                        <td>
                          <button
                            type="button"
                            className="zama-btn zama-btn-sm zama-btn-outline"
                            onClick={() => onSelect(pair)}
                          >
                            Use
                          </button>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {isSuccess && withBalance.length === 0 && (
            <p className="zama-muted holdings-empty">No confidential balances yet — mint from the faucet and shield.</p>
          )}

          {isSuccess && rows.some((r) => r.failed) && (
            <p className="zama-muted holdings-hint">
              Some tokens could not be read (never shielded or ACL pending). Only non-zero balances are listed.
            </p>
          )}
        </>
      )}
    </div>
  );
}
