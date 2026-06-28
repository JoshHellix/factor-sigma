"use client";

import { useZamaSDK } from "@zama-fhe/react-sdk";
import { indexedDBStorage, savePendingUnshield } from "@zama-fhe/sdk";
import { useCallback, useState } from "react";
import type { Address } from "viem";
import { useZamaReady } from "../providers/Web3Providers";

export function useWrapUnwrap(confidentialTokenAddress?: Address) {
  const zamaSDK = useZamaSDK();
  const zamaReady = useZamaReady();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastTx, setLastTx] = useState<string | null>(null);

  const wrap = useCallback(
    async (amount: bigint) => {
      if (!confidentialTokenAddress) return;
      if (!zamaReady) {
        setError("Connect wallet to wrap tokens");
        return;
      }
      setPending(true);
      setError(null);
      try {
        const token = zamaSDK.createToken(confidentialTokenAddress);
        const result = await token.shield(amount);
        setLastTx(result.txHash);
        window.dispatchEvent(
          new CustomEvent("zama:wrap-complete", { detail: { confidentialTokenAddress } }),
        );
      } catch (e) {
        setError(e instanceof Error ? e.message : "Wrap failed");
      } finally {
        setPending(false);
      }
    },
    [confidentialTokenAddress, zamaReady, zamaSDK],
  );

  const unwrap = useCallback(
    async (amount: bigint) => {
      if (!confidentialTokenAddress) return;
      if (!zamaReady) {
        setError("Connect wallet to unwrap tokens");
        return;
      }
      setPending(true);
      setError(null);
      try {
        const token = zamaSDK.createToken(confidentialTokenAddress);
        const result = await token.unshield(amount, {
          onUnwrapSubmitted: async (txHash) => {
            await savePendingUnshield(indexedDBStorage, confidentialTokenAddress, txHash);
          },
        });
        setLastTx(result.txHash);
        window.dispatchEvent(
          new CustomEvent("zama:wrap-complete", { detail: { confidentialTokenAddress } }),
        );
      } catch (e) {
        setError(e instanceof Error ? e.message : "Unwrap failed");
      } finally {
        setPending(false);
      }
    },
    [confidentialTokenAddress, zamaReady, zamaSDK],
  );

  return { wrap, unwrap, pending, error, lastTx };
}
