"use client";

import { useZamaSDK } from "@zama-fhe/react-sdk";
import { useCallback, useState } from "react";
import { useAccount, usePublicClient, useWriteContract } from "wagmi";
import type { Hex } from "viem";
import { toHex } from "viem";
import { useZamaReady } from "@zama-season3/shared";
import { INVOICE_FACTORY_ABI } from "../lib/invoiceFactoryAbi";

function toEncryptedArgs(encrypted: { handles: readonly unknown[]; inputProof: unknown }): [Hex, Hex] {
  const handle = (typeof encrypted.handles[0] === "string"
    ? encrypted.handles[0]
    : toHex(encrypted.handles[0] as Uint8Array)) as Hex;
  const proof = (typeof encrypted.inputProof === "string"
    ? encrypted.inputProof
    : toHex(encrypted.inputProof as Uint8Array)) as Hex;
  return [handle, proof];
}

export function useInvoiceFactory(factoryAddress?: `0x${string}`) {
  const { address } = useAccount();
  const zamaSDK = useZamaSDK();
  const zamaReady = useZamaReady();
  const publicClient = usePublicClient();
  const { writeContractAsync } = useWriteContract();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastTx, setLastTx] = useState<string | null>(null);

  const createInvoice = useCallback(
    async (debtor: `0x${string}`, fundingToken: `0x${string}`, dueDate: bigint, faceValue: bigint) => {
      if (!factoryAddress || !address) throw new Error("Connect wallet and set factory address");
      if (!zamaReady) throw new Error("Connect wallet to encrypt invoice data");
      setPending(true);
      setError(null);
      try {
        const encrypted = await zamaSDK.relayer.encrypt({
          contractAddress: factoryAddress,
          userAddress: address,
          values: [{ value: faceValue, type: "euint64" }],
        });

        const [handle, proof] = toEncryptedArgs(encrypted);

        const hash = await writeContractAsync({
          address: factoryAddress,
          abi: INVOICE_FACTORY_ABI,
          functionName: "createInvoice",
          args: [debtor, fundingToken, dueDate, handle, proof],
        });

        if (publicClient) await publicClient.waitForTransactionReceipt({ hash });
        setLastTx(hash);
        return hash;
      } catch (e) {
        const msg = e instanceof Error ? e.message : "Create invoice failed";
        setError(msg);
        throw e;
      } finally {
        setPending(false);
      }
    },
    [address, factoryAddress, publicClient, writeContractAsync, zamaReady, zamaSDK.relayer],
  );

  const fundInvoice = useCallback(
    async (invoiceId: bigint, fundAmount: bigint) => {
      if (!factoryAddress || !address) throw new Error("Connect wallet");
      if (!zamaReady) throw new Error("Connect wallet to encrypt fund amount");
      setPending(true);
      setError(null);
      try {
        const encrypted = await zamaSDK.relayer.encrypt({
          contractAddress: factoryAddress,
          userAddress: address,
          values: [{ value: fundAmount, type: "euint64" }],
        });

        const [handle, proof] = toEncryptedArgs(encrypted);

        const hash = await writeContractAsync({
          address: factoryAddress,
          abi: INVOICE_FACTORY_ABI,
          functionName: "fundInvoice",
          args: [invoiceId, handle, proof],
        });

        if (publicClient) await publicClient.waitForTransactionReceipt({ hash });
        setLastTx(hash);
        return hash;
      } catch (e) {
        const msg = e instanceof Error ? e.message : "Fund invoice failed";
        setError(msg);
        throw e;
      } finally {
        setPending(false);
      }
    },
    [address, factoryAddress, publicClient, writeContractAsync, zamaReady, zamaSDK.relayer],
  );

  const recordRepayment = useCallback(
    async (invoiceId: bigint, repayAmount: bigint) => {
      if (!factoryAddress || !address) throw new Error("Connect wallet");
      if (!zamaReady) throw new Error("Connect wallet to encrypt repayment amount");
      setPending(true);
      setError(null);
      try {
        const encrypted = await zamaSDK.relayer.encrypt({
          contractAddress: factoryAddress,
          userAddress: address,
          values: [{ value: repayAmount, type: "euint64" }],
        });

        const [handle, proof] = toEncryptedArgs(encrypted);

        const hash = await writeContractAsync({
          address: factoryAddress,
          abi: INVOICE_FACTORY_ABI,
          functionName: "recordRepayment",
          args: [invoiceId, handle, proof],
        });

        if (publicClient) await publicClient.waitForTransactionReceipt({ hash });
        setLastTx(hash);
        return hash;
      } catch (e) {
        const msg = e instanceof Error ? e.message : "Repayment failed";
        setError(msg);
        throw e;
      } finally {
        setPending(false);
      }
    },
    [address, factoryAddress, publicClient, writeContractAsync, zamaReady, zamaSDK.relayer],
  );

  return { createInvoice, fundInvoice, recordRepayment, pending, error, lastTx };
}
