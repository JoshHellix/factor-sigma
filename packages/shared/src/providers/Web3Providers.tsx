"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ZamaProvider, RelayerWeb, indexedDBStorage } from "@zama-fhe/react-sdk";
import type { GenericSigner, EIP712TypedData, TransactionReceipt, Address, Hex } from "@zama-fhe/sdk";
import { ViemSigner } from "@zama-fhe/sdk/viem";
import { SepoliaConfig, MainnetConfig } from "@zama-fhe/sdk";
import {
  WagmiProvider,
  createConfig,
  http,
  useAccount,
  usePublicClient,
  useWalletClient,
} from "wagmi";
import { mainnet, sepolia } from "wagmi/chains";
import { injected, metaMask, walletConnect } from "wagmi/connectors";
import type { ReactNode } from "react";
import { createContext, useContext, useMemo, useState } from "react";

const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID ?? "demo";

const DEFAULT_SEPOLIA_RPC = "https://ethereum-sepolia-rpc.publicnode.com";
const DEFAULT_MAINNET_RPC = "https://ethereum-rpc.publicnode.com";

export const wagmiConfig = createConfig({
  chains: [sepolia, mainnet],
  connectors: [
    metaMask({ dappMetadata: { name: "Zama Season 3" } }),
    injected({ shimDisconnect: true }),
    walletConnect({ projectId, showQrModal: false }),
  ],
  transports: {
    [sepolia.id]: http(process.env.NEXT_PUBLIC_SEPOLIA_RPC ?? DEFAULT_SEPOLIA_RPC),
    [mainnet.id]: http(process.env.NEXT_PUBLIC_MAINNET_RPC ?? DEFAULT_MAINNET_RPC),
  },
  ssr: true,
});

const ZamaReadyContext = createContext(false);

export function useZamaReady() {
  return useContext(ZamaReadyContext);
}

function buildRelayer(getChainId: () => Promise<number>) {
  const sepoliaRpc = process.env.NEXT_PUBLIC_SEPOLIA_RPC ?? DEFAULT_SEPOLIA_RPC;
  const mainnetRpc = process.env.NEXT_PUBLIC_MAINNET_RPC ?? DEFAULT_MAINNET_RPC;
  const relayerProxy = process.env.NEXT_PUBLIC_RELAYER_PROXY;

  const transports: Record<number, object> = {
    [sepolia.id]: {
      ...SepoliaConfig,
      network: sepoliaRpc,
      ...(relayerProxy ? { relayerUrl: `${relayerProxy}/${sepolia.id}` } : {}),
    },
    [mainnet.id]: {
      ...MainnetConfig,
      network: mainnetRpc,
      ...(relayerProxy ? { relayerUrl: `${relayerProxy}/${mainnet.id}` } : {}),
    },
  };

  return new RelayerWeb({ getChainId, transports });
}

type ReadContractFn = GenericSigner["readContract"];

class ReadonlyWagmiSigner {
  constructor(
    private readonly chainId: number,
    private readonly readContractFn: ReadContractFn,
  ) {}

  getChainId() {
    return Promise.resolve(this.chainId);
  }

  getAddress(): Promise<Address> {
    return Promise.reject(new Error("Connect wallet to continue"));
  }

  signTypedData(_typedData: EIP712TypedData): Promise<Hex> {
    return Promise.reject(new Error("Connect wallet to sign"));
  }

  writeContract(_config: unknown): Promise<Hex> {
    return Promise.reject(new Error("Connect wallet to submit transactions"));
  }

  readContract<T = unknown>(config: Parameters<ReadContractFn>[0]): Promise<T> {
    return this.readContractFn(config) as Promise<T>;
  }

  waitForTransactionReceipt(_hash: Hex): Promise<TransactionReceipt> {
    return Promise.reject(new Error("Connect wallet to submit transactions"));
  }
}

function ZamaBridge({ children }: { children: ReactNode }) {
  const { isConnected, chainId } = useAccount();
  const { data: walletClient } = useWalletClient();
  const publicClient = usePublicClient();

  const zama = useMemo(() => {
    const activeChainId = chainId ?? sepolia.id;
    const getChainId = () => Promise.resolve(activeChainId);

    if (isConnected && walletClient && publicClient) {
      const signer = new ViemSigner({ walletClient, publicClient });
      return {
        ready: true,
        signer,
        relayer: buildRelayer(() => signer.getChainId()),
      };
    }

    const readContract = async (config: Parameters<ReadContractFn>[0]) => {
      if (!publicClient) throw new Error("RPC unavailable");
      return publicClient.readContract({
        address: config.address,
        abi: config.abi as readonly unknown[],
        functionName: config.functionName as string,
        args: config.args as readonly unknown[],
      });
    };

    return {
      ready: false,
      signer: new ReadonlyWagmiSigner(activeChainId, readContract as ReadContractFn) as unknown as GenericSigner,
      relayer: buildRelayer(getChainId),
    };
  }, [chainId, isConnected, publicClient, walletClient]);

  return (
    <ZamaReadyContext.Provider value={zama.ready}>
      <ZamaProvider relayer={zama.relayer} signer={zama.signer} storage={indexedDBStorage}>
        {children}
      </ZamaProvider>
    </ZamaReadyContext.Provider>
  );
}

export function Web3Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <ZamaBridge>{children}</ZamaBridge>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
