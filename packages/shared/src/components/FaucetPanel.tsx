"use client";

import { useState } from "react";
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { parseUnits } from "viem";
import { ERC20_ABI, faucetMintCapForDecimals, type EnrichedTokenWrapperPair } from "../constants";
import { resolvePairDecimals, shortenAddress } from "../registry";

interface FaucetPanelProps {
  pairs: EnrichedTokenWrapperPair[];
}

export function FaucetPanel({ pairs }: FaucetPanelProps) {
  const { address } = useAccount();
  const [selectedToken, setSelectedToken] = useState<string>("");
  const [amount, setAmount] = useState("10");
  const [status, setStatus] = useState<string | null>(null);

  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: confirming } = useWaitForTransactionReceipt({ hash });

  const mockPairs = pairs.filter((p) => p.isValid);

  const selectedPair = mockPairs.find((p) => p.tokenAddress === selectedToken);
  const decimals = selectedPair ? resolvePairDecimals(selectedPair) : 6;
  const mintCap = faucetMintCapForDecimals(decimals);

  function onSelectToken(tokenAddress: string) {
    setSelectedToken(tokenAddress);
    const pair = mockPairs.find((p) => p.tokenAddress === tokenAddress);
    const d = pair ? resolvePairDecimals(pair) : 6;
    setAmount(d === 18 ? "0.1" : "10");
    setStatus(null);
  }

  async function mint() {
    if (!address || !selectedToken || !selectedPair) return;
    setStatus(null);
    let parsed: bigint;
    try {
      parsed = parseUnits(amount, decimals);
    } catch {
      setStatus("Invalid amount");
      return;
    }
    if (parsed > mintCap) {
      setStatus(`Max 1,000,000 ${selectedPair.symbol ?? "tokens"} per mint`);
      return;
    }
    if (parsed === 0n) {
      setStatus("Amount must be greater than zero");
      return;
    }

    writeContract({
      address: selectedToken as `0x${string}`,
      abi: ERC20_ABI,
      functionName: "mint",
      args: [address, parsed],
    });
  }

  return (
    <section className="zama-panel">
      <header className="zama-panel-header">
        <div>
          <h2>Sepolia cTokenMocks Faucet</h2>
          <p className="zama-muted">Mint official testnet ERC-20 underlying tokens (public mint, max 1M/call)</p>
        </div>
      </header>

      {!address && <p className="zama-muted">Connect wallet to mint test tokens.</p>}

      <label className="zama-field">
        <span>Underlying ERC-20</span>
        <select className="zama-input" value={selectedToken} onChange={(e) => onSelectToken(e.target.value)}>
          <option value="">Select token…</option>
          {mockPairs.map((p) => {
            const d = resolvePairDecimals(p);
            const label = p.symbol
              ? `${p.symbol} (${d} dec · ${shortenAddress(p.tokenAddress, 6)})`
              : `${shortenAddress(p.tokenAddress, 8)} → c${shortenAddress(p.confidentialTokenAddress, 6)}`;
            return (
              <option key={p.tokenAddress} value={p.tokenAddress}>
                {label}
              </option>
            );
          })}
        </select>
      </label>

      <label className="zama-field">
        <span>
          Amount ({decimals} decimals{selectedPair?.symbol ? ` · ${selectedPair.symbol}` : ""})
        </span>
        <input className="zama-input" value={amount} onChange={(e) => setAmount(e.target.value)} />
      </label>

      <button
        type="button"
        className="zama-btn zama-btn-primary"
        disabled={!address || !selectedToken || isPending || confirming}
        onClick={mint}
      >
        {isPending || confirming ? "Minting…" : "Mint Test Tokens"}
      </button>

      {hash && <p className="zama-muted">Tx: {shortenAddress(hash, 10)}</p>}
      {error && <p className="zama-error">{error.message}</p>}
      {status && <p className="zama-error">{status}</p>}
    </section>
  );
}
