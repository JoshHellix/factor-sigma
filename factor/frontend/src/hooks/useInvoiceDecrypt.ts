"use client";

import { useZamaSDK } from "@zama-fhe/react-sdk";
import { useCallback, useState } from "react";
import { usePublicClient } from "wagmi";
import type { Hex } from "viem";
import { useZamaReady } from "@zama-season3/shared";
import { INVOICE_FACTORY_ABI } from "../lib/invoiceFactoryAbi";

type InvoiceField = "faceValue" | "fundedAmount" | "repaidAmount";

const FIELD_INDEX: Record<InvoiceField, number> = {
  faceValue: 5,
  fundedAmount: 6,
  repaidAmount: 7,
};

export function useInvoiceDecrypt(factoryAddress?: `0x${string}`) {
  const zamaSDK = useZamaSDK();
  const zamaReady = useZamaReady();
  const publicClient = usePublicClient();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const decryptField = useCallback(
    async (invoiceId: bigint, field: InvoiceField): Promise<bigint> => {
      if (!factoryAddress) throw new Error("Factory address not configured");
      if (!zamaReady) throw new Error("Connect wallet to decrypt invoice amounts");
      if (!publicClient) throw new Error("RPC unavailable");

      setLoading(true);
      setError(null);
      try {
        const inv = (await publicClient.readContract({
          address: factoryAddress,
          abi: INVOICE_FACTORY_ABI,
          functionName: "getInvoice",
          args: [invoiceId],
        })) as readonly unknown[];

        const handle = inv[FIELD_INDEX[field]] as Hex;
        await zamaSDK.allow([factoryAddress]);
        const result = await zamaSDK.userDecrypt([{ handle, contractAddress: factoryAddress }]);
        return (result[handle] as bigint | undefined) ?? 0n;
      } catch (e) {
        const msg = e instanceof Error ? e.message : "Decryption failed";
        setError(msg);
        throw e;
      } finally {
        setLoading(false);
      }
    },
    [factoryAddress, publicClient, zamaReady, zamaSDK],
  );

  return { decryptField, loading, error };
}
