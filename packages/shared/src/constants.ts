/** Official Zama Confidential Token Wrappers Registry addresses */
export const WRAPPERS_REGISTRY = {
  sepolia: "0x2f0750Bbb0A246059d80e94c454586a7F27a128e" as const,
  mainnet: "0xeb5015fF021DB115aCe010f23F55C2591059bBA0" as const,
} as const;

export const ERC7984_INTERFACE_ID = "0x4958f2a4" as const;
export const ERC7984_WRAPPER_INTERFACE_ID = "0xd04584ba" as const;

export const CHAIN_IDS = {
  sepolia: 11155111,
  mainnet: 1,
} as const;

export type SupportedChainKey = keyof typeof WRAPPERS_REGISTRY;

export interface TokenWrapperPair {
  tokenAddress: `0x${string}`;
  confidentialTokenAddress: `0x${string}`;
  isValid: boolean;
  /** Set when the pair comes from LOCAL_REGISTRY_PAIRS rather than onchain registry. */
  isLocal?: boolean;
}

export interface EnrichedTokenWrapperPair extends TokenWrapperPair {
  name?: string;
  symbol?: string;
  decimals?: number;
}

/**
 * Dev-only or custom ERC-20 ↔ ERC-7984 pairs merged on top of the onchain Wrappers Registry.
 * See wrapper-registry/README.md for how to add entries.
 */
export const LOCAL_REGISTRY_PAIRS: Record<SupportedChainKey, TokenWrapperPair[]> = {
  sepolia: [],
  mainnet: [],
};

/** Matches @zama-fhe/sdk ConfidentialTokenWrappersRegistry ABI */
export const REGISTRY_ABI = [
  {
    type: "function",
    name: "getTokenConfidentialTokenPairsLength",
    inputs: [],
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "getTokenConfidentialTokenPairsSlice",
    inputs: [
      { name: "fromIndex", type: "uint256" },
      { name: "toIndex", type: "uint256" },
    ],
    outputs: [
      {
        name: "",
        type: "tuple[]",
        components: [
          { name: "tokenAddress", type: "address" },
          { name: "confidentialTokenAddress", type: "address" },
          { name: "isValid", type: "bool" },
        ],
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "getConfidentialTokenAddress",
    inputs: [{ name: "tokenAddress", type: "address" }],
    outputs: [
      { name: "", type: "bool" },
      { name: "", type: "address" },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "isConfidentialTokenValid",
    inputs: [{ name: "confidentialTokenAddress", type: "address" }],
    outputs: [{ name: "", type: "bool" }],
    stateMutability: "view",
  },
] as const;

export const ERC20_ABI = [
  {
    type: "function",
    name: "name",
    inputs: [],
    outputs: [{ type: "string" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "symbol",
    inputs: [],
    outputs: [{ type: "string" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "decimals",
    inputs: [],
    outputs: [{ type: "uint8" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "balanceOf",
    inputs: [{ name: "account", type: "address" }],
    outputs: [{ type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "mint",
    inputs: [
      { name: "to", type: "address" },
      { name: "amount", type: "uint256" },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
] as const;

/** Max underlying tokens per public mint call on official Sepolia cTokenMocks. */
export const FAUCET_MINT_CAP = 1_000_000_000_000n; // 1_000_000 tokens × 10^6 (legacy 6-decimal mocks)

/** Per-token mint cap: 1,000,000 whole tokens at the token's native decimals. */
export function faucetMintCapForDecimals(decimals: number): bigint {
  return 1_000_000n * 10n ** BigInt(decimals);
}
