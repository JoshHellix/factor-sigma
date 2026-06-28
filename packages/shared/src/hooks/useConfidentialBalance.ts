"use client";

import { useZamaSDK } from "@zama-fhe/react-sdk";
import { NoCiphertextError } from "@zama-fhe/sdk";
import { useCallback, useEffect, useState } from "react";
import type { Address } from "viem";
import { useZamaReady } from "../providers/Web3Providers";

export function useConfidentialBalance(tokenAddress?: Address) {
  const zamaSDK = useZamaSDK();
  const zamaReady = useZamaReady();
  const [balance, setBalance] = useState<bigint | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [neverShielded, setNeverShielded] = useState(false);

  useEffect(() => {
    setBalance(null);
    setError(null);
    setNeverShielded(false);
  }, [tokenAddress]);

  const decryptBalance = useCallback(
    async (overrideAddress?: Address) => {
      const target = overrideAddress ?? tokenAddress;
      if (!target) {
        setError("Select or paste a token address first");
        return;
      }
      if (!zamaReady) {
        setError("Connect wallet to decrypt balances");
        return;
      }
      setLoading(true);
      setError(null);
      setNeverShielded(false);
      try {
        const token = zamaSDK.createReadonlyToken(target);
        await token.allow();
        const value = await token.balanceOf();
        setBalance(value);
      } catch (e) {
        if (e instanceof NoCiphertextError) {
          setBalance(0n);
          setNeverShielded(true);
          return;
        }
        setError(e instanceof Error ? e.message : "Decryption failed");
      } finally {
        setLoading(false);
      }
    },
    [tokenAddress, zamaReady, zamaSDK],
  );

  return { balance, loading, error, neverShielded, decryptBalance };
}
