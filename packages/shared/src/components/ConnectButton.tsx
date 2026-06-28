"use client";

import { useConnect, useAccount, useDisconnect, useChainId, useSwitchChain } from "wagmi";
import type { Connector } from "wagmi";
import { sepolia, mainnet } from "wagmi/chains";
import { useState } from "react";
import { shortenAddress } from "../registry";

function pickWalletConnector(connectors: readonly Connector[]) {
  return (
    connectors.find((c) => c.type === "injected" || c.id === "injected") ??
    connectors.find((c) => c.type === "metaMask" || c.id === "metaMaskSDK") ??
    connectors[0]
  );
}

export function ConnectButton() {
  const { address, isConnected } = useAccount();
  const { connectAsync, connectors, isPending, error: connectError } = useConnect();
  const { disconnect } = useDisconnect();
  const chainId = useChainId();
  const { switchChain } = useSwitchChain();
  const [localError, setLocalError] = useState<string | null>(null);

  if (isConnected && address) {
    const chainName =
      chainId === sepolia.id ? "Sepolia" : chainId === mainnet.id ? "Mainnet" : `Chain ${chainId}`;

    return (
      <div className="zama-connect">
        <span className="zama-badge">{chainName}</span>
        <span className="zama-address">{shortenAddress(address, 6)}</span>
        {chainId !== sepolia.id && (
          <button type="button" className="zama-btn zama-btn-ghost" onClick={() => switchChain({ chainId: sepolia.id })}>
            Switch to Sepolia
          </button>
        )}
        {chainId !== mainnet.id && (
          <button type="button" className="zama-btn zama-btn-ghost" onClick={() => switchChain({ chainId: mainnet.id })}>
            Switch to Mainnet
          </button>
        )}
        <button type="button" className="zama-btn zama-btn-outline" onClick={() => disconnect()}>
          Disconnect
        </button>
      </div>
    );
  }

  const injected = pickWalletConnector(connectors);

  async function handleConnect() {
    setLocalError(null);
    if (!injected) {
      setLocalError("No wallet detected. Install MetaMask or another Web3 wallet.");
      return;
    }
    try {
      await connectAsync({ connector: injected, chainId: sepolia.id });
    } catch (e) {
      setLocalError(e instanceof Error ? e.message : "Could not connect wallet");
    }
  }

  return (
    <div className="zama-connect">
      <button
        type="button"
        className="zama-btn zama-btn-primary"
        disabled={isPending}
        onClick={() => void handleConnect()}
      >
        {isPending ? "Connecting…" : "Connect Wallet"}
      </button>
      {(localError || connectError) && (
        <p className="zama-error" style={{ margin: "0.5rem 0 0", fontSize: "0.75rem" }}>
          {localError ?? connectError?.message}
        </p>
      )}
    </div>
  );
}
