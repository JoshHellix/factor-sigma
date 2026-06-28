"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { usePublicClient } from "wagmi";
import { fetchEnrichedRegistryPairs, shortenAddress } from "../registry";
import { CHAIN_IDS, type EnrichedTokenWrapperPair, type SupportedChainKey, type TokenWrapperPair } from "../constants";

const CHAIN_LABELS: Record<SupportedChainKey, string> = {
  sepolia: "Sepolia",
  mainnet: "Ethereum Mainnet",
};

interface RegistryBrowserProps {
  chainKey: SupportedChainKey;
  selected?: TokenWrapperPair | null;
  onSelect?: (pair: TokenWrapperPair) => void;
  /** When set, show a preview list first; user expands for the full table. */
  previewRows?: number;
}

export function RegistryBrowser({ chainKey, selected, onSelect, previewRows }: RegistryBrowserProps) {
  const publicClient = usePublicClient({ chainId: CHAIN_IDS[chainKey] });
  const [expanded, setExpanded] = useState(false);

  const { data: pairs = [], isLoading, error, refetch } = useQuery({
    queryKey: ["registry-pairs-enriched", chainKey, publicClient?.chain?.id],
    queryFn: async () => {
      if (!publicClient) return [] as EnrichedTokenWrapperPair[];
      return fetchEnrichedRegistryPairs(publicClient, chainKey);
    },
    enabled: !!publicClient,
    staleTime: 60_000,
  });

  const usePreview = previewRows !== undefined && previewRows > 0;
  const showPreview = usePreview && !expanded;
  const previewList = showPreview ? pairs.slice(0, previewRows) : pairs;

  function toggleExpanded() {
    if (!usePreview) return;
    setExpanded((v) => !v);
  }

  return (
    <section className={`zama-panel ${usePreview ? "zama-registry-collapsible" : ""} ${usePreview && !expanded ? "zama-registry-is-collapsed" : ""}`}>
      <header className="zama-panel-header zama-registry-header">
        {usePreview ? (
          <button
            type="button"
            className="zama-registry-toggle"
            onClick={toggleExpanded}
            aria-expanded={expanded}
          >
            <span className="zama-registry-toggle-label">
              Wrapper Registry — {CHAIN_LABELS[chainKey]}
            </span>
            <span className="zama-registry-toggle-meta">
              {pairs.length} pair{pairs.length === 1 ? "" : "s"}
            </span>
            <span className="zama-registry-chevron" aria-hidden>
              {expanded ? "▴" : "▾"}
            </span>
          </button>
        ) : (
          <div>
            <h2>Wrapper Registry — {CHAIN_LABELS[chainKey]}</h2>
            <p className="zama-muted">{pairs.length} valid ERC-20 ↔ ERC-7984 pairs</p>
          </div>
        )}
        <button type="button" className="zama-btn zama-btn-ghost" onClick={() => refetch()}>
          Refresh
        </button>
      </header>

      {usePreview && !expanded && !isLoading && pairs.length > 0 && (
        <p className="zama-muted zama-registry-hint">
          Showing {Math.min(previewRows!, pairs.length)} of {pairs.length}
        </p>
      )}

      {isLoading && <p className="zama-muted zama-registry-loading">Loading registry pairs…</p>}
      {error && <p className="zama-error">Failed to load registry: {(error as Error).message}</p>}

      {showPreview && !isLoading && pairs.length > 0 && (
        <ul className="zama-registry-preview">
          {previewList.map((pair) => {
            const isSelected =
              selected?.tokenAddress === pair.tokenAddress &&
              selected?.confidentialTokenAddress === pair.confidentialTokenAddress;
            const label = pair.symbol ?? pair.name ?? shortenAddress(pair.tokenAddress, 8);

            return (
              <li key={`${pair.tokenAddress}-${pair.confidentialTokenAddress}`} className={isSelected ? "is-selected" : ""}>
                <div className="zama-registry-preview-main">
                  <strong>{label}</strong>
                  <span className="zama-muted">
                    {shortenAddress(pair.tokenAddress, 6)} → {shortenAddress(pair.confidentialTokenAddress, 6)}
                  </span>
                </div>
                {onSelect && (
                  <button type="button" className="zama-btn zama-btn-sm" onClick={() => onSelect(pair)}>
                    Select
                  </button>
                )}
              </li>
            );
          })}
        </ul>
      )}

      {showPreview && !isLoading && pairs.length > previewRows! && (
        <button type="button" className="zama-btn zama-btn-outline zama-registry-expand" onClick={() => setExpanded(true)}>
          View all {pairs.length} pairs ▾
        </button>
      )}

      {(!usePreview || expanded) && !isLoading && (
        <>
          {expanded && usePreview && (
            <button type="button" className="zama-btn zama-btn-ghost zama-registry-collapse" onClick={() => setExpanded(false)}>
              Collapse to preview ▴
            </button>
          )}
          <div className={`zama-table-wrap ${expanded ? "zama-table-wrap-expanded" : ""}`}>
            <table className="zama-table">
              <thead>
                <tr>
                  <th>Token</th>
                  <th>ERC-20</th>
                  <th>ERC-7984 Wrapper</th>
                  <th>Status</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {pairs.map((pair) => {
                  const isSelected =
                    selected?.tokenAddress === pair.tokenAddress &&
                    selected?.confidentialTokenAddress === pair.confidentialTokenAddress;

                  const label = pair.symbol ?? pair.name ?? shortenAddress(pair.tokenAddress, 8);

                  return (
                    <tr key={`${pair.tokenAddress}-${pair.confidentialTokenAddress}`} className={isSelected ? "selected" : ""}>
                      <td>
                        <strong>{label}</strong>
                        {pair.name && pair.symbol && pair.name !== pair.symbol && (
                          <div className="zama-muted">{pair.name}</div>
                        )}
                        {pair.decimals !== undefined && (
                          <div className="zama-muted">{pair.decimals} decimals</div>
                        )}
                      </td>
                      <td>
                        <code>{shortenAddress(pair.tokenAddress, 8)}</code>
                      </td>
                      <td>
                        <code>{shortenAddress(pair.confidentialTokenAddress, 8)}</code>
                      </td>
                      <td>
                        {pair.isLocal ? (
                          <span className="zama-badge">Local</span>
                        ) : (
                          <span className="zama-badge zama-badge-ok">Registry</span>
                        )}
                      </td>
                      <td>
                        {onSelect && (
                          <button type="button" className="zama-btn zama-btn-sm" onClick={() => onSelect(pair)}>
                            Select
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      )}
    </section>
  );
}
