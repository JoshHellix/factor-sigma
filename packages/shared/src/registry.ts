import type { PublicClient } from "viem";
import {
  ERC20_ABI,
  LOCAL_REGISTRY_PAIRS,
  REGISTRY_ABI,
  type EnrichedTokenWrapperPair,
  type TokenWrapperPair,
  WRAPPERS_REGISTRY,
} from "./constants";

function pairKey(pair: Pick<TokenWrapperPair, "tokenAddress" | "confidentialTokenAddress">): string {
  return `${pair.tokenAddress.toLowerCase()}:${pair.confidentialTokenAddress.toLowerCase()}`;
}

function mergeLocalRegistryPairs(
  onchainPairs: TokenWrapperPair[],
  chainKey: keyof typeof WRAPPERS_REGISTRY,
): TokenWrapperPair[] {
  const merged = [...onchainPairs];
  const seen = new Set(merged.map(pairKey));

  for (const localPair of LOCAL_REGISTRY_PAIRS[chainKey]) {
    const key = pairKey(localPair);
    if (seen.has(key)) continue;
    merged.push({ ...localPair, isLocal: true });
    seen.add(key);
  }

  return merged;
}

export async function fetchAllRegistryPairs(
  publicClient: PublicClient,
  chainKey: keyof typeof WRAPPERS_REGISTRY,
): Promise<TokenWrapperPair[]> {
  const registry = WRAPPERS_REGISTRY[chainKey];
  const length = (await publicClient.readContract({
    address: registry,
    abi: REGISTRY_ABI,
    functionName: "getTokenConfidentialTokenPairsLength",
  })) as bigint;

  const pairs: TokenWrapperPair[] = [];

  if (length > 0n) {
    const pageSize = 50n;
    for (let start = 0n; start < length; start += pageSize) {
      const end = start + pageSize > length ? length : start + pageSize;
      const batch = (await publicClient.readContract({
        address: registry,
        abi: REGISTRY_ABI,
        functionName: "getTokenConfidentialTokenPairsSlice",
        args: [start, end],
      })) as Array<{
        tokenAddress: `0x${string}`;
        confidentialTokenAddress: `0x${string}`;
        isValid: boolean;
      }>;

      for (const p of batch) {
        pairs.push({
          tokenAddress: p.tokenAddress,
          confidentialTokenAddress: p.confidentialTokenAddress,
          isValid: p.isValid,
        });
      }
    }
  }

  return mergeLocalRegistryPairs(pairs.filter((p) => p.isValid), chainKey);
}

export async function enrichRegistryPairsWithMetadata(
  publicClient: PublicClient,
  pairs: TokenWrapperPair[],
): Promise<EnrichedTokenWrapperPair[]> {
  return Promise.all(
    pairs.map(async (pair) => {
      try {
        const [name, symbol, decimals] = await Promise.all([
          publicClient.readContract({
            address: pair.tokenAddress,
            abi: ERC20_ABI,
            functionName: "name",
          }) as Promise<string>,
          publicClient.readContract({
            address: pair.tokenAddress,
            abi: ERC20_ABI,
            functionName: "symbol",
          }) as Promise<string>,
          publicClient.readContract({
            address: pair.tokenAddress,
            abi: ERC20_ABI,
            functionName: "decimals",
          }) as Promise<number>,
        ]);
        return { ...pair, name, symbol, decimals };
      } catch {
        return { ...pair };
      }
    }),
  );
}

export async function fetchEnrichedRegistryPairs(
  publicClient: PublicClient,
  chainKey: keyof typeof WRAPPERS_REGISTRY,
): Promise<EnrichedTokenWrapperPair[]> {
  const pairs = await fetchAllRegistryPairs(publicClient, chainKey);
  return enrichRegistryPairsWithMetadata(publicClient, pairs);
}

export function shortenAddress(address: string, chars = 4): string {
  return `${address.slice(0, 2 + chars)}…${address.slice(-chars)}`;
}

export function formatUnits(value: bigint, decimals: number): string {
  const negative = value < 0n;
  const abs = negative ? -value : value;
  const str = abs.toString().padStart(decimals + 1, "0");
  const whole = str.slice(0, -decimals) || "0";
  const frac = str.slice(-decimals).replace(/0+$/, "");
  const formatted = frac ? `${whole}.${frac}` : whole;
  return negative ? `-${formatted}` : formatted;
}

/** ERC-20 decimals from enriched registry metadata; 6 only as last resort. */
export function resolvePairDecimals(pair: Pick<EnrichedTokenWrapperPair, "decimals">): number {
  return pair.decimals ?? 6;
}
